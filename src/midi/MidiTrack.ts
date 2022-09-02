import { EndOfTrackPositionError, MidiCustomEventsError } from "../errors";
import { MetaEventType, RegularEventType } from "./MidiFormatType";
import MidiReader from "./MidiReader";
import { ControllerEvent, CustomMetaEvent, NoteEvent, NoteOffEvent, NoteOnEvent, NumberMetaEvent, RegularEvent, SmpteOffsetMetaEvent, SystemExclusiveEvents, TextMetaEvent, TimeSignatureMetaEvent } from "./NoteEvent";
import uiStr from "../languages/ui-str";

export default class MidiTrack {
	// extends Array<NoteEvent> // 继承后绑定不上对象
	
	private parent: MidiReader;
	private offset: number;
	private size: number;
	
	events: NoteEvent[] = [];
	length(): number { return this.events.length; };
	
	constructor(parent: MidiReader, offset: number, size: number) {
		this.parent = parent;
		this.offset = offset;
		this.size = size;
		
		this.readNotes();
	}

	name?: string;
	instrument?: string; // MIDI 存储的乐器信息在 Program Change 事件中，至于那个 Instrument Name 事件？抱歉没用的。
	channel?: number;
	tempo?: number; // 微秒每拍
	noteCount: number = 0;
	lengthTick: number = 0; // 此处表示轨道的持续时间。

	// 以下全部没法用 setter 属性。
	setName(value: string) { this.name ??= value; }
	setInstrument(value: string) { this.instrument ??= value; }
	setChannel(value: number) { this.channel ??= value; }
	setTempo(value: number) { this.tempo ??= value; this.parent.midi.bpm ??= this.bpm(); }

	bpm() {
		if (this.tempo === undefined) return undefined;
		let bpm = 6e7 / this.tempo;
		return parseFloat(bpm.toFixed(2));
	}

	push(item: NoteEvent) {
		this.events.push(item);
	}

	private splice = [].splice;
	
