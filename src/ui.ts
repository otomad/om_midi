import { IUser } from "./user";
import addControl from "./module/addControl";

function initUi(window: Window | Panel) {
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
	const group = addControl<Group>(window, "group", { orientation: "column" });
	group.add("statictext", undefined, "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
		"其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。", { multiline: true });
	/* addControl<StaticText>(group, "statictext", {
		text: "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
			"其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。",
	}); */
	const selectMidiGroup = addControl<Group>(group, "group", { alignment: "left", orientation: "row" });
	addControl<StaticText>(selectMidiGroup, "statictext", { text: "MIDI 文件" });
	addControl<Button>(selectMidiGroup, "button", { text: "..." }).bounds = [0, 0, 11, 22];
	const tabs = addControl<TabbedPanel>(group, "tabbedpanel");
	addControl<Tab>(tabs, "tab", { text: "空对象" });
	addControl<Tab>(tabs, "tab", { text: "应用效果" });
	addControl<Tab>(tabs, "tab", { text: "工具" });
}

//#region 界面初始化函数
export default function buildUI(thisObj: Panel, User: IUser) {
	const window = thisObj instanceof Panel ? thisObj :
		new Window("palette", User.scriptName + " v" + User.version, undefined, {
			resizeable: true,
		});
	if (window === null) return;
	initUi(window);
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
