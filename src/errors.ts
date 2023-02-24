import uiStr from "./languages/ui-str";

export class MyError extends Error {
	isMyError = true;
	
	constructor(msg: Error);
	constructor(msg: string);
	constructor(msg: string | Error) {
		// 如果参数就是一个 MyError，就不用再警告了。
		if (typeof msg === "string" || !(msg instanceof MyError)) 
			alert(msg.toString(), localize(uiStr.error), true);
		super(msg.toString());
		this.__proto__ = new.target.prototype;
	}
}

export class CannotFindWindowError extends MyError {
	constructor() {
		super(localize(uiStr.cannot_find_window_error));
	}
}

export class UnsupportedSettingTypeError extends MyError {
	constructor() {
		super(localize(uiStr.unsupported_setting_type_error));
	}
}

export class FileUnreadableError extends MyError {
	constructor() {
		super(localize(uiStr.file_unreadable_error));
	}
}

export class MidiHeaderValidationError extends MyError {
	constructor() {
		super(localize(uiStr.midi_header_validation_error));
	}
}

export class MidiTrackHeaderValidationError extends MyError {
	constructor() {
		super(localize(uiStr.midi_track_header_validation_error));
	}
}

export class MidiCustomEventsError extends MyError {
	constructor() {
		super(localize(uiStr.midi_custom_events_error));
	}
}

export class MidiNoTrackError extends MyError {
	constructor() {
		super(localize(uiStr.midi_no_track_error));
	}
}

export class NotAfterEffectsError extends MyError {
	constructor() {
		super(localize(uiStr.not_after_effects_error));
	}
}

export class CannotCreateFileError extends MyError {
	constructor() {
		super(localize(uiStr.cannot_create_file_error));
	}
}

export class CannotFindCompositionError extends MyError {
	constructor() {
		super(localize(uiStr.cannot_find_composition_error));
	}
}

export class NoMidiError extends MyError {
	constructor() {
		super(localize(uiStr.no_midi_error));
	}
}

export class NoOptionsCheckedError extends MyError {
	constructor() {
		super(localize(uiStr.no_options_checked_error));
	}
}

export class NoLayerSelectedError extends MyError {
	constructor() {
		super(localize(uiStr.no_layer_selected_error));
	}
}

export class NotOneTrackForApplyEffectsOnlyError extends MyError {
	constructor() {
		super(localize(uiStr.not_one_track_for_apply_effects_only_error));
	}
}

export class EndOfTrackPositionError extends MyError {
	constructor(endOffset: number, pointer: number) {
		super(localize(uiStr.end_of_track_position_error, endOffset, pointer));
	}
}

export class CannotSetTimeRemapError extends MyError {
	constructor() {
		super(localize(uiStr.cannot_set_time_remap_error));
	}
}

export class CannotTuningError extends MyError {
	constructor() {
		super(localize(uiStr.cannot_tuning_error));
	}
}

export class UnsupportedFpsTimeDivisionError extends MyError {
	constructor() {
		super(localize(uiStr.unsupported_fps_time_division_error));
	}
}

export class LowVersionError extends MyError {
	constructor() {
		super(localize(uiStr.low_version_error));
	}
}

export class HasNoVideoError extends MyError {
	constructor() {
		super(localize(uiStr.has_no_video_error));
	}
}

export class InvalidMappingVelocityValuesError extends MyError {
	constructor() {
		super(localize(uiStr.invalid_mapping_velocity_values_error));
	}
}
