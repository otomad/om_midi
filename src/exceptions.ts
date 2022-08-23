class MyError extends Error {
	constructor(msg: string) {
		alert(msg);
		super(msg);
	}
}

export class CannotFindWindowError extends MyError {
	constructor() {
		super("错误：无法找到或创建窗口。");
	}
}

export class UnsupportedSettingTypeError extends MyError {
	constructor() {
		super("错误：不支持的设置数据类型。");
	}
}

export class FileUnreadableError extends MyError {
	constructor() {
		super("错误：无法读取 MIDI 文件。该文件可能已占用或不存在。")
	}
}

export class MidiHeaderValidationError extends MyError {
	constructor() {
		super("错误：MIDI 文件头验证失败（不是标准 MIDI 文件或文件已损坏）。")
	}
}

export class MidiTrackHeaderValidationError extends MyError {
	constructor() {
		super("错误：MIDI 轨道块标头验证失败。")
	}
}

export class MidiSystemExclusiveEventsError extends MyError {
	constructor() {
		super("错误：自定义 MIDI 事件无法读取。")
	}
}
