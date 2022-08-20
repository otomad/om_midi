import addControl from "../module/addControl";
import Portal from "./Portal";
import MarkerConductor from "./MarkerConductor";

export default class ToolsTab {
	//#region 组件对象
	parent: Portal;
	tab: Tab;
	group: Group;
	toolsCombo: DropDownList;
	toolsPanel: Group;
	marker: MarkerConductor;
	//#endregion
	
	constructor(parent: Portal) {
		this.parent = parent;
		this.tab = addControl(this.parent.tabs, "tab", { text: "工具" });
		this.group = addControl(this.tab, "group", { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] });
		this.toolsCombo = addControl(this.group, "dropdownlist");
		this.toolsCombo.add("item", "标记生成");
		this.toolsCombo.selection = 0;
		this.toolsPanel = addControl(this.group, "group", { alignment: "fill", alignChildren: "fill" });
		this.marker = new MarkerConductor(this);
	}
}
