import uiStr from "../languages/ui-str";
import { addGroup, addItems } from "../modules/addControl";
import setNumberEditText, { NumberType } from "../modules/setNumberEditText";
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
		setNumberEditText(this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
		this.unitCombo.onChange = () => {
			const unitIndex = this.unitCombo.getSelectedIndex();
			this.beatLbl.text = unitIndex === 0 ? localize(uiStr.beat) : localize(uiStr.shift_seconds_and_frames);
			this.bpmLbl.text = unitIndex === 0 ? "BPM" :
				(unitIndex === 1 ? localize(uiStr.seconds) : localize(uiStr.frames));
			setNumberEditText(this.beatTxt, unitIndex === 0 ? NumberType.POSITIVE_INT : NumberType.DECIMAL, 4);
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
