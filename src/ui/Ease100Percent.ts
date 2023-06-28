import uiStr from "../languages/ui-str";
import addControl from "../modules/addControl";
import EaseType from "../modules/EaseType";
import BaseTool from "./BaseTool";
import ToolsTab from "./ToolsTab";

export default class Ease100Percent extends BaseTool {
	//#region 组件对象
	easeInRadio: RadioButton;
	easeOutRadio: RadioButton;
	easeInOutRadio: RadioButton;
	easeLinearRadio: RadioButton;
	easeHoldRadio: RadioButton;
	easeHoldInRadio: RadioButton;
	easeHoldOutRadio: RadioButton;
	//#endregion
	
	constructor(parent: ToolsTab) {
		super(parent);
		this.easeInRadio = addControl(this.group, "radiobutton", { value: true });
		this.easeOutRadio = addControl(this.group, "radiobutton");
		this.easeInOutRadio = addControl(this.group, "radiobutton");
		this.easeLinearRadio = addControl(this.group, "radiobutton");
		this.easeHoldRadio = addControl(this.group, "radiobutton");
		this.easeHoldInRadio = addControl(this.group, "radiobutton");
		this.easeHoldOutRadio = addControl(this.group, "radiobutton");
		this.translate();
	}
	
	getValue(): EaseType {
		if (this.easeInOutRadio.value) return EaseType.EASE_IN_OUT;
		else if (this.easeOutRadio.value) return EaseType.EASE_OUT;
		else if (this.easeLinearRadio.value) return EaseType.LINEAR;
		else if (this.easeHoldRadio.value) return EaseType.HOLD;
		else if (this.easeHoldInRadio.value) return EaseType.HOLD_IN;
		else if (this.easeHoldOutRadio.value) return EaseType.HOLD_OUT;
		else return EaseType.EASE_IN;
	}
	
	translate(): void {
		this.easeInRadio.text = localize(uiStr.ease_in);
		this.easeOutRadio.text = localize(uiStr.ease_out);
		this.easeInOutRadio.text = localize(uiStr.ease_in_out);
		this.easeLinearRadio.text = localize(uiStr.linear);
		this.easeHoldRadio.text = localize(uiStr.hold_both);
		this.easeHoldInRadio.text = localize(uiStr.hold_in);
		this.easeHoldOutRadio.text = localize(uiStr.hold_out);
	}
}
