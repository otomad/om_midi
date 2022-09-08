import Separator from "../components/Separator";
import addControl, { addGroup, addItems, ContainerType } from "../modules/addControl";
import Setting from "../settings/Setting";
import uiStr, { DIALOG_SIGN } from "../languages/ui-str";
import { CannotFindWindowError } from "../errors";
import User from "../user";
import openUrl from "../temp-file-methods/openUrl";
import ImportOmUtilsDialog from "./ImportOmUtilsDialog";
import Portal from "./Portal";
import Midi from "../midi/Midi";
import FlowGroup from "../containers/FlowGroup";

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
		this.aboutLbl = addControl(this.leftGroup, "statictext", { text: localize(uiStr.about, User.githubPage) }, { multiline: true, scrolling: true });
		this.openGithubBtnGroup = new FlowGroup(this.leftGroup, 3, ["fill", "bottom"]);
		this.openGithubLatestBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.check_update) + DIALOG_SIGN });
		this.openGithubPageBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.repository_link) });
		this.extendScriptEngineAboutBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.about_script_engine) });
		this.importOmUtilsBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.import_om_utils) + DIALOG_SIGN });
		this.importPureQuarterMidiBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.import_pure_quarter_midi) + DIALOG_SIGN });
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
		this.usingSelectedLayerName = addControl(this.nullObjPanel, "checkbox", { text: localize(uiStr.using_selected_layer_name) });
		this.usingSelectedLayerName.value = Setting.getUsingSelectedLayerName();
		this.normalizePanTo100 = addControl(this.nullObjPanel, "checkbox", { text: localize(uiStr.normalize_pan_to_100) });
		this.normalizePanTo100.value = Setting.getNormalizePanTo100();
		this.applyEffectsPanel = this.addPanel(this.rightGroup, localize(uiStr.apply_effects));
		this.usingLayering = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.using_layering) });
		this.usingLayering.value = Setting.getUsingLayering();
		this.optimizeApplyEffects = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.optimize_apply_effects) });
		this.optimizeApplyEffects.value = Setting.getOptimizeApplyEffects();
		this.addToEffectTransform = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.add_to_effect_transform) });
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
		this.openGithubPageBtn.onClick = () => openUrl(User.githubPage);
		this.openGithubLatestBtn.onClick = () => openUrl(User.githubLatest);
		this.importPureQuarterMidiBtn.onClick = () => {
			if (!confirm(localize(uiStr.sure_to_import_pure_quarter_midi), true, localize(uiStr.import_pure_quarter_midi))) return;
			this.portal.midi = new Midi(true);
			this.portal.selectedTracks = [undefined];
			this.portal.selectMidiName.text = localize(uiStr.pure_quarter_midi);
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
