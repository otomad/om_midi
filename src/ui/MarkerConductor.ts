import { addGroup, addItems } from "../module/addControl";
import setNumberEditText, { NumberType } from "../module/setNumberEditText";
import BaseTool from "./BaseTool";
import ToolsTab from "./ToolsTab";

export default class MarkerConductor extends BaseTool {
	//#region 组件对象
	unitGroup: Group;
	unitLbl: StaticText;
	unitCombo: DropDownList;
	bpmGroup: Group;
	bpmLbl: StaticText;
	bpmTxt: EditText;
	beatGroup: Group;
	beatLbl: StaticText;
	beatTxt: EditText;
	markOnGroup: Group;
	markOnLbl: StaticText;
	markOnCombo: DropDownList;
	//#endregion
	
	constructor(parent: ToolsTab) {
		super(parent);
		const FILL_CENTER: [_AlignmentName, _AlignmentName] = ["fill", "center"];
		({
			group: this.unitGroup,
			label: this.unitLbl,
			control: this.unitCombo,
		} = addGroup(this.group, "单位", "dropdownlist", { alignment: FILL_CENTER }));
		addItems(this.unitCombo, "BPM", "时间", "帧数");
		({
			group: this.bpmGroup,
			label: this.bpmLbl,
			control: this.bpmTxt,
		} = addGroup(this.group, "BPM", "edittext", { text: "120", alignment: FILL_CENTER }));
		({
			group: this.beatGroup,
			label: this.beatLbl,
			control: this.beatTxt,
		} = addGroup(this.group, "节拍", "edittext", { text: "4", alignment: FILL_CENTER }));
		({
			group: this.markOnGroup,
			label: this.markOnLbl,
			control: this.markOnCombo,
		} = addGroup(this.group, "标记在", "dropdownlist", { alignment: FILL_CENTER }));
		addItems(this.markOnCombo, "新建空对象图层", "当前图层");
		
		setNumberEditText(this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
		this.unitCombo.onChange = () => {
			const unitIndex = this.unitCombo.getSelectedIndex();
			this.beatLbl.text = unitIndex === 0 ? "节拍" : "偏移";
			this.bpmLbl.text = unitIndex === 0 ? "BPM" :
				(unitIndex === 1 ? "秒数" : "帧数");
			setNumberEditText(this.beatTxt, unitIndex === 0 ? NumberType.POSITIVE_INT : NumberType.DECIMAL, 4);
			this.beatTxt.notify("onChange");
		};
		this.unitCombo.notify("onChange");
	}
}
