import uiStr from "./languages/uiStr";

export class MyError extends Error {
	constructor(msg: Error);
	constructor(msg: string);
	constructor(msg: string | Error) {
		alert(msg.toString(), localize(uiStr.error), true);
		super(msg.toString());
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
		super("错误：无法读取 MIDI 文件。该文件可能已占用或不存在。");
	}
}

export class MidiHeaderValidationError extends MyError {
	constructor() {
		super("错误：MIDI 文件头验证失败（不是标准 MIDI 文件或文件已损坏）。");
	}
}

export class MidiTrackHeaderValidationError extends MyError {
	constructor() {
		super("错误：MIDI 轨道块标头验证失败。");
	}
}

export class MidiCustomEventsError extends MyError {
	constructor() {
		super("错误：自定义 MIDI 事件无法读取。");
	}
}

export class MidiNoTrackError extends MyError {
	constructor() {
		super("错误：该 MIDI 文件不包含任何有效轨道。");
	}
}

export class NotAfterEffectsError extends MyError {
	constructor() {
		super("错误：请在 Adobe After Effects 上使用此脚本。");
	}
}

export class CannotCreateFileError extends MyError {
	constructor() {
		super("错误：无法创建文件。");
	}
}

export class CannotFindCompositionError extends MyError {
	constructor() {
		super("错误：无法找到活动合成。请先激活一个合成。");
	}
}

export class NoMidiError extends MyError {
	constructor() {
		super("错误：请先打开一个有效的 MIDI 文件。")
	}
}

export class NoOptionsCheckedError extends MyError {
	constructor() {
		super("错误：请至少勾选一个项目。");
	}
}

export class NoLayerSelectedError extends MyError {
	constructor() {
		super("错误：在当前合成中未选中任何图层。");
	}
}

export class NotOneTrackForApplyEffectsOnlyError extends MyError {
	constructor() {
		super("错误：应用效果只能同时选择一条轨道。");
	}
}

export class EndOfTrackPositionError extends MyError {
	constructor(endOffset: number, pointer: number) {
		super(`错误：轨道结束位置有误。应为 ${endOffset}，实际 ${pointer}`);
	}
}

export class CannotSetTimeRemapError extends MyError {
	constructor() {
		super("错误：所选图层不能设置时间重映射。");
	}
}

export class CannotTuningError extends MyError {
	constructor() {
		super("错误：所选图层不包含音频，不能进行调音。");
	}
}
