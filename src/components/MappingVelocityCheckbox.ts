import ConfigJsonNS from "../core/ConfigJsonNS";
import MappingVelocityDialog from "../dialogs/MappingVelocityDialog";
import { ZString } from "../languages/ui-str";
import addControl from "../modules/addControl";
import clamp from "../modules/clamp";
import map from "../modules/map";
import { MIDI_BUTTON_WIDTH } from "../ui/Portal";

type Range = [number, number];

export default class MappingVelocityCheckbox {
	parent: ContainerType;
	group: Group;
	checkbox: Checkbox;
	advanceBtn: Button;
	value: boolean = false;
	targetRange: Range;
	mapping;
	
	constructor(parent: ContainerType, targetText: ZString, targetRange: Range, defaultRange: Range, text?: string) {
		this.parent = parent;
		this.targetRange = targetRange;
		this.mapping = new ConfigJsonNS.MappingVelocity({ targetLess: defaultRange[0], targetMore: defaultRange[1] });
		this.group = addControl(parent, "group", { orientation: "row" });
		this.checkbox = addControl(this.group, "checkbox", { text });
		this.advanceBtn = addControl(this.group, "button", { text: "...", size: [MIDI_BUTTON_WIDTH, 18] });
		this.checkbox.onClick = () => this.value = this.checkbox.value;
		this.advanceBtn.onClick = () => {
			const result = new MappingVelocityDialog(targetText, targetRange, this.mapping).showDialog();
			if (result) this.mapping = result;
		};
	}
	
	setEnabled(enabled: boolean) {
		this.checkbox.enabled = this.advanceBtn.enabled = enabled;
		if (!enabled) this.value = this.checkbox.value = false;
	}
	
	map(value: number) {
		return clamp(this.targetRange[0], map(value, this.mapping.velocityLess, this.mapping.velocityMore, this.mapping.targetLess, this.mapping.targetMore), this.targetRange[1]);
	}
}
