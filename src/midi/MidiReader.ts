import { MidiHeaderValidationError, MidiSystemExclusiveEventsError, MidiTrackHeaderValidationError } from "../exceptions";
import BinContentReader from "./BinContentReader";
import Midi from "./Midi";
import MidiFormatType, { MetaEventType, RegularEventType } from "./MidiFormatType";
import { CustomMetaEvent, NoteEvent, NoteOffEvent, NoteOnEvent, NumberMetaEvent, RegularEvent, SmpteOffsetMetaEvent, TextMetaEvent, TimeSignatureMetaEvent } from "./NoteEvent";

export default class MidiReader extends BinContentReader {
	private midi: Midi;
	
	constructor(midi: Midi) {
		super(midi.content);
		this.midi = midi;
		this.readHeader();
		this.readTracks();
	}
	
	private readHeader(): void {
		if (this.readByte(4) !== 0x4D546864) // MThd - Midi Type Header
			throw new MidiHeaderValidationError();
		this.readByte(4); // 文件头字节长度（舍弃）
		this.midi.formatType = this.readByte(2); // MIDI 文件格式类型
		this.midi.trackCount = this.readByte(2); // 轨道数目
		let timeDivisionByte1 = this.readByte(1), timeDivisionByte2 = this.readByte(1); // 时分数据。
		if (timeDivisionByte1 & 0b1000_0000) // 基本时间格式 (fps 或 tpf)
			this.midi.timeDivision = [
				timeDivisionByte1 & 0b0111_1111, // 帧每秒 (frames per second) 模式 (第 1 字节)
				timeDivisionByte2, // 基本时间每帧 (ticks in each frame) (第 2 字节)
			];
		else this.midi.timeDivision = (timeDivisionByte1 << 8) + timeDivisionByte2; // 基本时间每拍 (ticks per beat) 模式 (2 字节)
	}
	
	private readTracks(): void {
		while (!this.isReadOver()) {
			let headerValidation = this.readByte(4);
			if (headerValidation === -1) break; // 读完了。
			if (headerValidation !== 0x4D54726B) { // MTrk - Midi Track
				throw new MidiTrackHeaderValidationError();
			}
			this.readByte(4); // 当前轨道字节长度（舍弃）
			const track = new MidiTrack();
			this.midi.tracks.push(track);
			this.readNotes(track);
			if (this.readByteFrom(this.pointer) === 0x0) this.movePointer(1);
		}
	}
	
	private readNotes(track: MidiTrack): void {
		while (!this.isReadOver()) {
			let deltaTime = this.readDeltaTime();
			let statusByte = this.readByte(1);
			if (statusByte === -1) break;
			let note: NoteEvent | null = null;
			if (statusByte === 0xff) { // 元数据事件
				const metaType: MetaEventType = this.readByte(1);
				const metaEventLength = this.readDeltaTime();
				switch (metaType) {
					case MetaEventType.END_OF_TRACK:
					case MetaEventType.END_OF_FILE:
						return;
					case MetaEventType.TEXT_EVENT:
					case MetaEventType.COPYRIGHT_NOTICE:
					case MetaEventType.TRACK_NAME:
					case MetaEventType.INSTRUMENT_NAME:
					case MetaEventType.LYRICS:
					case MetaEventType.MARKER:
					case MetaEventType.CUE_POINT:
						const textContent = this.readString(metaEventLength);
						note = new TextMetaEvent(metaType, textContent);
						if (metaType === MetaEventType.TRACK_NAME)
							track.setName(textContent);
						else if (metaType === MetaEventType.INSTRUMENT_NAME)
							track.setInstrument(textContent);
						break;
					case MetaEventType.MIDI_PORT: // 长度一般为 1
					case MetaEventType.MIDI_PORT_2: // 长度一般为 1
					case MetaEventType.KEY_SIGNATURE: // 长度一般为 2
					case MetaEventType.SET_TEMPO: // 长度一般为 3
						const numberValue = this.readByte(metaEventLength);
						note = new NumberMetaEvent(metaType, numberValue);
						if (metaType === MetaEventType.MIDI_PORT || metaType === MetaEventType.MIDI_PORT_2)
							track.setMidiPort(numberValue);
						else if (metaType === MetaEventType.SET_TEMPO)
							track.setTempo(numberValue);
						break;
					case MetaEventType.SMPTE_OFFSET: // 长度一般为 5
						const smpteOffset = this.readByteArray(metaEventLength);
						note = new SmpteOffsetMetaEvent(smpteOffset);
						break;
					case MetaEventType.TIME_SIGNATURE: // 长度一般为 4
						const timeSignature = this.readByteArray(metaEventLength);
						note = new TimeSignatureMetaEvent(timeSignature);
						break;
					default: // 自定义事件
						const customValue = this.readByteArray(metaEventLength);
						note = new CustomMetaEvent(metaType, customValue)
						break;
				}
			} else { // 标准事件
				const regularType: RegularEventType = statusByte >> 4; // 只取前半字节
				switch (regularType) {
					case RegularEventType.NOTE_AFTERTOUCH:
					case RegularEventType.CONTROLLER:
					case RegularEventType.PITCH_BEND_EVENT:
					case RegularEventType.NOTE_OFF:
					case RegularEventType.NOTE_ON:
						const byte2 = this.readByteArray(2); // 读两位
						if (regularType == RegularEventType.NOTE_ON)
							note = new NoteOnEvent(byte2);
						else if (regularType == RegularEventType.NOTE_OFF)
							note = new NoteOffEvent(byte2);
						else
							note = new RegularEvent(regularType, byte2); // 其它事件暂时无需求而忽略
						break;
					case RegularEventType.PROGRAM_CHANGE:
					case RegularEventType.CHANNEL_AFTERTOUCH:
						const byte1 = this.readByteArray(1); // 读一位
						note = new RegularEvent(regularType, byte1);
					case RegularEventType.END_OF_FILE:
						return;
					default:
						throw new MidiSystemExclusiveEventsError(); // 自定义事件。读不了。
				}
			}
			if (note !== null) {
				note.deltaTime = deltaTime;
				track.push(note);
			}
		}
	}
	
	/**
	 * 读取事件时间间隔（不定长数字）。
	 * @returns 事件时间间隔。
	 */
	protected readDeltaTime(): number {
		let value = 0;
		let isLowByte = false;
		while (!(this.isReadOver() || isLowByte)) {
			value <<= 7;
			const b = this.readByte(1); // 来自 ECMAScript 3 的 ExtendScript 会认为 byte 是保留字。
			if (!(b & 0b1000_0000)) isLowByte = true;
			value += b & 0b0111_1111;
		}
		return value;
	}
}

export class MidiTrack { // extends Array<NoteEvent> // extends 有风险。
	private events: NoteEvent[] = [];
	length: number = 0;
	
	private name?: string;
	private instrument?: string;
	private midiPort?: number;
	private tempo?: number; // 微秒每拍
	
	// 以下全部没法用 setter 属性。
	setName(value: string) { this.name ??= value; }
	setInstrument(value: string) { this.instrument ??= value; }
	setMidiPort(value: number) { this.midiPort ??= value; }
	setTempo(value: number) { this.tempo ??= value; }
	
	bpm() {
		if (this.tempo === undefined) return undefined;
		return 6e7 / this.tempo;
	}
	
	push(item: NoteEvent) {
		(this as any)[this.events.length] = item;
		this.events.push(item);
		this.length = this.events.length;
	}
}
