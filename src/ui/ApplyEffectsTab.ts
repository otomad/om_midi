import addControl from "../module/addControl";
import { tabGroupParams } from "./NullObjTab";
import Portal from "./Portal";

export default class ApplyEffectsTab {
	//#region 组件对象
	parent: Portal;
	tab: Tab;
	group: Group;
	timeRemap: Checkbox;
	hFlip: Checkbox;
	cwRotation: Checkbox;
	//#endregion

	constructor(parent: Portal) {
		this.parent = parent;
		this.tab = addControl(this.parent.tabs, "tab", { text: "应用效果" });
		this.group = addControl(this.tab, "group", tabGroupParams);
		this.timeRemap = addControl(this.group, "checkbox", { text: "时间重映射" });
		this.hFlip = addControl(this.group, "checkbox", { text: "水平翻转" });
		this.cwRotation = addControl(this.group, "checkbox", { text: "顺时针旋转" });
	}
}
