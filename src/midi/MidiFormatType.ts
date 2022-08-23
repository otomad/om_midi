/**
 * MIDI 文件格式类型。
 */
enum MidiFormatType {
	/**
	 * MIDI 文件只有一条轨道，所有的通道都在一条轨道中。
	 */
	SINGLE_TRACK,
	/**
	 * MIDI 文件有多个音轨，并且是同步的，即所有的轨道同时播放。
	 */
	SYNC_MULTI_TRACK,
	/**
	 * MIDI 文件有多个音轨，不同步。
	 */
	ASYNC_MULTI_TRACK,
};

export enum MetaEventType {
	// 结束
	END_OF_TRACK = 0x2F,
	END_OF_FILE = -1,
	
	// 读字符串
	TEXT_EVENT = 0x01,
	COPYRIGHT_NOTICE = 0x02,
	TRACK_NAME = 0x03,
	INSTRUMENT_NAME = 0x04,
	LYRICS = 0x05,
	MARKER = 0x06,
	CUE_POINT = 0x07,
	
	// 读一位数字
	MIDI_PORT = 0x21,
	MIDI_PORT_2 = 0x20, // 两个版本？
	SET_TEMPO = 0x51,
	KEY_SIGNATURE = 0x59,
	
	SMPTE_OFFSET = 0x54,
	TIME_SIGNATURE = 0x58,
	SEQUENCER_SPECIFIC = 0x7F,
}

export enum RegularEventType {
	SYSTEM_EXCLUSIVE_EVENTS = 0xF,
	NOTE_AFTERTOUCH = 0xA,
	CONTROLLER = 0xB,
	PITCH_BEND_EVENT = 0xE,
	NOTE_OFF = 0x8,
	NOTE_ON = 0x9,
	PROGRAM_CHANGE = 0xC,
	CHANNEL_AFTERTOUCH = 0xD,
	END_OF_FILE = -1,
}

export default MidiFormatType;

