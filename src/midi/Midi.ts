import { FileUnreadableError } from "../exceptions";
import MidiFormatType from "./MidiFormatType";
import MidiReader from "./MidiReader";
import MidiTrack from "./MidiTrack";

export default class Midi {
	// content: string;
	file: File;
	private length: number;
	private midiReader: MidiReader;
	
	formatType: MidiFormatType = 1;
	trackCount: number = 0;
	timeDivision: number | [number, number] = 0;
	tracks: MidiTrack[] = [];
	bpm?: number;
	preferredTrackIndex = 0;
	
	/**
	 * 构建 MIDI 对象。
	 * @param file - 一个从 After Effects 打开，但还没有开始读取的 MIDI 文件。
	 */
	constructor(file: File) {
		this.file = file;
		if (file && file.open("r")) {
			file.encoding = "binary"; // 读取为二进制编码。
			this.length = file.length;
			// this.content = file.read(this.length);
			this.midiReader = new MidiReader(this);
			file.close();
			this.removeNotNoteTrack();
			this.setPreferredTrack();
		} else throw new FileUnreadableError();
	}
	
	/**
	 * 删除不是音符的轨道。
	 * 可根据需要调用。
	 */
	removeNotNoteTrack(): void {
		for (let i = this.tracks.length - 1; i >= 0; i--) {
			const track = this.tracks[i];
			if (track.noteCount === 0)
				this.tracks.splice(i, 1);
		}
	}
	
	/**
	 * 设定首选轨道。
	 */
	setPreferredTrack(): void {
		for (let i = 0; i < this.tracks.length; i++) {
			const track = this.tracks[i];
			if (track.channel !== 10) {
				this.preferredTrackIndex = i;
				break;
			}
		}
	}
}
