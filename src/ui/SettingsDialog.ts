import Separator from "../components/Separator";
import addControl, { addItems } from "../module/addControl";
import Setting from "../module/Setting";
import str from "../languages/strings";
import { CannotFindWindowError } from "../exceptions";
import { getDropDownListSelectedIndex } from "../module/extensions";

const ABOUT = "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。";

export default class SettingsDialog {
	//#region 组件对象
	window: Window;
	group: Group;
	aboutLbl: StaticText;
	separator: Separator;
	buttonGroup: Group;
	okBtn: Button;
	cancelBtn: Button;
	languageGroup: Group;
	languageLbl: StaticText;
	languageCombo: DropDownList;
	usingSelectedLayerName: Checkbox;
	//#endregion
	
	constructor() {
		this.window = new Window("dialog", localize(str.settings), undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		this.aboutLbl = addControl(this.group, "statictext", { text: ABOUT }, { multiline: true });
		this.separator = new Separator(this.group);
		this.languageGroup = addControl(this.group, "group", { orientation: "row" });
		this.languageLbl = addControl(this.languageGroup, "statictext", { text: "语言" });
		this.languageCombo = addControl(this.languageGroup, "dropdownlist");
		addItems(this.languageCombo, "应用默认值", "简体中文", "English", "日本語");
		const selectedLanguageIndex = Setting.get("Language", 0);
		if (selectedLanguageIndex > 0 && selectedLanguageIndex < this.languageCombo.items.length)
			this.languageCombo.selection = selectedLanguageIndex;
		this.usingSelectedLayerName = addControl(this.group, "checkbox", { text: "使用选择图层名称而不是轨道名称" });
		this.usingSelectedLayerName.value = Setting.get("UsingSelectedLayerName", false);
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
		this.okBtn = addControl(this.buttonGroup, "button", { text: localize(str.ok) });
		this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(str.cancel) });
		this.window.defaultElement = this.okBtn;
		this.window.cancelElement = this.cancelBtn;
		
		this.okBtn.onClick = () => {
			Setting.set("UsingSelectedLayerName", this.usingSelectedLayerName.value);
			Setting.set("Language", getDropDownListSelectedIndex(this.languageCombo));
			$.locale = SettingsDialog.langIso[getDropDownListSelectedIndex(this.languageCombo)]
			this.window.close();
		}
	}
	
	show() {
		this.window.center();
		this.window.show();
	}
	
	private static langIso = ["", "zh_CN", "en", "ja"];
}
