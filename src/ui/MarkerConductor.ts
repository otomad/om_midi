import uiStr from "../languages/ui-str";
import { addGroup, addItems } from "../modules/addControl";
import setNumberEditText from "../modules/setNumberEditText";
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
		} = addGroup(this.group, "", "dropdownlist", { alignment: FILL_CENTER }));
		({
			group: this.bpmGroup,
			label: this.bpmLbl,
			control: this.bpmTxt,
		} = addGroup(this.group, "BPM", "edittext", { text: "120", alignment: FILL_CENTER }));
		({
			group: this.beatGroup,
			label: this.beatLbl,
			control: this.beatTxt,
		} = addGroup(this.group, "", "edittext", { text: "4", alignment: FILL_CENTER }));
		({
			group: this.markOnGroup,
			label: this.markOnLbl,
			control: this.markOnCombo,
		} = addGroup(this.group, "", "dropdownlist", { alignment: FILL_CENTER }));
		
		this.translate();
		setNumberEditText(this.bpmTxt, { type: "decimal", min: 1 }, 120);
		this.unitCombo.onChange = () => {
			const unitIndex = this.unitCombo.getSelectedIndex();
			this.beatLbl.text = unitIndex === 0 ? localize(uiStr.beat) : localize(uiStr.shift_seconds_and_frames);
			if (unitIndex === 0) this.bpmLbl.text = "BPM"; // TODO: 这部分将会被修改为三元运算符。
			else if (unitIndex === 1) this.bpmLbl.text = localize(uiStr.seconds);
			else this.bpmLbl.text = localize(uiStr.frames);
			setNumberEditText(this.beatTxt, unitIndex === 0 ? { type: "int", min: 1 } : { type: "decimal" }, 4);
			this.beatTxt.notify("onChange");
		};
		this.unitCombo.notify("onChange");
	}
	
	translate(): void {
		this.unitLbl.text = localize(uiStr.unit);
		this.markOnLbl.text = localize(uiStr.mark_on);
		addItems(this.unitCombo, "BPM", localize(uiStr.time), localize(uiStr.frames));
		addItems(this.markOnCombo, localize(uiStr.add_null_layer), localize(uiStr.current_layer));
	}
}
