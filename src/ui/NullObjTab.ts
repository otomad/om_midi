import ScrollGroup from "../containers/ScrollGroup";
import uiStr from "../languages/ui-str";
import BaseTab from "./BaseTab";
import Portal from "./Portal";

export default class NullObjTab extends BaseTab<ScrollGroup> {
	//#region 组件对象
	pitch: Checkbox = this.addCheckbox();
	velocity: Checkbox = this.addCheckbox(); // 致前辈：Velocity 就是力度，不是速度。
	duration: Checkbox = this.addCheckbox();
	scale: Checkbox = this.addCheckbox();
	advancedScale: Checkbox = this.addCheckbox();
	ccwRotation: Checkbox = this.addCheckbox();
	cwRotation: Checkbox = this.addCheckbox();
	count: Checkbox = this.addCheckbox();
	bool: Checkbox = this.addCheckbox();
	timeRemap: Checkbox = this.addCheckbox();
	pingpong: Checkbox = this.addCheckbox();
	noteOn: Checkbox = this.addCheckbox();
	pan: Checkbox = this.addCheckbox();
	volume: Checkbox = this.addCheckbox();
	glide: Checkbox = this.addCheckbox();
	//#endregion

	constructor(parent: Portal) {
		super(parent, true);
	}
	
	translate(): void {
		this.tab.text = localize(uiStr.create_null_object_short);
		this.pitch.text = localize(uiStr.pitch);
		this.velocity.text = localize(uiStr.velocity);
		this.duration.text = localize(uiStr.duration);
		this.scale.text = localize(uiStr.scale);
		this.advancedScale.text = localize(uiStr.advanced_scale);
		this.ccwRotation.text = localize(uiStr.ccw_ratation);
		this.cwRotation.text = localize(uiStr.cw_rotation);
		this.count.text = localize(uiStr.count);
		this.bool.text = localize(uiStr.bool);
		this.timeRemap.text = localize(uiStr.time_remap);
		this.pingpong.text = localize(uiStr.pingpong);
		this.noteOn.text = localize(uiStr.note_on);
		this.pan.text = localize(uiStr.channel_pan);
		this.volume.text = localize(uiStr.channel_volume);
		this.glide.text = localize(uiStr.channel_glide);
	}
}
