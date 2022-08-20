import addControl, { addItems } from "../module/addControl";
import { SPACING, tabGroupParams } from "./NullObjTab";
import { setLabelMinWidth } from "./Portal";
import ToolsTab from "./ToolsTab";

export default class MarkerConductor {
	//#region 组件对象
	parent: ToolsTab;
	group: Group;
	bpmGroup: Group;
	bpmLbl: StaticText;
	bpmTxt: EditText;
	beatGroup: Group;
	beatLbl: StaticText;
	beatTxt: EditText;
	markOnGroup: Group;
	markOnLbl: StaticText;
	markOnCombo: DropDownList;
	startTimeGroup: Group;
	startTimeLbl: StaticText;
	startTimeCombo: DropDownList;
	//#endregion
	
	constructor(parent: ToolsTab) {
		this.parent = parent;
		this.group = addControl(this.parent.toolsPanel, "group", {
			orientation: "column",
			alignment: ["fill", "fill"],
			alignChildren: "fill",
			spacing: SPACING,
		});
		const FILL: [_AlignmentName, _AlignmentName] = ["fill", "center"];
		this.bpmGroup = this.addGroup();
		this.bpmLbl = this.addLabel(this.bpmGroup, "BPM");
		this.bpmTxt = addControl(this.bpmGroup, "edittext", { text: "120", alignment: FILL });
		this.beatGroup = this.addGroup();
		this.beatLbl = this.addLabel(this.beatGroup, "节拍");
		this.beatTxt = addControl(this.beatGroup, "edittext", { text: "4", alignment: FILL });
		this.markOnGroup = this.addGroup();
		this.markOnLbl = this.addLabel(this.markOnGroup, "标记在");
		this.markOnCombo = addControl(this.markOnGroup, "dropdownlist", { alignment: FILL });
		addItems(this.markOnCombo, "新建空对象图层", "当前图层");
		this.startTimeGroup = this.addGroup();
		this.startTimeLbl = this.addLabel(this.startTimeGroup, "开始位置");
		this.startTimeCombo = addControl(this.startTimeGroup, "dropdownlist", { alignment: FILL });
		addItems(this.startTimeCombo, "显示开始时间", "当前时间", "工作区域", "0");
		
		this.beatTxt.onChange = () => {
			this.beatTxt.text = this.beatTxt.text.replace(/[^\d]/g, "");
		}
		this.bpmTxt.onChange = () => {
			let text = this.bpmTxt.text.replace(/[^\d\.]/g, "").replace(/\.+/g, ".").replace(/\.$/g, "");
			const matches = text.match(/\d+\.\d+/g);
			if (matches) text = matches[0];
			text = text.replace(/^\./g, "0.");
			this.bpmTxt.text = text;
		}
	}
	
	private addGroup(): Group {
		return addControl(this.group, "group", { orientation: "row", spacing: 7, alignment: "fill", alignChildren: "fill" });
	}
	
	private addLabel(parent: Group, text: string) {
		const label = addControl(parent, "statictext", { text });
		setLabelMinWidth(label);
		return label;
	}
}
