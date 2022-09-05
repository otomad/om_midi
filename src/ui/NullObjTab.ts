import uiStr from "../languages/ui-str";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class NullObjTab extends BaseTab {
	//#region 组件对象
	pitch: Checkbox;
	velocity: Checkbox;
	duration: Checkbox;
	scale: Checkbox;
	cwRotation: Checkbox;
	ccwRotation: Checkbox;
	count: Checkbox;
	bool: Checkbox;
	timeRemap: Checkbox;
	pingpong: Checkbox;
	noteOn: Checkbox;
	pan: Checkbox;
	volume: Checkbox;
	glide: Checkbox;
	//#endregion

	constructor(parent: Portal) {
		super(parent);
		this.pitch = this.addCheckbox("音高");
		this.velocity = this.addCheckbox("力度"); // 致前辈：Velocity 就是力度，不是速度。
		this.duration = this.addCheckbox("持续时间");
		this.scale = this.addCheckbox("缩放");
		this.cwRotation = this.addCheckbox("顺时针旋转");
		this.ccwRotation = this.addCheckbox("逆时针旋转");
		this.count = this.addCheckbox("计数");
		this.bool = this.addCheckbox("布尔");
		this.timeRemap = this.addCheckbox("时间重映射");
		this.pingpong = this.addCheckbox("来回");
		this.noteOn = this.addCheckbox("音符开");
		this.pan = this.addCheckbox("通道声像");
		this.volume = this.addCheckbox("通道音量");
		this.glide = this.addCheckbox("通道弯音");
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.create_null_object_short);
	}
}
