import User from "../user";
import addControl, { addGroup, addItems } from "../modules/addControl";
import NullObjTab from "./NullObjTab";
import ApplyEffectsTab from "./ApplyEffectsTab";
import ToolsTab from "./ToolsTab";
import SettingsDialog from "../dialogs/SettingsDialog";
import setNumberEditText from "../modules/setNumberEditText";
import { CannotFindWindowError, MidiNoTrackError, MyError } from "../errors";
import Midi from "../midi/Midi";
import ProgressPalette from "../dialogs/ProgressPalette";
import MidiTrackSelector from "./MidiTrackSelector";
import uiStr, { DYNAMIC_BPM_SIGN } from "../languages/ui-str";
import BaseTab from "./BaseTab";
import Core from "../core/Core";
import MidiTrack from "../midi/MidiTrack";
import Base64Image from "../temp-file-methods/Base64Image";
import Setting from "../settings/Setting";
import ScrollGroup from "../containers/ScrollGroup";

export const LARGE_NUMBER = 1e4; // 这个大数设置大了会跑不了。
export const MIDI_BUTTON_HEIGHT = 22;
export const MIDI_BUTTON_WIDTH = 15;

export default class Portal {
	//#region 组件对象
	window: Window | Panel;
	group: Group;
	selectMidiGroup: Group;
	selectMidiLbl: StaticText;
	selectMidiBtn: Button;
	selectMidiName: StaticText;
	selectTrackGroup: Group;
	selectTrackLbl: StaticText;
	selectTrackBtn: Button;
	selectBpmGroup: Group;
	selectBpmLbl: StaticText;
	selectBpmTxt: EditText;
	startTimeGroup: Group;
	startTimeLbl: StaticText;
	startTimeCombo: DropDownList;
	tabs: TabbedPanel;
	applyBtn: Button;
	buttonGroup: Group;
	settingBtn: IconButton;
	
	nullObjTab: NullObjTab;
	applyEffectsTab: ApplyEffectsTab;
	toolsTab: ToolsTab;
	
	midi?: Midi;
	selectedTracks: (MidiTrack | undefined)[] = [];
	core: Core;
	//#endregion
	
