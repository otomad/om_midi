import addControl, { addItems } from "../modules/addControl";
import Portal from "./Portal";
import MarkerConductor from "./MarkerConductor";
import BaseTab from "./BaseTab";
import Separator from "../components/Separator";
import Ease100Percent from "./Ease100Percent";
import BaseTool from "./BaseTool";
import Setting from "../settings/Setting";
import uiStr from "../languages/ui-str";

export default class ToolsTab extends BaseTab<Group> {
	//#region 组件对象
	toolsCombo: DropDownList;
	separator: Separator;
	toolsPanel: Group;
	marker: MarkerConductor;
	ease: Ease100Percent;
	//#endregion
	
	constructor(parent: Portal) {
		super(parent, false, undefined, { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] });
		this.toolsCombo = addControl(this.group, "dropdownlist");
		this.toolsCombo.selection = Setting.getLastTool();
		this.separator = new Separator(this.group, "horizontal");
		this.toolsPanel = addControl(this.group, "group", { orientation: "stack", alignment: "fill", alignChildren: "fill" });
		this.marker = new MarkerConductor(this);
		this.ease = new Ease100Percent(this);
		
		this.toolsCombo.onChange = () => {
			const selected = this.toolsCombo.getSelectedIndex();
			for (let i = 0; i < this.toolsPanel.children.length; i++) {
				const tool = this.toolsPanel.children[i];
				tool.visible = i === selected;
			}
			Setting.setLastTool(this.toolsCombo.getSelectedIndex());
		};
		this.toolsCombo.notify("onChange");
	}
	
	getSelectedTool(): BaseTool | null {
		switch (this.toolsCombo.getSelectedIndex()) {
			case 0: return this.marker;
			case 1: return this.ease;
			default: return null;
		}
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.tools);
		addItems(this.toolsCombo, localize(uiStr.marker_conductor), localize(uiStr.easing_100_percent));
		this.marker.translate();
		this.ease.translate();
	}
}
