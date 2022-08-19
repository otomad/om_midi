import { IUser } from "../user";
import addControl from "../module/addControl";
import portal from "./portal";

function initPortal(window: Window | Panel) {
	/* const group = window.add("group");
	group.orientation = "column";
	group.add("statictext", undefined, "Name:");
	const nameTxt = group.add("edittext", undefined, "John");
	nameTxt.characters = 30;
	nameTxt.active = true;
	const myButtonGroup = window.add("group");
	myButtonGroup.alignment = "right";
	myButtonGroup.orientation = "row";
	myButtonGroup.add("button", undefined, "OK").helpTip = "第一个按钮";
	myButtonGroup.add("button", undefined, "Cancel").helpTip = "第二个按钮"; */
	/* addControl(group, "statictext", {
		text: "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
		"其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。",
	}, { multiline: true }).minimumSize = [380, 0]; */
	portal.window = window;
	portal.group = addControl(window, "group", { orientation: "column" });
	portal.toolbarGroup = addControl(portal.group, "group", { orientation: "row", alignment: "right" });
	portal.selectMidiGroup = addControl(portal.group, "group", { alignment: "left", orientation: "row" });
	portal.selectMidiLbl = addControl(portal.selectMidiGroup, "statictext", { text: "MIDI 文件" });
	portal.selectMidiBtn = addControl(portal.selectMidiGroup, "button", {
		text: "...",
		bounds: [0, 0, 15, 22],
	});
	portal.selectMidiName = addControl(portal.selectMidiGroup, "statictext", { text: "未选择", minimumSize: [200, 0] });
	portal.tabs = addControl(portal.group, "tabbedpanel");
	portal.nullObjTab = addControl(portal.tabs, "tab", { text: "空对象" });
	portal.applyEffectTab = addControl(portal.tabs, "tab", { text: "应用效果" });
	portal.toolsTab = addControl(portal.tabs, "tab", { text: "工具" });
	portal.applyBtn = addControl(portal.group, "button", { text: "应用", alignment: "left" });
	portal.settingBtn = addControl(portal.toolbarGroup, "iconbutton");
	portal.aboutBtn = addControl(portal.toolbarGroup, "iconbutton");
	
	portal.selectMidiBtn.onClick = () => {
		const file = File.openDialog("选择一个 MIDI 序列", "MIDI 序列:*.mid;*.midi,所有文件:*.*");
		if (portal.selectMidiName) {
			portal.selectMidiName.text = file.displayName;
		}
	}
	portal.aboutBtn.onClick = () => {
		alert("读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。");
	}
}

//#region 界面初始化函数
export default function buildPortal(thisObj: Panel, User: IUser) {
	const window = thisObj instanceof Panel ? thisObj :
		new Window("palette", User.scriptName + " v" + User.version, undefined, {
			resizeable: true,
		});
	if (window === null) return;
	initPortal(window);
	if (window instanceof Window) {
		window.onResizing = window.onResize = () => window.layout.resize();
		window.center();
		window.show();
	} else {
		window.layout.layout(true);
		window.layout.resize();
	}
}
//#endregion
