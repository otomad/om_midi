var User = {
    scriptName: "testScript",
    version: "3.0.12",
};

function addControl(parent, type, params) {
    var control = parent.add(type);
    if (params != undefined)
        for (var key in params)
            if (Object.prototype.hasOwnProperty.call(params, key))
                control[key] = params[key];
    return control;
}

function initUi(window) {
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
    var group = addControl(window, "group", { orientation: "column" });
    group.add("statictext", undefined, "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
        "其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。", { multiline: true });
    /* addControl<StaticText>(group, "statictext", {
        text: "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，" +
            "其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。",
    }); */
    var selectMidiGroup = addControl(group, "group", { alignment: "left", orientation: "row" });
    addControl(selectMidiGroup, "statictext", { text: "MIDI 文件" });
    addControl(selectMidiGroup, "button", { text: "..." }).bounds = [0, 0, 11, 22];
    var tabs = addControl(group, "tabbedpanel");
    addControl(tabs, "tab", { text: "空对象" });
    addControl(tabs, "tab", { text: "应用效果" });
    addControl(tabs, "tab", { text: "工具" });
}
//#region 界面初始化函数
function buildUI(thisObj, User) {
    var window = thisObj instanceof Panel ? thisObj :
        new Window("palette", User.scriptName + " v" + User.version, undefined, {
            resizeable: true,
        });
    if (window === null)
        return;
    initUi(window);
    if (window instanceof Window) {
        window.onResizing = window.onResize = function () { return window.layout.resize(); };
        window.center();
        window.show();
    }
    else {
        window.layout.layout(true);
        window.layout.resize();
    }
}
//#endregion

buildUI(this, User);
