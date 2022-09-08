import uiStr from "../languages/ui-str";
import addControl, { addGroup, addItems } from "../modules/addControl";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class ApplyEffectsTab extends BaseTab {
	//#region 组件对象
	timeRemap: Checkbox = this.addCheckbox();
	timeRemap2: Checkbox = this.addCheckbox();
	pingpong: Checkbox = this.addCheckbox();
	hFlip: Checkbox = this.addCheckbox();
	hMirror: Checkbox = this.addCheckbox();
	cwRotation: Checkbox = this.addCheckbox();
	ccwRotation: Checkbox = this.addCheckbox();
	negative: Checkbox = this.addCheckbox();
	tuning: Checkbox = this.addCheckbox();
	basePitchGroup: Group;
	basePitchLbl: StaticText;
	basePitchKeyCombo: DropDownList;
	basePitchOctCombo: DropDownList;
	//#endregion

	constructor(parent: Portal) {
		super(parent);
		({
			group: this.basePitchGroup,
			label: this.basePitchLbl,
			control: this.basePitchKeyCombo,
		} = addGroup(this.group, "", "dropdownlist"));
		this.basePitchOctCombo = addControl(this.basePitchGroup, "dropdownlist");
		addItems(this.basePitchKeyCombo, ..."C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(","));
		addItems(this.basePitchOctCombo, ..."0,1,2,3,4,5,6,7,8,9,10".split(","));
		this.basePitchOctCombo.selection = 5;
		this.basePitchGroup.enabled = false;
		this.tuning.onClick = () => this.basePitchGroup.enabled = this.tuning.value;
		this.cwRotation.onClick = () => this.ccwRotation.value = false;
		this.ccwRotation.onClick = () => this.cwRotation.value = false;
		this.timeRemap.onClick = () => this.timeRemap2.value = this.pingpong.value = false;
		this.timeRemap2.onClick = () => this.timeRemap.value = this.pingpong.value = false;
		this.pingpong.onClick = () => this.timeRemap.value = this.timeRemap2.value = false;
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.apply_effects_short);
		this.basePitchLbl.text = localize(uiStr.base_pitch);
		this.timeRemap.text = localize(uiStr.time_remap) + localize(uiStr.paren_stretched);
		this.timeRemap2.text = localize(uiStr.time_remap) + localize(uiStr.paren_truncated);
		this.pingpong.text = localize(uiStr.pingpong);
		this.hFlip.text = localize(uiStr.horizontal_flip);
		this.hMirror.text = localize(uiStr.horizontal_mirror);
		this.cwRotation.text = localize(uiStr.cw_rotation);
		this.ccwRotation.text = localize(uiStr.ccw_ratation);
		this.negative.text = localize(uiStr.invert_color);
		this.tuning.text = localize(uiStr.tuning);
	}
}
