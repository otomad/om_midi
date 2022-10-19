import BpmKeysData from "./BpmKeysData";
import MidiTrack from "./MidiTrack";
import { TempoEvent } from "./note-events";

/**
 * 动态 BPM 积分器。
 */
export default class DynamicBpmIntegrator {
	private readonly tempoTrack: MidiTrack;
	private readonly datas: BpmKeysData[] = [];
	
	constructor(tempoTrack: MidiTrack) {
		this.tempoTrack = tempoTrack;
		this.initData();
	}
	
	private initData() {
		for (const note of this.tempoTrack)
			if (note instanceof TempoEvent) {
				let startTick = note.sofarTick;
				if (this.datas.length === 0 && startTick !== 0) startTick = 0;
				const lastData = this.getLastData();
				if (lastData) {
					if (note.tempo === lastData.msPerQuarter)
						continue;
					else if (startTick === lastData.startTick)
						this.datas.pop();
				}
				this.datas.push(new BpmKeysData(note.tempo, startTick, 0));
			}
	}
	
	private getLastData(): BpmKeysData | undefined { return this.datas[this.datas.length - 1]; }
}
