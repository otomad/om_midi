import addControl from "../module/addControl";
import { SPACING } from "./BaseTab";
import ToolsTab from "./ToolsTab";

export default abstract class BaseTool {
	//#region 组件对象
	parent: ToolsTab;
	group: Group;
	//#endregion
	
	constructor(parent: ToolsTab) {
		this.parent = parent;
		this.group = addControl(this.parent.toolsPanel, "group", {
			orientation: "column",
			alignment: ["fill", "fill"],
			alignChildren: "fill",
			spacing: SPACING,
		});
	}
}
