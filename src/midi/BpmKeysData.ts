/**
 * 存储 BPM 关键帧数据的类。
 */
export default class BpmKeysData {
	public readonly msPerQuarter: number;
	public readonly startTick: number;
	public readonly previousMs: number;
	
	/**
	 * 存储 BPM 关键帧数据的类。
	 * @param msPerQuarter - 此刻的毫秒每四分音符的值（即当前速度）。
	 * @param startTick - 相对开始位置。
	 * @param previousMs - 之前所有数据实际毫秒值的总和。
	 */
	constructor(msPerQuarter: number, startTick: number, previousMs: number) {
		this.msPerQuarter = msPerQuarter;
		this.startTick = startTick;
		this.previousMs = previousMs;
	}
}
