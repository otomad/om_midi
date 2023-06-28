import addControl, { addItems } from "../modules/addControl";
import Portal from "./Portal";
import MarkerConductor from "./MarkerConductor";
import BaseTab from "./BaseTab";
import Separator from "../components/Separator";
import Ease100Percent from "./Ease100Percent";
import BaseTool from "./BaseTool";
import Setting from "../settings/Setting";
import uiStr from "../languages/ui-str";
import BatchSubtitleGeneration from "./BatchSubtitleGeneration";

export default class ToolsTab extends BaseTab<Group> {
	//#region 组件对象
	toolsCombo: DropDownList;
	separator: Separator;
	toolsPanel: Group;
	marker: MarkerConductor;
	ease: Ease100Percent;
	subtitle: BatchSubtitleGeneration;
	//#endregion
	
	constructor(parent: Portal) {
		super(parent, false, undefined, { orientation: "column", alignment: ["fill", "fill"], alignChildren: "fill", margins: [10, 5, 0, 0] });
		this.toolsCombo = addControl(this.group, "dropdownlist");
		this.separator = new Separator(this.group, "horizontal");
		this.toolsPanel = addControl(this.group, "group", { orientation: "stack", alignment: ["fill", "fill"], alignChildren: "fill" });
		this.marker = new MarkerConductor(this);
		this.ease = new Ease100Percent(this);
		this.subtitle = new BatchSubtitleGeneration(this);
		
		this.toolsCombo.onChange = () => {
			const selected = this.toolsCombo.getSelectedIndex();
			for (let i = 0; i < this.toolsPanel.children.length; i++) {
				const tool = this.toolsPanel.children[i];
				tool.visible = i === selected;
			}
			this.setLastTool(this.toolsCombo.getSelectedIndex());
		};
	}
	
	private disableSetLastTool = false;
	private setLastTool(index: number) {
		if (index < 0 || index >= this.toolsCombo.children.length || this.disableSetLastTool)
			return;
		Setting.setLastTool(index);
	}
	
	getSelectedTool(): BaseTool | null {
		switch (this.toolsCombo.getSelectedIndex()) {
			case 0: return this.marker;
			case 1: return this.ease;
			case 2: return this.subtitle;
			default: return null;
		}
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.tools);
		this.disableSetLastTool = true;
		addItems(
			this.toolsCombo,
			localize(uiStr.marker_conductor),
			localize(uiStr.easing_100_percent),
			localize(uiStr.batch_subtitle_generation),
		);
		this.disableSetLastTool = false;
		this.marker.translate();
		this.ease.translate();
		this.subtitle.translate();
		
		this.toolsCombo.selection = Setting.getLastTool();
	}
}
