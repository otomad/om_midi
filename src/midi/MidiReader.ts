import { MidiHeaderValidationError, MidiTrackHeaderValidationError } from "../errors";
import BinContentReader from "./BinContentReader";
import BinFileReader from "./BinFileReader";
import Midi from "./Midi";
import MidiTrack from "./MidiTrack";

export default class MidiReader extends BinFileReader {
	midi: Midi;
	
	constructor(midi: Midi) {
		// super(midi.content);
		super(midi.file as File);
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
		const timeDivisionByte1 = this.readByte(1), timeDivisionByte2 = this.readByte(1); // 时分数据。
		if (timeDivisionByte1 & 0b1000_0000) // 基本时间格式 (fps 或 tpf)
			this.midi.timeDivision = [
				timeDivisionByte1 & 0b0111_1111, // 帧每秒 (frames per second) 模式 (第 1 字节)
				timeDivisionByte2, // 基本时间每帧 (ticks in each frame) (第 2 字节)
			];
		else this.midi.timeDivision = (timeDivisionByte1 << 8) + timeDivisionByte2; // 基本时间每拍 (ticks per beat) 模式 (2 字节)
	}
	
	private readTracks(): void {
		while (!this.isReadOver()) {
			const headerValidation = this.readByte(4);
			if (headerValidation === -1) break; // 读完了。
			if (headerValidation !== 0x4D54726B) { // MTrk - Midi Track
				throw new MidiTrackHeaderValidationError();
			}
			const trackSize = this.readByte(4); // 当前轨道字节长度（舍弃）
			const track = new MidiTrack(this, this.getPointer(), trackSize);
			this.midi.tracks.push(track);
		}
	}
}
