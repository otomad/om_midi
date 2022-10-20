import { UnsupportedFpsTimeDivisionError } from "../errors";
import BpmKeysData from "./BpmKeysData";
import MidiTrack from "./MidiTrack";
import { NoteOffEvent, NoteSecondEvent, NoteOnEvent, NoteOnSecondEvent, TempoMetaEvent, NoteEvent } from "./note-events";

/**
 * 动态 BPM 积分器。
 */
export default class DynamicBpmIntegrator {
	private readonly tempoTrack: MidiTrack;
	private readonly datas: BpmKeysData[] = [];
	private readonly ticksPerQuarter: number;
	
	constructor(tempoTrack: MidiTrack) {
		this.tempoTrack = tempoTrack;
		const midi = tempoTrack.midi();
		if (!midi.isTpbTimeDivision())
			throw new UnsupportedFpsTimeDivisionError();
		this.ticksPerQuarter = midi.timeDivision as number;
		this.initData();
	}
	
	private initData() {
		for (const note of this.tempoTrack)
			if (note instanceof TempoMetaEvent) {
				let startTick = note.startTick;
				if (this.datas.length === 0 && startTick !== 0) startTick = 0;
				let startSecond = 0;
				const lastData = this.getLastData();
				const secondsPerQuarter = note.tempo / 1e6;
				if (lastData) {
					if (secondsPerQuarter === lastData.secondsPerQuarter)
						continue;
					else if (startTick === lastData.startTick) {
						lastData.secondsPerQuarter = secondsPerQuarter;
						continue;
					}
					startSecond = (startTick - lastData.startTick) / this.ticksPerQuarter * lastData.secondsPerQuarter;
				}
				this.datas.push(new BpmKeysData(secondsPerQuarter, startTick, startSecond));
			}
	}
	
	private getLastData(): BpmKeysData | undefined { return this.datas[this.datas.length - 1]; }
	
	getSecond(note: NoteOnEvent): NoteOnSecondEvent;
	getSecond(note: NoteEvent): NoteSecondEvent;
	getSecond(note: NoteOnEvent | NoteEvent): NoteOnSecondEvent | NoteSecondEvent {
		const startSecond = this.getActualSecond(note.startTick);
		if (note instanceof NoteOnEvent) {
			const result = new NoteOnSecondEvent(note, startSecond);
			if (note.duration)
				result.durationSecond = this.getActualSecond(note.startTick + note.duration) - startSecond;
			if (note.interruptDuration)
				result.interruptDurationSecond = this.getActualSecond(note.startTick + note.interruptDuration) - startSecond;
			return result;
		} else {
			const result = new NoteSecondEvent(note, startSecond);
			return result;
		}
	}

	/**
	 * 根据 MIDI 音符的相对时刻获取音频播放的实际时刻（秒）。
	 * @param tick - 音符相对时刻。
	 * @returns 音频播放的实际时刻。
	 */
	private getActualSecond(tick: number): number {
		for (let i = 0; i < this.datas.length; i++) {
			const curData = this.datas[i], nextData: BpmKeysData | undefined = this.datas[i + 1];
			if (nextData !== undefined && tick > nextData.startTick) continue;
			const currentSecond = (tick - curData.startTick) * curData.secondsPerQuarter / this.ticksPerQuarter;
			return curData.startSecond + currentSecond;
		}
		// 针对没有任何 BPM 关键帧却误打误撞进入这个函数环节的。
		alert("No Bpm Keys!");
		return tick;
	}
}