	private readNotes(): void {
		const endOffset = this.offset + this.size;
		const noteOnStack: NoteOnEvent[] = []; // 音符开事件栈，用于匹配音符关事件。为什么是栈而不是队列？这与 FL Studio 相匹配。
		let statusByte: number;
		while (!(this.parent.isReadOver() || this.parent.getPointer() >= endOffset)) {
			const deltaTime = this.parent.readDeltaTime();
			const sofarTick = this.lengthTick += deltaTime;
			const lastStatusByte = statusByte!; // 当 statusByte 最高二进制位不为 1（即 statusByte < 128），表示与前一次状态相同。
			statusByte = this.parent.readByte(1);
			if (statusByte === -1) break;
			else if (!(statusByte & 0b1000_0000)) {
				statusByte = lastStatusByte;
				this.parent.movePointer(-1);
			}
			let note: NoteEvent | null = null;
			if (statusByte === 0xff) { // 元数据事件
				const metaType: MetaEventType = this.parent.readByte(1);
				const metaEventLength = this.parent.readDeltaTime();
				switch (metaType) {
					case MetaEventType.END_OF_TRACK:
						if (this.parent.getPointer() !== endOffset)
							new EndOfTrackPositionError(endOffset, this.parent.getPointer());
					case MetaEventType.END_OF_FILE:
						return;
					case MetaEventType.TEXT_EVENT:
					case MetaEventType.COPYRIGHT_NOTICE:
					case MetaEventType.TRACK_NAME:
					case MetaEventType.INSTRUMENT_NAME:
					case MetaEventType.LYRICS:
					case MetaEventType.MARKER:
					case MetaEventType.CUE_POINT:
						const textContent = this.parent.readString(metaEventLength);
						note = new TextMetaEvent(metaType, textContent);
						if (metaType === MetaEventType.TRACK_NAME)
							this.setName(textContent);
						else if (metaType === MetaEventType.INSTRUMENT_NAME)
							this.setInstrument(textContent);
						break;
					case MetaEventType.MIDI_PORT: // 长度一般为 1
					case MetaEventType.MIDI_PORT_2: // 长度一般为 1
					case MetaEventType.KEY_SIGNATURE: // 长度一般为 2
					case MetaEventType.SET_TEMPO: // 长度一般为 3
						const numberValue = this.parent.readByte(metaEventLength);
						note = new NumberMetaEvent(metaType, numberValue);
						if (metaType === MetaEventType.SET_TEMPO)
							this.setTempo(numberValue);
						break;
					case MetaEventType.SMPTE_OFFSET: // 长度一般为 5
						const smpteOffset = this.parent.readByteArray(metaEventLength);
						note = new SmpteOffsetMetaEvent(smpteOffset);
						break;
					case MetaEventType.TIME_SIGNATURE: // 长度一般为 4
						const timeSignature = this.parent.readByteArray(metaEventLength);
						note = new TimeSignatureMetaEvent(timeSignature);
						break;
					default: // 自定义事件
						const customValue = this.parent.readByteArray(metaEventLength);
						note = new CustomMetaEvent(metaType, customValue)
						break;
				}
			} else { // 常规事件
				this.setChannel((statusByte & 0x0f) + 1); // 后半字节表示通道编号。
				const regularType: RegularEventType = statusByte >> 4; // 只取前半字节。
				switch (regularType) {
					case RegularEventType.NOTE_AFTERTOUCH:
					case RegularEventType.CONTROLLER:
					case RegularEventType.PITCH_BEND_EVENT:
					case RegularEventType.NOTE_OFF:
					case RegularEventType.NOTE_ON:
						const byte2 = this.parent.readByteArray(2); // 读两位
						if (regularType == RegularEventType.NOTE_ON) {
							note = new NoteOnEvent(byte2);
							const noteOn = note as NoteOnEvent;
							this.noteCount++;
							for (const prevNoteOn of noteOnStack)
								if (prevNoteOn.interruptDuration === undefined)
									if (sofarTick <= prevNoteOn.sofarTick) noteOn.interruptDuration = 0;
									else prevNoteOn.interruptDuration = sofarTick - prevNoteOn.sofarTick; // 中断复音上的其它音符开。
							noteOnStack.push(noteOn);
						} else if (regularType == RegularEventType.NOTE_OFF) {
							note = new NoteOffEvent(byte2);
							const noteOff = note as NoteOffEvent;
							for (let i = noteOnStack.length - 1; i >= 0; i--) {
								const noteOn = noteOnStack[i];
								if (noteOn.pitch === noteOff.pitch) {
									noteOn.duration = sofarTick - noteOn.sofarTick; // 计算音符时长。
									noteOn.noteOff = noteOff;
									noteOff.noteOn = noteOn; // 将两个音符关联在一起。
									noteOnStack.splice(i, 1); // 移出栈。
									break;
								}
							}
						} else if (regularType == RegularEventType.CONTROLLER) {
							note = new ControllerEvent(byte2);
						} else {
							note = new RegularEvent(regularType, byte2); // 其它事件暂时无需求而忽略。
						}
						break;
					case RegularEventType.PROGRAM_CHANGE:
					case RegularEventType.CHANNEL_AFTERTOUCH:
						const byte1 = this.parent.readByteArray(1); // 读一位
						note = new RegularEvent(regularType, byte1);
						break;
					case RegularEventType.END_OF_FILE:
						return;
					case RegularEventType.SYSTEM_EXCLUSIVE_EVENTS:
						const systemExclusiveEventLength = this.parent.readDeltaTime();
						note = new SystemExclusiveEvents(this.parent.readByteArray(systemExclusiveEventLength));
						break;
					default: // 自定义事件，不知道怎么读。
						throw new MidiCustomEventsError();
				}
			}
			if (note !== null) {
				note.deltaTime = deltaTime;
				note.sofarTick = sofarTick;
				this.push(note);
			}
		}
	}
	
	/**
	 * 表示标识当前轨道的名称。
	 * 用于在界面当中显示。
	 * @returns 标识当前轨道的名称。
	 */
	toString(): string {
		let description = `${localize(uiStr.channel_abbr)} ${this.channel ?? 0}`;
		if (this.name) description += ": " + this.name;
		description += ` (${this.noteCount})`;
		return description;
	}
	
	/**
	 * 返回当前指针的偏移量。
	 * 只是为了调试更方便。
	 * @returns 当前指针的偏移量。
	 */
	getPointer() { return this.parent.getPointer(); }
}
