import { ControllerType, MetaEventType, RegularEventType } from "./MidiFormatType";

export class NoteEvent {
	deltaTime: number = 0; // 与前一项间隔基本时间。
	sofarTick: number = 0; // 至乐曲开始的基本时间。
}

export class MetaEvent extends NoteEvent {
	type: MetaEventType = 0;
	
	constructor(type: MetaEventType) {
		super();
		this.type = type;
	}
}

export class TextMetaEvent extends MetaEvent {
	content: string;
	
	constructor(type: MetaEventType, content: string) {
		super(type);
		this.content = content;
	}
}

export class NumberMetaEvent extends MetaEvent {
	value: number;

	constructor(type: MetaEventType, value: number) {
		super(type);
		this.value = value;
	}
}

export class SmpteOffsetMetaEvent extends MetaEvent {
	hour: number;
	min: number;
	sec: number;
	fr: number;
	subFr: number;
	
	constructor(smpteOffset: number[]) {
		super(MetaEventType.SMPTE_OFFSET);
		this.hour = smpteOffset[0];
		this.min = smpteOffset[1];
		this.sec = smpteOffset[2];
		this.fr = smpteOffset[3];
		this.subFr = smpteOffset[4];
	}
}

export class TimeSignatureMetaEvent extends MetaEvent {
	number: number; // 分子
	denom: number; // 分母。2 的几次幂。
	metro: number; // 每个 MIDI 时钟包含的基本时间数。一般是 24。
	thirtySeconds: number; // 每 24 个 MIDI 时钟对应的 32 分音符的数目。一般是 8。
	
	constructor(timeSignature: number[]) {
		super(MetaEventType.TIME_SIGNATURE);
		this.number = timeSignature[0];
		this.denom = timeSignature[1];
		this.metro = timeSignature[2];
		this.thirtySeconds = timeSignature[3];
	}
	
	toString() {
		return this.number + "/" + 2 ** this.denom;
	}
}

export class CustomMetaEvent extends MetaEvent {
	value: number[];
	
	constructor(type: MetaEventType, values: number[]) {
		super(type);
		this.value = values;
	}
}

export class RegularEvent extends NoteEvent {
	type: RegularEventType;
	values: number[];
	
	constructor(type: RegularEventType, values: number[]) {
		super();
		this.type = type;
		this.values = values;
	}
}

abstract class NoteOnOffEvent extends RegularEvent {
	pitch: number;
	velocity: number;
	
	constructor(type: RegularEventType, values: number[]) {
		super(type, values);
		this.pitch = values[0];
		this.velocity = values[1];
	}
}

export class NoteOnEvent extends NoteOnOffEvent {
	noteOff?: NoteOffEvent;
	duration?: number; // note-off？尝试将时长赋值给 note-on！
	interruptDuration?: number; // 单轨音 MAD 特殊用途。当有复音时中断前一个音的音符开。
	
	constructor(pitch: number, velocity: number, deltaTime: number, duration: number, sofarTick: number);
	constructor(values: number[]);
	constructor(values: number[] | number, velocity?: number, deltaTime?: number, duration?: number, sofarTick?: number) {
		if (values instanceof Array)
			super(RegularEventType.NOTE_ON, values);
		else {
			super(RegularEventType.NOTE_ON, [values, velocity!])
			this.deltaTime = deltaTime!;
			this.duration = duration!;
			this.sofarTick = sofarTick!;
		}
	}
}

export class NoteOffEvent extends NoteOnOffEvent {
	noteOn?: NoteOnEvent;
	
	constructor(values: number[]) {
		super(RegularEventType.NOTE_OFF, values);
	}
}

export class SystemExclusiveEvent extends RegularEvent {
	constructor(values: number[]) {
		super(RegularEventType.SYSTEM_EXCLUSIVE_EVENTS, values);
	}
}

export class ControllerEvent extends RegularEvent {
	controller: ControllerType;
	value: number;
	
	constructor(values: number[]) {
		super(RegularEventType.CONTROLLER, values);
		this.controller = values[0];
		this.value = values[1];
	}
}

export class PitchBendEvent extends RegularEvent {
	value: number;
	
	constructor(values: number[]) {
		super(RegularEventType.PITCH_BEND_EVENT, values);
		this.value = PitchBendEvent.take7Bit(values[1]) << 7 | PitchBendEvent.take7Bit(values[0]);
	}
	
	/**
	 * 取后 7 位。
	 * @param b - 1 个字节。
	 * @returns 后 7 位。
	 */
	private static take7Bit(b: number) {
		return b & 0b0111_1111;
	}
}
