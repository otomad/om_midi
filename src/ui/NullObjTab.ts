import addControl from "../module/addControl";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class NullObjTab extends BaseTab {
	//#region 组件对象
	pitch: Checkbox;
	velocity: Checkbox;
	duration: Checkbox;
	scale: Checkbox;
	cwRotation: Checkbox;
	count: Checkbox;
	bool: Checkbox;
	timeRemap: Checkbox; // 时间重映射（拉伸）
	timeRemap2: Checkbox; // 时间重映射（截断）
	whirl: Checkbox;
	//#endregion

	constructor(parent: Portal) {
		super(parent, "空对象");
		this.pitch = this.addCheckbox("音高");
		this.velocity = this.addCheckbox("力度");
		this.duration = this.addCheckbox("持续时间");
		this.scale = this.addCheckbox("缩放");
		this.cwRotation = this.addCheckbox("顺时针旋转");
		this.count = this.addCheckbox("计数");
		this.bool = this.addCheckbox("布尔");
		this.timeRemap = this.addCheckbox("时间重映射（拉伸）");
		this.timeRemap2 = this.addCheckbox("时间重映射（截断）");
		this.whirl = this.addCheckbox("来回");
	}
}