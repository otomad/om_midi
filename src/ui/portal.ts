import { IUser } from "../user";
import addControl from "../module/addControl";
import NullObjTab from "./NullObjTab";
import ApplyEffectsTab from "./ApplyEffectsTab";
import ToolsTab from "./ToolsTab";
import getComp from "../module/getComp";
import SettingsDialog from "./SettingsDialog";
import setNumberEditText, { NumberType } from "../module/setNumberEditText";
import { CannotFindWindowError, MidiNoTrackError, MyError } from "../exceptions";
import Midi from "../midi/Midi";
import ProgressPalette from "./ProgressPalette";
import MidiTrackSelector from "./MidiTrackSelector";

const LARGE_NUMBER = 1e5;

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
	selectedTracksIndex: number[] = [];
	//#endregion
	
	private constructor(window: Window | Panel) {
		this.window = window;
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
		const MidiGroupsParams: Partial<Group> = { orientation: "row", spacing: 7 };
		const MidiButtonHeight = 22;
		const FILL_CENTER: [_AlignmentName, _AlignmentName] = ["fill", "center"];
		this.selectMidiGroup = addControl(this.group, "group", MidiGroupsParams);
		this.selectMidiLbl = addControl(this.selectMidiGroup, "statictext", { text: "MIDI 文件" });
		setLabelMinWidth(this.selectMidiLbl);
		this.selectMidiBtn = addControl(this.selectMidiGroup, "button", { text: "...", bounds: [0, 0, 15, MidiButtonHeight] });
		this.selectMidiName = addControl(this.selectMidiGroup, "statictext", { text: "未选择", alignment: FILL_CENTER });
		this.selectTrackGroup = addControl(this.group, "group", MidiGroupsParams);
		this.selectTrackLbl = addControl(this.selectTrackGroup, "statictext", { text: "选择轨道" });
		setLabelMinWidth(this.selectTrackLbl);
		this.selectTrackBtn = addControl(this.selectTrackGroup, "button", { text: "", alignment: FILL_CENTER, maximumSize: [LARGE_NUMBER, MidiButtonHeight], enabled: false });
		this.selectBpmGroup = addControl(this.group, "group", MidiGroupsParams);
		this.selectBpmLbl = addControl(this.selectBpmGroup, "statictext", { text: "设定 BPM" });
		setLabelMinWidth(this.selectBpmLbl);
		this.selectBpmTxt = addControl(this.selectBpmGroup, "edittext", { text: "120", alignment: FILL_CENTER });
		this.tabs = addControl(this.group, "tabbedpanel", { alignment: ["fill", "fill"] });
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"] });
		this.applyBtn = addControl(this.buttonGroup, "button", { text: "应用", alignment: "left" });
		this.settingBtn = addControl(this.buttonGroup, "button", { text: "设置", alignment: ["right", "center"] });
		
		this.nullObjTab = new NullObjTab(this);
		this.applyEffectsTab = new ApplyEffectsTab(this);
		this.toolsTab = new ToolsTab(this);
		
		setNumberEditText(this.selectBpmTxt, NumberType.POSITIVE_DECIMAL, 120);
		this.selectMidiBtn.onClick = () => {
			const file = File.openDialog("选择一个 MIDI 序列", "MIDI 序列:*.mid;*.midi,所有文件:*.*");
			if (file === null) return;
			try {
				const midi = new Midi(file);
				if (midi.bpm) this.selectBpmTxt.text = String(midi.bpm);
				if (midi.tracks.length === 0) throw new MidiNoTrackError();
				this.selectMidiName.text = file.displayName;
				this.selectedTracksIndex = [midi.preferredTrackIndex];
				const firstTrack = midi.tracks[midi.preferredTrackIndex];
				this.selectTrackBtn.text = firstTrack.toString();
				this.selectTrackBtn.enabled = true;
				this.midi = midi;
			} catch (error) {
				// throw new MyError(error as Error);
			}
		}
		this.applyBtn.onClick = () => {
			const comp = getComp();
			if (comp === null) return;
			const nullLayer = comp.layers.addNull(LARGE_NUMBER);
			nullLayer.name = "fuck";
		}
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
}

export function setLabelMinWidth(label: StaticText) {
	const LABEL_MIN_WIDTH = 60;
	label.minimumSize = [LABEL_MIN_WIDTH, Number.MAX_VALUE];
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
