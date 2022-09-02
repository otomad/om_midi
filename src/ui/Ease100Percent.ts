import { EaseType } from "../core/Core";
import addControl from "../module/addControl";
import BaseTool from "./BaseTool";
import ToolsTab from "./ToolsTab";

export default class Ease100Percent extends BaseTool {
	//#region 组件对象
	easeInRadio: RadioButton;
	easeOutRadio: RadioButton;
	easeInOutRadio: RadioButton;
	//#endregion
	
	constructor(parent: ToolsTab) {
		super(parent);
		this.easeInRadio = addControl(this.group, "radiobutton", { text: "缓入", value: true });
		this.easeOutRadio = addControl(this.group, "radiobutton", { text: "缓出" });
		this.easeInOutRadio = addControl(this.group, "radiobutton", { text: "缓入缓出" });
	}
	
	getValue(): EaseType {
		if (this.easeInOutRadio.value) return EaseType.EASE_IN_OUT;
		else if (this.easeOutRadio.value) return EaseType.EASE_OUT;
		else return EaseType.EASE_IN;
	}
}
