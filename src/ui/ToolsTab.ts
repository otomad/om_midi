import addControl from "../module/addControl";
import Portal from "./Portal";
import MarkerConductor from "./MarkerConductor";
import BaseTab from "./BaseTab";

export default class ToolsTab extends BaseTab {
	//#region 组件对象
	toolsCombo: DropDownList;
	toolsPanel: Group;
	marker: MarkerConductor;
	//#endregion
	
	constructor(parent: Portal) {
		super(parent, "工具", { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] });
		this.toolsCombo = addControl(this.group, "dropdownlist");
		this.toolsCombo.add("item", "标记生成");
		this.toolsCombo.selection = 0;
		this.toolsPanel = addControl(this.group, "group", { alignment: "fill", alignChildren: "fill" });
		this.marker = new MarkerConductor(this);
	}
}