	private constructor(window: Window | Panel) {
		this.window = window;
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: ["fill", "fill"], spacing: 5 });
		const FILL_CENTER: [_AlignmentName, _AlignmentName] = ["fill", "center"];
		({
			group: this.selectMidiGroup,
			label: this.selectMidiLbl,
			control: this.selectMidiBtn,
		} = addGroup(this.group, "", "button", { text: "...", size: [MIDI_BUTTON_WIDTH, MIDI_BUTTON_HEIGHT] }));
		this.selectMidiName = addControl(this.selectMidiGroup, "statictext", { alignment: FILL_CENTER });
		({
			group: this.selectTrackGroup,
			label: this.selectTrackLbl,
			control: this.selectTrackBtn,
		} = addGroup(this.group, "", "button", {
			text: "",
			alignment: FILL_CENTER,
			maximumSize: [LARGE_NUMBER, MIDI_BUTTON_HEIGHT],
			enabled: false,
		}));
		({
			group: this.selectBpmGroup,
			label: this.selectBpmLbl,
			control: this.selectBpmTxt,
		} = addGroup(this.group, "", "edittext", { text: "120", alignment: FILL_CENTER, enabled: false }));
		({
			group: this.startTimeGroup,
			label: this.startTimeLbl,
			control: this.startTimeCombo,
		} = addGroup(this.group, "", "dropdownlist", { alignment: FILL_CENTER }));
		this.tabs = addControl(this.group, "tabbedpanel", { alignment: ["fill", "fill"] });
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"] });
		this.applyBtn = addControl(this.buttonGroup, "button", { alignment: "left" });
		const settingIcon = Base64Image.settingIcon();
		this.settingBtn = addControl(this.buttonGroup, "iconbutton", { alignment: ["right", "center"], image: settingIcon }, { style: "toolbutton" });
		settingIcon.remove(); // 把缓存图标删了。
		
		this.nullObjTab = new NullObjTab(this);
		this.applyEffectsTab = new ApplyEffectsTab(this);
		this.toolsTab = new ToolsTab(this);
		this.translate();
		
		this.core = new Core(this);
		this.selectMidiBtn.onClick = () => {
			const file = File.openDialog(localize(uiStr.select_a_midi_file),
				`${localize(uiStr.midi_files)}:*.mid;*.midi,${localize(uiStr.all_files)}:*.*`);
			if (file === null) return;
			let midi: Midi | undefined;
			try {
				midi = new Midi(file);
				if (midi.tracks.length === 0) throw new MidiNoTrackError();
				this.updateDefaultBpm(midi);
				this.selectMidiName.text = file.displayName;
				const firstTrack = midi.tracks[midi.preferredTrackIndex];
				this.selectedTracks = [firstTrack];
				this.selectTrackBtn.text = firstTrack.toString();
				this.selectTrackBtn.enabled = true;
				this.selectBpmTxt.enabled = true;
				this.midi = midi;
			} catch (error) {
				if (midi) midi.file?.close();
				throw new MyError(error as Error);
			}
		};
		this.applyBtn.onClick = () => this.core.apply();
		this.settingBtn.onClick = () => {
			new SettingsDialog(this).showDialog();
			if (this.midi?.isPureQuarter) this.selectTrackBtn.enabled = false;
			this.translate();
		};
		this.selectTrackBtn.onClick = () => {
			new MidiTrackSelector(this).showDialog();
		};
		this.tabs.onChange = () => {
			const tab = this.getSelectedTab();
			if (tab === this.applyEffectsTab)
				this.startTimeCombo.selection = Setting.getApplyEffectsStartTime();
			else
				this.startTimeCombo.selection = Setting.getNullObjectStartTime();
		};
		this.tabs.onChange();
		this.startTimeCombo.onChange = () => {
			const tab = this.getSelectedTab(), value = this.startTimeCombo.getSelectedIndex();
			if (tab === this.applyEffectsTab)
				Setting.setApplyEffectsStartTime(value);
			else
				Setting.setNullObjectStartTime(value);
		};
	}
	
	public static build(thisObj: Panel | typeof globalThis, user: typeof User): Portal {
		$.strict = true;
		const window = thisObj instanceof Panel ? thisObj :
			new Window("palette", user.scriptName + " v" + user.version, undefined, {
				resizeable: true,
			});
		if (window === null) throw new CannotFindWindowError();
		const portal = new Portal(window);
		window.onShow = window.onResizing = window.onResize = () => {
			window.layout.resize();
			portal.resizeScrollGroups();
		};
		if (window instanceof Window) {
			window.center();
			window.show();
		} else {
			window.layout.layout(true);
			window.layout.resize();
		}
		return portal;
	}
	
	getSelectedTab(): BaseTab<ScrollGroup | Group> | null {
		if (this.tabs.selection === null) return null;
		switch ((this.tabs.selection as Tab).text) {
			case this.nullObjTab.tab.text:
				return this.nullObjTab;
			case this.applyEffectsTab.tab.text:
				return this.applyEffectsTab;
			case this.toolsTab.tab.text:
				return this.toolsTab;
			default:
				return null;
		}
	}
	
	translate() {
		this.applyBtn.text = localize(uiStr.apply);
		this.nullObjTab.translate();
		this.applyEffectsTab.translate();
		this.toolsTab.translate();
		if (!this.midi || !this.selectedTracks.length)
			this.selectMidiName.text = localize(uiStr.no_midi_file_selected);
		this.selectMidiLbl.text = localize(uiStr.select_midi_file);
		this.selectTrackLbl.text = localize(uiStr.select_midi_track);
		this.selectBpmLbl.text = localize(uiStr.set_midi_bpm);
		this.startTimeLbl.text = localize(uiStr.start_time);
		addItems(this.startTimeCombo, localize(uiStr.display_start_time), localize(uiStr.current_time), localize(uiStr.work_area), "0");
	}
	
	private resizeScrollGroups() {
		const baseTabs: BaseTab<ScrollGroup>[] = [this.nullObjTab, this.applyEffectsTab];
		for (const tab of baseTabs)
			tab.group.onResize();
	}
	
	private displayBpmForNoBpm() {
		let bpm: number;
		try {
			bpm = parseFloat(this.selectBpmTxt.text);
		} catch (error) {
			bpm = 120;
		}
		return String(bpm);
	}
	
	updateDefaultBpm(midi: Midi) {
		const bpm = midi.bpm ? midi.displayBpm() : this.displayBpmForNoBpm();
		this.selectBpmTxt.text = bpm;
		setNumberEditText(this.selectBpmTxt, { type: "decimal", min: 1 }, bpm);
	}
	
	isUseDynamicBpm() {
		return this.selectBpmTxt.text.indexOf(DYNAMIC_BPM_SIGN) !== -1;
	}
}
