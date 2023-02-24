import ConfigJsonNS from "../core/ConfigJsonNS";
import { CannotFindWindowError, InvalidMappingVelocityValuesError } from "../errors";
import uiStr, { ZString } from "../languages/ui-str";
import addControl, { addGroup } from "../modules/addControl";
import setNumberEditText from "../modules/setNumberEditText";

export default class MappingVelocityDialog {
	window: Window;
	group: Group;
	buttonGroup: Group;
	okBtn: Button;
	cancelBtn: Button;
	velocityLessTxt: EditText;
	velocityMoreTxt: EditText;
	targetLessTxt: EditText;
	targetMoreTxt: EditText;
	dialogResult: boolean = false;
	
	constructor(targetName: ZString, targetRange: [number, number], data?: ConfigJsonNS.MappingVelocity) {
		this.window = new Window("dialog", localize(uiStr.map_velocity), undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		[this.velocityLessTxt, this.velocityMoreTxt] = this.addRow(uiStr.notes_velocity);
		[this.targetLessTxt, this.targetMoreTxt] = this.addRow(targetName);
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
		this.okBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.ok) });
		this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.cancel) });
		
		this.window.defaultElement = this.okBtn;
		this.window.cancelElement = this.cancelBtn;
		this.okBtn.onClick = () => {
			const result = this.getResult();
			try {
				if (result.velocityLess >= result.velocityMore || result.targetLess > result.targetMore)
					throw new InvalidMappingVelocityValuesError();
			} catch {
				return;
			}
			this.dialogResult = true;
			this.window.close();
		};
		if (data) {
			this.velocityLessTxt.text = String(data.velocityLess);
			this.velocityMoreTxt.text = String(data.velocityMore);
			this.targetLessTxt.text = String(data.targetLess);
			this.targetMoreTxt.text = String(data.targetMore);
		}
		[this.velocityLessTxt, this.velocityMoreTxt].forEach(text =>
			setNumberEditText(text, { type: "int", min: 0, max: 127 }));
		[this.targetLessTxt, this.targetMoreTxt].forEach(text =>
			setNumberEditText(text, { type: "decimal", min: targetRange[0], max: targetRange[1] }));
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
		if (!this.dialogResult) return undefined;
		return this.getResult();
	}
	
	addRow(name: ZString): [EditText, EditText] {
		const characters = 6;
		const { control: group } = addGroup(this.group, localize(name), "group", { orientation: "row", alignment: ["right", "center"] });
		const less = addControl(group, "edittext", { characters });
		addControl(group, "statictext", { text: "~" });
		const more = addControl(group, "edittext", { characters });
		return [less, more];
	}
	
	private getResult() {
		return new ConfigJsonNS.MappingVelocity({
			velocityLess: parseFloat(this.velocityLessTxt.text),
			velocityMore: parseFloat(this.velocityMoreTxt.text),
			targetLess: parseFloat(this.targetLessTxt.text),
			targetMore: parseFloat(this.targetMoreTxt.text),
		});
	}
}
