import { MetaEventType, RegularEventType } from "./MidiFormatType";

export class NoteEvent {
	deltaTime: number = 0;
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
	value: number[];
	
	constructor(type: RegularEventType, values: number[]) {
		super();
		this.type = type;
		this.value = values;
	}
}

class NoteOnOffEvent extends RegularEvent {
	pitch() { return this.value[0]; }
	velocity() { return this.value[1]; }
}

export class NoteOnEvent extends NoteOnOffEvent {
	constructor(values: number[]) {
		super(RegularEventType.NOTE_ON, values);
	}
}

export class NoteOffEvent extends NoteOnOffEvent {
	constructor(values: number[]) {
		super(RegularEventType.NOTE_OFF, values);
	}
}

export class SystemExclusiveEvents extends RegularEvent {
	constructor(values: number[]) {
		super(RegularEventType.SYSTEM_EXCLUSIVE_EVENTS, values);
	}
}
