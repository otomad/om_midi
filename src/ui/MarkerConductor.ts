import addControl, { addGroup, addItems } from "../module/addControl";
import setNumberEditText, { NumberType } from "../module/setNumberEditText";
import { SPACING } from "./BaseTab";
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
		({
			group: this.bpmGroup,
			label: this.bpmLbl,
			control: this.bpmTxt,
		} = addGroup(this.group, "BPM", "edittext", { text: "120", alignment: FILL }));
		({
			group: this.beatGroup,
			label: this.beatLbl,
			control: this.beatTxt,
		} = addGroup(this.group, "节拍", "edittext", { text: "4", alignment: FILL }));
		({
			group: this.markOnGroup,
			label: this.markOnLbl,
			control: this.markOnCombo,
		} = addGroup(this.group, "标记在", "dropdownlist", { alignment: FILL }));
		addItems(this.markOnCombo, "新建空对象图层", "当前图层");
		({
			group: this.startTimeGroup,
			label: this.startTimeLbl,
			control: this.startTimeCombo,
		} = addGroup(this.group, "开始位置", "dropdownlist", { alignment: FILL }));
		addItems(this.startTimeCombo, "显示开始时间", "当前时间", "工作区域", "0");
		
		setNumberEditText(this.beatTxt, NumberType.POSITIVE_INT, 4);
		setNumberEditText(this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
	}
}
