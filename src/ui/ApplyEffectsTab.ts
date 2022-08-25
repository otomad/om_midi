import addControl from "../module/addControl";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class ApplyEffectsTab extends BaseTab {
	//#region 组件对象
	timeRemap: Checkbox;
	hFlip: Checkbox;
	cwRotation: Checkbox;
	//#endregion

	constructor(parent: Portal) {
		super(parent, "应用效果");
		this.timeRemap = this.addCheckbox("时间重映射");
		this.hFlip = this.addCheckbox("水平翻转");
		this.cwRotation = this.addCheckbox("顺时针旋转");
	}
}
