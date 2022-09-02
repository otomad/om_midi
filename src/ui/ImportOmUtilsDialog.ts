import { CannotFindWindowError } from "../errors";
import addControl from "../module/addControl";
import uiStr from "../languages/ui-str";

export default class ImportOmUtilsDialog {
	window: Window;
	group: Group;
	okBtn: Button;
	
	constructor() {
		this.window = new Window("dialog", "在表达式顶部添加", undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		addControl(this.group, "statictext", { text: "若放置在 aep 工程的相同目录下" });
		addControl(this.group, "edittext", { text: '$.evalFile(thisProject.fullPath.replace(/\\\\[^\\\\]*$/, "/om_utils.jsx"));' }, { readonly: true });
		addControl(this.group, "statictext", { text: "若放置在任意位置，然后添加到 AE 项目中" });
		addControl(this.group, "edittext", { text: 'footage("om_utils.jsx").sourceData;' }, { readonly: true });
		this.okBtn = addControl(this.group, "button", { text: localize(uiStr.ok), alignment: "right" });
		this.window.defaultElement = this.okBtn;
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
	}
}
