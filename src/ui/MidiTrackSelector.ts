import { CannotFindWindowError } from "../errors";
import uiStr from "../languages/uiStr";
import MidiTrack from "../midi/MidiTrack";
import addControl from "../module/addControl";
import Portal from "./Portal";

export default class MidiTrackSelector {
	parent: Portal;
	window: Window;
	group: Group;
	buttonGroup: Group;
	okBtn: Button;
	cancelBtn: Button;
	selectAllCheck: Checkbox;
	trackList: ListBox;
	
	constructor(parent: Portal) {
		this.parent = parent;
		this.window = new Window("dialog", "选择 MIDI 轨道", undefined, {
			resizeable: true,
		});
		if (this.window === null) throw new CannotFindWindowError();
		this.window.onResizing = this.window.onResize = () => this.window.layout.resize();
		
		this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: ["fill", "fill"] });
		this.selectAllCheck = addControl(this.group, "checkbox", { text: localize(uiStr.select_all) });
		this.trackList = addControl(this.group, "listbox", { alignment: ["fill", "fill"] }, {
			multiselect: true, numberOfColumns: 4, showHeaders: true,
			columnTitles: [localize(uiStr.channel), localize(uiStr.name), localize(uiStr.note_count)],
			columnWidths: [50, 225, 75],
		});
		this.trackList.size = [400, 400];
		this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
		this.okBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.ok) });
		this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.cancel) });
		this.window.defaultElement = this.okBtn;
		this.window.cancelElement = this.cancelBtn;
		this.initMidiTracks();
		
		this.selectAllCheck.onClick = () => {
			const checked = this.selectAllCheck.value;
			for (const item of this.trackList.items)
				item.checked = item.selected = checked;
		}
		this.trackList.onChange = () => this.trackList_onChange();
		this.okBtn.onClick = () => {
			if (!this.parent.midi) {
				this.window.close();
				return;
			}
			const checks: MidiTrack[] = [];
			for (let i = 0; i < this.trackList.items.length; i++) {
				const item = this.trackList.items[i];
				const track = this.parent.midi.tracks[i];
				if (item.checked) checks.push(track);
			}
			let text = "";
			if (checks.length === 0) {
				alert("请至少选择一条轨道。", localize(uiStr.warning));
				return;
			} else if (checks.length === 1)
				text = checks[0].toString();
			else {
				const arr: string[] = [];
				for (const track of checks) {
					let text = String(track.channel ?? 0);
					if (track.name) text += ": " + track.name;
					arr.push(text);
				}
				text = arr.join("; ");
			}
			this.parent.selectedTracks = checks;
			this.parent.selectTrackBtn.text = text;
			this.window.close();
		}
	}
	
	showDialog() {
		this.window.center();
		this.window.show();
	}
	
	private initMidiTracks() {
		if (this.parent.midi)
			for (const track of this.parent.midi.tracks) {
				const item = this.trackList.add("item", String(track.channel ?? 0))
				item.checked = this.parent.selectedTracks.includes(track);
				item.subItems[0].text = track.name ?? "";
				item.subItems[1].text = track.noteCount;
			}
		this.trackList_onChange(true);
	}
	
	trackList_onChange(forInitTracks = false) {
		let checkAll = true;
		for (const item of this.trackList.items) {
			if (!forInitTracks) item.checked = item.selected;
			if (!item.checked) checkAll = false;
		}
		this.selectAllCheck.value = checkAll;
	}
}
