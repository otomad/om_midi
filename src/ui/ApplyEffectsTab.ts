import addControl, { addGroup, addItems } from "../module/addControl";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class ApplyEffectsTab extends BaseTab {
	//#region 组件对象
	timeRemap: Checkbox;
	timeRemap2: Checkbox;
	hFlip: Checkbox;
	cwRotation: Checkbox;
	ccwRotation: Checkbox;
	negative: Checkbox;
	tuning: Checkbox;
	basePitchGroup: Group;
	basePitchLbl: StaticText;
	basePitchKeyCombo: DropDownList;
	basePitchOctCombo: DropDownList;
	//#endregion

	constructor(parent: Portal) {
		super(parent, "应用效果");
		this.timeRemap = this.addCheckbox("时间重映射（拉伸）");
		this.timeRemap2 = this.addCheckbox("时间重映射（截断）");
		this.hFlip = this.addCheckbox("水平翻转");
		this.cwRotation = this.addCheckbox("顺时针旋转");
		this.ccwRotation = this.addCheckbox("逆时针旋转");
		this.negative = this.addCheckbox("颜色反转");
		this.tuning = this.addCheckbox("调音");
		({
			group: this.basePitchGroup,
			label: this.basePitchLbl,
			control: this.basePitchKeyCombo,
		} = addGroup(this.group, "原始音高", "dropdownlist"));
		this.basePitchOctCombo = addControl(this.basePitchGroup, "dropdownlist")
		addItems(this.basePitchKeyCombo, ..."C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(','));
		addItems(this.basePitchOctCombo, ..."0,1,2,3,4,5,6,7,8,9,10".split(','));
		this.basePitchOctCombo.selection = 5;
		this.basePitchGroup.enabled = false;
		this.tuning.onClick = () => this.basePitchGroup.enabled = this.tuning.value;
		this.cwRotation.onClick = () => this.ccwRotation.value = false;
		this.ccwRotation.onClick = () => this.cwRotation.value = false;
		this.timeRemap.onClick = () => this.timeRemap2.value = false;
		this.timeRemap2.onClick = () => this.timeRemap.value = false;
	}
}
