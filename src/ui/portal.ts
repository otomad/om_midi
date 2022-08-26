import { IUser } from "../user";
import addControl, { addGroup } from "../module/addControl";
import NullObjTab from "./NullObjTab";
import ApplyEffectsTab from "./ApplyEffectsTab";
import ToolsTab from "./ToolsTab";
import SettingsDialog from "./SettingsDialog";
import setNumberEditText, { NumberType } from "../module/setNumberEditText";
import { CannotFindWindowError, MidiNoTrackError, MyError } from "../exceptions";
import Midi from "../midi/Midi";
import ProgressPalette from "./ProgressPalette";
import MidiTrackSelector from "./MidiTrackSelector";
import str from "../languages/strings";
import BaseTab from "./BaseTab";
import Core from "../core/Core";
import MidiTrack from "../midi/MidiTrack";

export const LARGE_NUMBER = 1e4; // 这个大数设置大了会跑不了。

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
	tabs: TabbedPanel;
	applyBtn: Button;
	buttonGroup: Group;
	settingBtn: Button;
	
	nullObjTab: NullObjTab;
	applyEffectsTab: ApplyEffectsTab;
	toolsTab: ToolsTab
	
	midi?: Midi;
	selectedTracks: MidiTrack[] = [];
	core: Core;
	//#endregion
	
	private constructor(window: Window | Panel) {
		this.window = window;
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		const MidiButtonHeight = 22;
		const FILL_CENTER: [_AlignmentName, _AlignmentName] = ["fill", "center"];
		({
			group: this.selectMidiGroup,
			label: this.selectMidiLbl,
			control: this.selectMidiBtn,
		} = addGroup(this.group, "MIDI 文件", "button", { text: "...", size: [15, MidiButtonHeight] }));
		this.selectMidiName = addControl(this.selectMidiGroup, "statictext", { text: "未选择", alignment: FILL_CENTER });
		({
			group: this.selectTrackGroup,
			label: this.selectTrackLbl,
			control: this.selectTrackBtn,
		} = addGroup(this.group, "选择轨道", "button", {
			text: "",
			alignment: FILL_CENTER,
			maximumSize: [LARGE_NUMBER, MidiButtonHeight],
			enabled: false,
		}));
		({
			group: this.selectBpmGroup,
			label: this.selectBpmLbl,
			control: this.selectBpmTxt,
		} = addGroup(this.group, "设定 BPM", "edittext", { text: "120", alignment: FILL_CENTER, enabled: false }));
		this.tabs = addControl(this.group, "tabbedpanel", { alignment: ["fill", "fill"] });
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"] });
		this.applyBtn = addControl(this.buttonGroup, "button", { text: localize(str.apply), alignment: "left" });
		this.settingBtn = addControl(this.buttonGroup, "button", { text: localize(str.settings), alignment: ["right", "center"] });
		
		this.nullObjTab = new NullObjTab(this);
		this.applyEffectsTab = new ApplyEffectsTab(this);
		this.toolsTab = new ToolsTab(this);
		
		this.core = new Core(this);
		setNumberEditText(this.selectBpmTxt, NumberType.POSITIVE_DECIMAL, 120);
		this.selectMidiBtn.onClick = () => {
			const file = File.openDialog("选择一个 MIDI 序列", "MIDI 序列:*.mid;*.midi,所有文件:*.*");
			if (file === null) return;
			let midi: Midi;
			try {
				midi = new Midi(file);
				if (midi.bpm) this.selectBpmTxt.text = String(midi.bpm);
				if (midi.tracks.length === 0) throw new MidiNoTrackError();
				this.selectMidiName.text = file.displayName;
				const firstTrack = midi.tracks[midi.preferredTrackIndex];
				this.selectedTracks = [firstTrack];
				this.selectTrackBtn.text = firstTrack.toString();
				this.selectTrackBtn.enabled = true;
				this.selectBpmTxt.enabled = true;
				this.midi = midi;
			} catch (error) {
				if (midi!) midi.file.close();
				// throw new MyError(error as Error);
			}
		}
		this.applyBtn.onClick = () => this.core.apply();
		this.settingBtn.onClick = () => {
			new SettingsDialog().show();
		}
		this.selectTrackBtn.onClick = () => {
			new MidiTrackSelector(this).show();
		}
	}
	
	public static build(thisObj: Panel, User: IUser): Portal {
		const window = thisObj instanceof Panel ? thisObj :
			new Window("palette", User.scriptName + " v" + User.version, undefined, {
				resizeable: true,
			});
		if (window === null) throw new CannotFindWindowError();
		const portal = new Portal(window);
		if (window instanceof Window) {
			window.onResizing = window.onResize = () => window.layout.resize();
			window.center();
			window.show();
		} else {
			window.layout.layout(true);
			window.layout.resize();
		}
		return portal;
	}
	
	getSelectedTab(): BaseTab | null {
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
}

/* function initPortal(window: Window | Panel) {
	const group = window.add("group");
	group.orientation = "column";
	group.add("statictext", undefined, "Name:");
	const nameTxt = group.add("edittext", undefined, "John");
	nameTxt.characters = 30;
	nameTxt.active = true;
	const myButtonGroup = window.add("group");
	myButtonGroup.alignment = "right";
	myButtonGroup.orientation = "row";
	myButtonGroup.add("button", undefined, "OK").helpTip = "第一个按钮";
	myButtonGroup.add("button", undefined, "Cancel").helpTip = "第二个按钮";
	addControl(group, "statictext", {
		text: "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
		"其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。",
	}, { multiline: true }).minimumSize = [380, 0];
} */
