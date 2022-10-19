/**
 * 存储 BPM 关键帧数据的类。
 */
export default class BpmKeysData {
	/** 此刻的秒每四分音符的值（即当前速度）。 */
	public secondsPerQuarter: number;
	/** 相对开始位置。 */
	public readonly startTick: number;
	/** 之前所有数据实际秒数的总和。 */
	public readonly startSecond: number;
	
	/**
	 * 存储 BPM 关键帧数据的类。
	 * @param secondsPerQuarter - 此刻的秒每四分音符的值（即当前速度）。
	 * @param startTick - 相对开始位置。
	 * @param startSecond - 之前所有数据实际秒数的总和。
	 */
	constructor(secondsPerQuarter: number, startTick: number, startSecond: number) {
		this.secondsPerQuarter = secondsPerQuarter;
		this.startTick = startTick;
		this.startSecond = startSecond;
	}
}
