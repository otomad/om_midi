import MappingVelocityCheckbox from "../components/MappingVelocityCheckbox";
import ScrollGroup from "../containers/ScrollGroup";
import uiStr from "../languages/ui-str";
import addControl, { addGroup, addItems } from "../modules/addControl";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

type _Checkbox = Checkbox | MappingVelocityCheckbox;

export default class ApplyEffectsTab extends BaseTab<ScrollGroup> {
	//#region 组件对象
	timeRemap: Checkbox = this.addCheckbox();
	timeRemap2: Checkbox = this.addCheckbox();
	pingpong: Checkbox = this.addCheckbox();
	hFlip: Checkbox = this.addCheckbox();
	vFlip: Checkbox = this.addCheckbox();
	ccwFlip: Checkbox = this.addCheckbox();
	cwFlip: Checkbox = this.addCheckbox();
	hMirror: Checkbox = this.addCheckbox();
	ccwRotation: Checkbox = this.addCheckbox();
	cwRotation: Checkbox = this.addCheckbox();
	negative: Checkbox = this.addCheckbox();
	mapVelToOpacity = new MappingVelocityCheckbox(this.group.content, uiStr.opacity, [0, 100], [0, 100]);
	tuning: Checkbox = this.addCheckbox();
	basePitchGroup: Group;
	basePitchLbl: StaticText;
	basePitchKeyCombo: DropDownList;
	basePitchOctCombo: DropDownList;
	mapVelToVolume: MappingVelocityCheckbox;
	//#endregion

	constructor(parent: Portal) {
		super(parent, true);
		({
			group: this.basePitchGroup,
			label: this.basePitchLbl,
			control: this.basePitchKeyCombo,
		} = addGroup(this.group.content, "", "dropdownlist"));
		this.basePitchOctCombo = addControl(this.basePitchGroup, "dropdownlist");
		addItems(this.basePitchKeyCombo, ..."C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(","));
		addItems(this.basePitchOctCombo, ..."0,1,2,3,4,5,6,7,8,9,10".split(","));
		this.basePitchOctCombo.selection = 5;
		this.basePitchGroup.enabled = false;
		this.mapVelToVolume = new MappingVelocityCheckbox(this.group.content, uiStr.audio_levels, [-192, 12], [-40, 0]);
		this.mapVelToVolume.group.margins = [0, 7, 10, 0];
		const flips = [this.hFlip, this.vFlip, this.ccwFlip, this.cwFlip];
		for (const flip of flips)
			flip.onClick = () => {
				for (const otherFlip of flips)
					if (otherFlip !== flip)
						otherFlip.value = false;
			};
		this.ccwRotation.onClick = () => this.cwRotation.value = false;
		this.cwRotation.onClick = () => this.ccwRotation.value = false;
		this.timeRemap.onClick = () => this.timeRemap2.value = this.pingpong.value = false;
		this.timeRemap2.onClick = () => this.timeRemap.value = this.pingpong.value = false;
		this.pingpong.onClick = () => this.timeRemap.value = this.timeRemap2.value = false;
		this.tuning.onClick = () => {
			this.basePitchGroup.enabled = this.tuning.value;
			this.mapVelToVolume.setEnabled(this.tuning.value);
		};
		this.mapVelToVolume.setEnabled(false);
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.apply_effects_short);
		this.basePitchLbl.text = localize(uiStr.base_pitch);
		this.timeRemap.text = localize(uiStr.time_remap) + localize(uiStr.paren_stretched);
		this.timeRemap2.text = localize(uiStr.time_remap) + localize(uiStr.paren_truncated);
		this.pingpong.text = localize(uiStr.pingpong);
		this.hFlip.text = localize(uiStr.horizontal_flip);
		this.vFlip.text = localize(uiStr.vertical_flip);
		this.ccwFlip.text = localize(uiStr.ccw_flip);
		this.cwFlip.text = localize(uiStr.cw_flip);
		this.hMirror.text = localize(uiStr.horizontal_mirror);
		this.ccwRotation.text = localize(uiStr.ccw_ratation);
		this.cwRotation.text = localize(uiStr.cw_rotation);
		this.negative.text = localize(uiStr.invert_color);
		this.tuning.text = localize(uiStr.tuning);
		this.mapVelToOpacity.checkbox.text = localize(uiStr.map_velocity_to_opacity);
		this.mapVelToVolume.checkbox.text = localize(uiStr.map_velocity_to_volume);
	}
	
	_getCheckedChecks(): _Checkbox[] {
		const check: _Checkbox[] = this.getCheckedChecks();
		if (this.mapVelToOpacity.value) check.push(this.mapVelToOpacity);
		if (this.tuning.value && this.mapVelToVolume.value) check.push(this.mapVelToVolume);
		return check;
	}
}
