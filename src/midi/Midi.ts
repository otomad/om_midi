import { FileUnreadableError } from "../exceptions";
import MidiFormatType from "./MidiFormatType";
import MidiReader, { MidiTrack } from "./MidiReader";

export default class Midi {
	content: string;
	private length: number;
	private midiReader: MidiReader;
	
	formatType: MidiFormatType = 1;
	trackCount: number = 0;
	timeDivision: number | [number, number] = 0;
	tracks: MidiTrack[] = [];
	
	/**
	 * 构建 MIDI 对象。
	 * @param file - 一个从 After Effects 打开，但还没有开始读取的 MIDI 文件。
	 */
	constructor(file: File) {
		if (file && file.open("r")) {
			file.encoding = "binary"; // 读取为二进制编码。
			this.length = file.length;
			this.content = file.read(this.length);
			file.close();
			this.midiReader = new MidiReader(this);
		} else throw new FileUnreadableError();
	}
}
