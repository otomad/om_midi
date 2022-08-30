import Separator from "../components/Separator";
import addControl, { addGroup, addItems } from "../module/addControl";
import Setting from "../module/Setting";
import str from "../languages/strings";
import { CannotFindWindowError } from "../errors";
import User from "../user";
import openUrl from "../temp-file-methods/openUrl";
import ImportOmUtilsDialog from "./ImportOmUtilsDialog";
import Portal from "./Portal";
import Midi from "../midi/Midi";

const ABOUT = `读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。

脚本原作者：大卫·范·布林克 (omino)、Dora (NGDXW)、韩琦、家鳖大帝
脚本作者：兰音`;

export default class SettingsDialog {
	//#region 组件对象
	portal: Portal;
	window: Window;
	group: Group;
	leftGroup: Group;
	rightGroup: Group;
	aboutLbl: StaticText;
	separator: Separator;
	buttonGroup: Group;
	okBtn: Button;
	cancelBtn: Button;
	languageGroup: Group;
	languageLbl: StaticText;
	languageCombo: DropDownList;
	usingSelectedLayerName: Checkbox;
	usingLayering: Checkbox;
	openGithubBtnGroup: Group;
	openGithubLatestBtn: Button;
	openGithubPageBtn: Button;
	importOmUtilsBtn: Button;
	importPureQuarterMidiBtn: Button;
	//#endregion
	
	constructor(portal: Portal) {
		this.portal = portal;
		this.window = new Window("dialog", `${localize(str.settings)} - ${User.scriptName} v${User.version}`, undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "row", alignChildren: "fill", alignment: "fill" });
		this.leftGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		this.separator = new Separator(this.group, "vertical");
		this.rightGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		this.aboutLbl = addControl(this.leftGroup, "statictext", { text: ABOUT }, { multiline: true, scrolling: true });
		this.openGithubBtnGroup = addControl(this.leftGroup, "group", { orientation: "row", alignment: "left" });
		this.openGithubLatestBtn = addControl(this.openGithubBtnGroup, "button", { text: "检查更新" });
		this.openGithubPageBtn = addControl(this.openGithubBtnGroup, "button", { text: "仓库地址" });
		this.importOmUtilsBtn = addControl(this.openGithubBtnGroup, "button", { text: "导入 om utils" });
		this.importPureQuarterMidiBtn = addControl(this.openGithubBtnGroup, "button", { text: "导入纯四分 MIDI" });
		({
			group: this.languageGroup,
			label: this.languageLbl,
			control: this.languageCombo,
		} = addGroup(this.rightGroup, "语言", "dropdownlist"));
		addItems(this.languageCombo, "应用默认值", "简体中文", "English", "日本語");
		const selectedLanguageIndex = Setting.get("Language", 0);
		if (selectedLanguageIndex > 0 && selectedLanguageIndex < this.languageCombo.items.length)
			this.languageCombo.selection = selectedLanguageIndex;
		this.usingSelectedLayerName = addControl(this.rightGroup, "checkbox", { text: "空对象：使用选中图层名称而不是 MIDI 轨道名称" });
		this.usingSelectedLayerName.value = Setting.get("UsingSelectedLayerName", false);
		this.usingLayering = addControl(this.rightGroup, "checkbox", { text: "应用效果：冰鸠さくの特有图层叠叠乐方法。" });
		this.usingLayering.value = Setting.get("UsingLayering", false);
		this.buttonGroup = addControl(this.rightGroup, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
		this.okBtn = addControl(this.buttonGroup, "button", { text: localize(str.ok) });
		this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(str.cancel) });
		this.window.defaultElement = this.okBtn;
		this.window.cancelElement = this.cancelBtn;
		
		this.okBtn.onClick = () => {
			Setting.set("UsingSelectedLayerName", this.usingSelectedLayerName.value);
			Setting.set("UsingLayering", this.usingLayering.value);
			Setting.set("Language", this.languageCombo.getSelectedIndex());
			$.locale = SettingsDialog.langIso[this.languageCombo.getSelectedIndex()]
			this.window.close();
		}
		this.openGithubPageBtn.onClick = () => openUrl("https://github.com/otomad/om_midi");
		this.openGithubLatestBtn.onClick = () => openUrl("https://github.com/otomad/om_midi/releases/latest");
		this.importPureQuarterMidiBtn.onClick = () => {
			if (!confirm("确定要导入纯四分音符 MIDI 文件吗？", true, "导入纯四分 MIDI")) return;
			this.portal.midi = new Midi(true);
			this.portal.selectedTracks = [undefined];
			this.portal.selectMidiName.text = "纯四分音符 MIDI";
			this.portal.selectTrackBtn.text = "";
			this.portal.selectTrackBtn.enabled = false;
			this.portal.selectBpmTxt.enabled = true;
		}
		this.importOmUtilsBtn.onClick = () => new ImportOmUtilsDialog().showDialog();
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
	}
	
	private static langIso = ["", "zh_CN", "en", "ja"];
}
