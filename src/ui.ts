import { IUser } from "./user";

function initUi(window: Window | Panel) {
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
