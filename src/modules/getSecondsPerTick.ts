import Midi from "../midi/Midi";

export default function getSecondsPerTick(midi: Midi) {
	let secondsPerTick: number;
	const ticksPerQuarter = midi.timeDivision; // 基本时间每四分音符
	if (ticksPerQuarter instanceof Array) {
		secondsPerTick = 1 / ticksPerQuarter[0] / ticksPerQuarter[1]; // 帧每秒这种格式不支持，随便弄一个数不要报错就好了。
	} else {
		const quartersPerMinute = parseFloat(this.portal.selectBpmTxt.text), // 四分音符每分钟 (BPM)
			secondsPerQuarter = 60 / quartersPerMinute; // 秒每四分音符
		secondsPerTick = secondsPerQuarter / ticksPerQuarter; // 秒每基本时间
	}
	return secondsPerTick;
}
