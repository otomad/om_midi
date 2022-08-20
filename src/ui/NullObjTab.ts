import addControl from "../module/addControl";
import Portal from "./Portal";

export const SPACING = 2;
export const tabGroupParams: Partial<Group> = {
	orientation: "column",
	alignment: "left",
	alignChildren: "left",
	spacing: SPACING,
	margins: [10, 5, 10, 0],
};

export default class NullObjTab {
	//#region 组件对象
	parent: Portal;
	tab: Tab;
	group: Group;
	pitch: Checkbox;
	velocity: Checkbox;
	duration: Checkbox;
	scale: Checkbox;
	cwRotation: Checkbox;
	count: Checkbox;
	bool: Checkbox;
	timeRemap: Checkbox; // 时间重映射（拉伸）
	timeRemap2: Checkbox; // 时间重映射（截断）
	//#endregion

	constructor(parent: Portal) {
		this.parent = parent;
		this.tab = addControl(this.parent.tabs, "tab", { text: "空对象" });
		this.group = addControl(this.tab, "group", tabGroupParams);
		this.pitch = addControl(this.group, "checkbox", { text: "音高" });
		this.velocity = addControl(this.group, "checkbox", { text: "力度" });
		this.duration = addControl(this.group, "checkbox", { text: "持续时间" });
		this.scale = addControl(this.group, "checkbox", { text: "缩放" });
		this.cwRotation = addControl(this.group, "checkbox", { text: "顺时针旋转" });
		this.count = addControl(this.group, "checkbox", { text: "计数" });
		this.bool = addControl(this.group, "checkbox", { text: "布尔" });
		this.timeRemap = addControl(this.group, "checkbox", { text: "时间重映射（拉伸）" });
		this.timeRemap2 = addControl(this.group, "checkbox", { text: "时间重映射（截断）" });
	}
}
