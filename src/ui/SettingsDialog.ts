import Separator from "../components/Separator";
import addControl, { addGroup, addItems, ContainerType } from "../module/addControl";
import Setting from "../settings/Setting";
import uiStr from "../languages/uiStr";
import { CannotFindWindowError } from "../errors";
import User from "../user";
import openUrl from "../temp-file-methods/openUrl";
import ImportOmUtilsDialog from "./ImportOmUtilsDialog";
import Portal from "./Portal";
import Midi from "../midi/Midi";
import FlowGroup from "../containers/FlowGroup";

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
	generalPanel: Panel;
	nullObjPanel: Panel;
	applyEffectsPanel: Panel;
	buttonGroup: Group;
	okBtn: Button;
	cancelBtn: Button;
	languageGroup: Group;
	languageLbl: StaticText;
	languageCombo: DropDownList;
	usingSelectedLayerName: Checkbox;
	usingLayering: Checkbox;
	optimizeApplyEffects: Checkbox;
	normalizePanTo100: Checkbox;
	addToEffectTransform: Checkbox;
	openGithubBtnGroup: FlowGroup;
	openGithubLatestBtn: Button;
	openGithubPageBtn: Button;
	importOmUtilsBtn: Button;
	importPureQuarterMidiBtn: Button;
	extendScriptEngineAboutBtn: Button;
	//#endregion
	
	constructor(portal: Portal) {
		this.portal = portal;
		this.window = new Window("dialog", `${localize(uiStr.settings)} - ${User.scriptName} v${User.version}`, undefined, {
			resizeable: false,
		});
		if (this.window === null) throw new CannotFindWindowError();
		
		this.group = addControl(this.window, "group", { orientation: "row", alignChildren: "fill", alignment: "fill" });
		this.leftGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		this.separator = new Separator(this.group, "vertical");
		this.rightGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill", spacing: 5 });
		this.aboutLbl = addControl(this.leftGroup, "statictext", { text: ABOUT }, { multiline: true, scrolling: true });
		this.openGithubBtnGroup = new FlowGroup(this.leftGroup, 3, ["fill", "bottom"]);
		this.openGithubLatestBtn = this.openGithubBtnGroup.add("button", { text: "检查更新" });
		this.openGithubPageBtn = this.openGithubBtnGroup.add("button", { text: "仓库地址" });
		this.extendScriptEngineAboutBtn = this.openGithubBtnGroup.add("button", { text: "关于脚本引擎" });
		this.importOmUtilsBtn = this.openGithubBtnGroup.add("button", { text: "导入 om utils" });
		this.importPureQuarterMidiBtn = this.openGithubBtnGroup.add("button", { text: "导入纯四分 MIDI" });
		this.generalPanel = this.addPanel(this.rightGroup, localize(uiStr.general), [10, 10, 10, 7]);
		({
			group: this.languageGroup,
			label: this.languageLbl,
			control: this.languageCombo,
		} = addGroup(this.generalPanel, localize(uiStr.language), "dropdownlist"));
		addItems(this.languageCombo, localize(uiStr.app_default), "简体中文", "English", "日本語");
		const selectedLanguageIndex = Setting.getLanguage();
		if (selectedLanguageIndex > 0 && selectedLanguageIndex < this.languageCombo.items.length)
			this.languageCombo.selection = selectedLanguageIndex;
		this.nullObjPanel = this.addPanel(this.rightGroup, localize(uiStr.create_null_object));
		this.usingSelectedLayerName = addControl(this.nullObjPanel, "checkbox", { text: "使用选中图层名称而不是 MIDI 轨道名称" });
		this.usingSelectedLayerName.value = Setting.getUsingSelectedLayerName();
		this.normalizePanTo100 = addControl(this.nullObjPanel, "checkbox", { text: "声相标准化到 -100 ~ 100。" });
		this.normalizePanTo100.value = Setting.getNormalizePanTo100();
		this.applyEffectsPanel = this.addPanel(this.rightGroup, localize(uiStr.apply_effects));
		this.usingLayering = addControl(this.applyEffectsPanel, "checkbox", { text: "冰鸠さくの特有图层叠叠乐方法。" });
		this.usingLayering.value = Setting.getUsingLayering();
		this.optimizeApplyEffects = addControl(this.applyEffectsPanel, "checkbox", { text: "优化部分效果动画。" });
		this.optimizeApplyEffects.value = Setting.getOptimizeApplyEffects();
		this.addToEffectTransform = addControl(this.applyEffectsPanel, "checkbox", { text: "将属性添加到效果中的变换中。" });
		this.addToEffectTransform.value = Setting.getAddToEffectTransform();
		this.buttonGroup = addControl(this.rightGroup, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
		this.okBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.ok) });
		this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.cancel) });
		this.window.defaultElement = this.okBtn;
		this.window.cancelElement = this.cancelBtn;
		
		this.okBtn.onClick = () => {
			Setting.setUsingSelectedLayerName(this.usingSelectedLayerName.value);
			Setting.setUsingLayering(this.usingLayering.value);
			Setting.setOptimizeApplyEffects(this.optimizeApplyEffects.value);
			Setting.setNormalizePanTo100(this.normalizePanTo100.value);
			Setting.setAddToEffectTransform(this.addToEffectTransform.value);
			Setting.setLanguage(this.languageCombo.getSelectedIndex());
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
		this.extendScriptEngineAboutBtn.onClick = () => $.about();
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
	}
	
	private static langIso = ["", "zh_CN", "en", "ja"];
	
	private addPanel(parent: ContainerType, name: string, margins: [number, number, number, number] = [10, 13, 10, 3]): Panel {
		return addControl(parent, "panel", {
			text: name,
			orientation: "column",
			alignChildren: "fill",
			alignment: "fill",
			spacing: 2,
			margins,
		});
	}
}
