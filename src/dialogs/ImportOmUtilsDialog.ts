import { CannotFindWindowError } from "../errors";
import addControl from "../modules/addControl";
import uiStr from "../languages/ui-str";

export default class ImportOmUtilsDialog {
	window: Window;
	group: Group;
	okBtn: Button;
	
	constructor() {
		this.window = new Window("dialog", localize(uiStr.add_at_top_of_expression), undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		addControl(this.group, "statictext", { text: localize(uiStr.om_utils_same_as_project_directory) });
		addControl(this.group, "edittext", { text: '$.evalFile(thisProject.fullPath.replace(/\\\\[^\\\\]*$/, "/om_utils.jsx"));' }, { readonly: true });
		addControl(this.group, "statictext", { text: localize(uiStr.om_utils_added_to_project) });
		addControl(this.group, "edittext", { text: 'footage("om_utils.jsx").sourceData;' }, { readonly: true });
		this.okBtn = addControl(this.group, "button", { text: localize(uiStr.ok), alignment: "right" });
		this.window.defaultElement = this.okBtn;
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
	}
}
