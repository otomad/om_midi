import { FileUnreadableError } from "../errors";
import uiStr, { DYNAMIC_BPM_SIGN } from "../languages/ui-str";
import convertTextEncoding from "../temp-file-methods/convertTextEncoding";
import DynamicBpmIntegrator from "./DynamicBpmIntegrator";
import { MidiFormatType } from "./midi-types";
import MidiReader from "./MidiReader";
import MidiTrack from "./MidiTrack";

export default class Midi {
	// content: string;
	readonly file?: File;
	private length?: number;
	private readonly midiReader?: MidiReader;
	readonly integrator?: DynamicBpmIntegrator;
	
	fileName: string;
	formatType: MidiFormatType = MidiFormatType.SYNC_MULTI_TRACK;
	trackCount: number = 0;
	timeDivision: number | [number, number] = 0;
	tracks: MidiTrack[] = [];
	bpm?: number;
	preferredTrackIndex: number = 0;
	isPureQuarter: boolean = false;
	isDynamicBpm: boolean = false;
	tempoTrack?: MidiTrack;
	
	/**
	 * 构建 MIDI 对象。
	 * @param file - 一个从 After Effects 打开，但还没有开始读取的 MIDI 文件。
	 */
	constructor(file: File);
	/**
	 * 构建一个纯四分音符 MIDI。
	 * @param isPureQuarter - 这是一个纯四分音符 MIDI。必须为 true。
	 */
	constructor(isPureQuarter: true);
	constructor(file: File | true) {
		if (file === true) {
			this.fileName = localize(uiStr.pure_quarter_midi);
			this.isPureQuarter = true;
			this.formatType = MidiFormatType.SINGLE_TRACK;
			this.trackCount = 1;
			this.timeDivision = 1;
			return;
		}
		this.file = file;
		this.fileName = file.displayName;
		if (file && file.open("r")) {
			file.encoding = "binary"; // 读取为二进制编码。
			this.length = file.length;
			// this.content = file.read(this.length);
			this.midiReader = new MidiReader(this);
			file.close();
			if (this.isDynamicBpm && this.tempoTrack)
				this.integrator = new DynamicBpmIntegrator(this.tempoTrack);
			this.removeNotNoteTrack();
			this.setPreferredTrack();
			this.convertTracksNameEncoding();
		} else throw new FileUnreadableError();
	}
	
	/**
	 * 删除不是音符的轨道。
	 * 可根据需要调用。
	 * 如果将来需要读取动态 BPM、节拍等信息时再对此处做出修改。
	 */
	private removeNotNoteTrack(): void {
		for (let i = this.tracks.length - 1; i >= 0; i--) {
			const track = this.tracks[i];
			if (track.noteCount === 0)
				this.tracks.splice(i, 1);
		}
	}
	
	/**
	 * 设定首选轨道。
	 */
	private setPreferredTrack(): void {
		for (let i = 0; i < this.tracks.length; i++) {
			const track = this.tracks[i];
			if (track.channel !== 10) {
				this.preferredTrackIndex = i;
				break;
			}
		}
	}
	
	/**
	 * 将 Latin1 编码的轨道名称转换回系统默认编码。
	 */
	private convertTracksNameEncoding() {
		const tracks: MidiTrack[] = [];
		let trackNames: string[] = [];
		for (const track of this.tracks)
			if (track.name) {
				tracks.push(track);
				trackNames.push(track.name);
			}
		if (trackNames.length === 0) return;
		trackNames = convertTextEncoding(trackNames);
		for (let i = 0; i < tracks.length && i < trackNames.length; i++) {
			const track = tracks[i];
			let name: string | undefined = trackNames[i].trim();
			if (name === "") name = undefined;
			track.name = name;
		}
	}
	
	/**
	 * 判断时分数据是否为标准的基本时间每拍格式。
	 */
	isTpbTimeDivision() { return typeof this.timeDivision === "number"; }
	
	displayBpm(): string {
		const DEFAULT_BPM = 120;
		if (!this.bpm) return String(DEFAULT_BPM);
		let result = String(this.bpm);
		if (this.isDynamicBpm) result += DYNAMIC_BPM_SIGN;
		return result;
	}
}
