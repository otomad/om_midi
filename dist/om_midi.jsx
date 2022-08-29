/**
 * om midi v3.0
 * 简称 OMM，After Effects 的音 MAD / YTPMV 辅助脚本。它是一个能够自动将 MIDI 文件转换为 After Effects 中关键帧的脚本。
 * 希望在 om midi 的帮助下，可以把人们从枯燥繁重的音画对齐中解救出来，把更多的精力投入到更有创造性的工作中。
 *
 * 描述：读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。
 *
 * 脚本原作者：大卫·范·布林克 (omino)、Dora (NGDXW)、韩琦、家鳖大帝
 * 脚本作者：兰音
 *
 * 部署日期：2022 年 8 月 29 日 星期一 上午 11:35:36
 * Copyright (c) 2022 ~, Ranne
 *
 * 原作者介绍：
 * 日期：2011 年 12 月 25 日 星期日 晚上 22:58:10 太平洋时间
 * 作者：大卫·范·布林克
 *
 * 此脚本是 omino Adobe 脚本套件的一部分。
 * 我写这些是因为我喜欢。请尽情享受。
 * 向 poly@omino.com 提出问题，主题行应以“插件”开头，以便我的垃圾邮件过滤器允许它。
 * 此文件已被预处理为独立脚本。我针对一些可重用的库开发它们——例如对话框布局——但对于分发来说，最好只有一个文件。
 * 大卫·范·布林克 2007。
 *
 * ****************************************************************************************************
 *
 * om midi v3.0
 * Or OMM for short, an Otomad/YTPMV assistant script for After Effects. It is a script that automatically
 * converts MIDI files to keyframes in After Effects. Hope that with the help of om midi, people can be
 * rescued from tedious aligning video and audio, and put more energy into more creative works.
 *
 * Description: This After Effects script reads a Standard MIDI file (.mid)
 * and creates layers and keyframes corresponding to the notes and controllers in that MIDI file.
 *
 * Script Original Authors: David Van Brink (omino), Dora (NGDXW), HanceyMica, Z4HD
 * Script Author: Ranne
 *
 * Building Date: Monday, August 29, 2022 11:35 AM
 * Copyright (c) 2022 ~, Ranne
 *
 * Introduction of the Original Author:
 * Date: Sunday, December 25, 2011 10:58 PM PST
 * Author: David Van Brink
 * This script is part of the omino adobe script suite.
 *
 * I write these because I like to. Please enjoy as you see fit.
 *
 * Questions to poly@omino.com, subject line should start with "plugins" so my spam filter lets it in.
 *
 * This file has been preprocessed to be standalone. I develop them against some reusable libraries
 * -- such as for dialog layout -- but for distribution it's nicer to have just one file.
 * dvb 2007.
 */

(function (thisObj) {

const User = {
	scriptName: "om midi",
	version: "3.0",
};

// 该文件使用 js 而不是 ts 以便 rollup 配置识别。

//#endregion
/**
 * 添加控件，并同时添加参数。
 * @param parent - 父容器。
 * @param type - 控件类型。
 * @param params - 控件参数。
 * @param properties - 控件属性。
 * @returns 添加的控件。
 */
function addControl(parent, type, params, properties) {
    var _control;
    if (type == "group")
        _control = parent.add(type, undefined, properties);
    else if (type == "progressbar")
        _control = parent.add(type, undefined, undefined, undefined, properties);
    else if (type == "scrollbar" || type == "slider")
        _control = parent.add(type, undefined, undefined, undefined, undefined, properties);
    // 技术难点待解决，联合类型无法被收敛到此重载函数。暂时无解用 any 临时解决。
    else
        _control = parent.add(type, undefined, undefined, properties);
    // 技术难点待解决，未知原因，疑同上。
    var control = _control;
    if (params != undefined)
        for (var key in params)
            if (Object.prototype.hasOwnProperty.call(params, key))
                control[key] = params[key];
    return control;
}
function addItems(dropDownList) {
    var items = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        items[_i - 1] = arguments[_i];
    }
    for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
        var item = items_1[_a];
        dropDownList.add("item", item);
    }
    dropDownList.selection = 0;
    return dropDownList;
}
function addGroup(parent, name, type, params, properties) {
    //#region functions
    var addGroup = function () { return addControl(parent, "group", { orientation: "row", spacing: 7, alignment: "fill", alignChildren: "fill" }); };
    var setLabelMinWidth = function (label) {
        var LABEL_MIN_WIDTH = 60;
        label.minimumSize = [LABEL_MIN_WIDTH, Number.MAX_VALUE];
    };
    var addLabel = function (parent, text) {
        var label = addControl(parent, "statictext", { text: text });
        setLabelMinWidth(label);
        return label;
    };
    //#endregion
    var group = addGroup();
    var label = addLabel(group, name);
    var control = undefined;
    if (type)
        control = addControl(group, type, params, properties);
    var result = { group: group, label: label, control: control };
    return result;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var SPACING = 2;
var tabGroupParams = {
    orientation: "column",
    alignment: "left",
    alignChildren: "left",
    spacing: SPACING,
    margins: [10, 5, 10, 0],
};
var BaseTab = /** @class */ (function () {
    function BaseTab(parent, text, groupParams) {
        if (groupParams === void 0) { groupParams = tabGroupParams; }
        this.parent = parent;
        this.tab = addControl(this.parent.tabs, "tab", { text: text });
        this.group = addControl(this.tab, "group", groupParams);
    }
    /**
     * 获取组内勾选了的复选框。
     * @returns 勾选了的复选框。
     */
    BaseTab.prototype.getCheckedChecks = function () {
        var checks = [];
        for (var _i = 0, _a = this.group.children; _i < _a.length; _i++) {
            var check = _a[_i];
            if (check instanceof Checkbox && check.value)
                checks.push(check);
        }
        return checks;
    };
    BaseTab.prototype.addCheckbox = function (text) {
        return addControl(this.group, "checkbox", { text: text });
    };
    return BaseTab;
}());

var NullObjTab = /** @class */ (function (_super) {
    __extends(NullObjTab, _super);
    //#endregion
    function NullObjTab(parent) {
        var _this = _super.call(this, parent, "空对象") || this;
        _this.pitch = _this.addCheckbox("音高");
        _this.velocity = _this.addCheckbox("力度");
        _this.duration = _this.addCheckbox("持续时间");
        _this.scale = _this.addCheckbox("缩放");
        _this.cwRotation = _this.addCheckbox("顺时针旋转");
        _this.ccwRotation = _this.addCheckbox("逆时针旋转");
        _this.count = _this.addCheckbox("计数");
        _this.bool = _this.addCheckbox("布尔");
        _this.timeRemap = _this.addCheckbox("时间重映射");
        _this.whirl = _this.addCheckbox("来回");
        _this.noteOn = _this.addCheckbox("音符开");
        return _this;
    }
    return NullObjTab;
}(BaseTab));

var ApplyEffectsTab = /** @class */ (function (_super) {
    __extends(ApplyEffectsTab, _super);
    //#endregion
    function ApplyEffectsTab(parent) {
        var _a;
        var _this = _super.call(this, parent, "应用效果") || this;
        _this.timeRemap = _this.addCheckbox("时间重映射（拉伸）");
        _this.timeRemap2 = _this.addCheckbox("时间重映射（截断）");
        _this.hFlip = _this.addCheckbox("水平翻转");
        _this.cwRotation = _this.addCheckbox("顺时针旋转");
        _this.ccwRotation = _this.addCheckbox("逆时针旋转");
        _this.negative = _this.addCheckbox("颜色反转");
        _this.tunning = _this.addCheckbox("调音");
        (_a = addGroup(_this.group, "原始音高", "dropdownlist"), _this.basePitchGroup = _a.group, _this.basePitchLbl = _a.label, _this.basePitchKeyCombo = _a.control);
        _this.basePitchOctCombo = addControl(_this.basePitchGroup, "dropdownlist");
        addItems.apply(void 0, __spreadArray([_this.basePitchKeyCombo], "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(',')));
        addItems.apply(void 0, __spreadArray([_this.basePitchOctCombo], "0,1,2,3,4,5,6,7,8,9,10".split(',')));
        _this.basePitchOctCombo.selection = 5;
        _this.basePitchGroup.enabled = false;
        _this.tunning.onClick = function () { return _this.basePitchGroup.enabled = _this.tunning.value; };
        _this.cwRotation.onClick = function () { return _this.ccwRotation.value = false; };
        _this.ccwRotation.onClick = function () { return _this.cwRotation.value = false; };
        _this.timeRemap.onClick = function () { return _this.timeRemap2.value = false; };
        _this.timeRemap2.onClick = function () { return _this.timeRemap.value = false; };
        return _this;
    }
    return ApplyEffectsTab;
}(BaseTab));

var NumberType;
(function (NumberType) {
    NumberType[NumberType["POSITIVE_INT"] = 0] = "POSITIVE_INT";
    NumberType[NumberType["POSITIVE_DECIMAL"] = 1] = "POSITIVE_DECIMAL";
})(NumberType || (NumberType = {}));
function setNumberEditText(editText, type, defaultValue) {
    editText.onChange = function () {
        var text = editText.text;
        var matches = text.match(NumberType.POSITIVE_INT ? /\d+/g : /\d+(\.\d+)?/g);
        if (matches) {
            text = matches[0].replace(/^0+(?!\.)/g, "");
            var num = type == NumberType.POSITIVE_INT ? parseInt(text, 10) : parseFloat(text);
            if (num <= 0 || isNaN(num))
                text = String(defaultValue);
        }
        else
            text = String(defaultValue);
        editText.text = text;
    };
}

var MarkerConductor = /** @class */ (function () {
    //#endregion
    function MarkerConductor(parent) {
        var _a, _b, _c;
        this.parent = parent;
        this.group = addControl(this.parent.toolsPanel, "group", {
            orientation: "column",
            alignment: ["fill", "fill"],
            alignChildren: "fill",
            spacing: SPACING,
        });
        var FILL_CENTER = ["fill", "center"];
        (_a = addGroup(this.group, "BPM", "edittext", { text: "120", alignment: FILL_CENTER }), this.bpmGroup = _a.group, this.bpmLbl = _a.label, this.bpmTxt = _a.control);
        (_b = addGroup(this.group, "节拍", "edittext", { text: "4", alignment: FILL_CENTER }), this.beatGroup = _b.group, this.beatLbl = _b.label, this.beatTxt = _b.control);
        (_c = addGroup(this.group, "标记在", "dropdownlist", { alignment: FILL_CENTER }), this.markOnGroup = _c.group, this.markOnLbl = _c.label, this.markOnCombo = _c.control);
        addItems(this.markOnCombo, "新建空对象图层", "当前图层");
        setNumberEditText(this.beatTxt, NumberType.POSITIVE_INT, 4);
        setNumberEditText(this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
    }
    return MarkerConductor;
}());

var ToolsTab = /** @class */ (function (_super) {
    __extends(ToolsTab, _super);
    //#endregion
    function ToolsTab(parent) {
        var _this = _super.call(this, parent, "工具", { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] }) || this;
        _this.toolsCombo = addControl(_this.group, "dropdownlist");
        _this.toolsCombo.add("item", "标记生成");
        _this.toolsCombo.selection = 0;
        _this.toolsPanel = addControl(_this.group, "group", { alignment: "fill", alignChildren: "fill" });
        _this.marker = new MarkerConductor(_this);
        return _this;
    }
    return ToolsTab;
}(BaseTab));

var Separator = /** @class */ (function () {
    function Separator(parent, orientation) {
        this.control = parent.add("panel");
        this.control.alignment = orientation === "horizontal" ? ["fill", "top"] : ["center", "fill"];
    }
    return Separator;
}());

var str = {
    ok: {
        zh: "确定",
        en: "OK",
        ja: "OK",
    },
    cancel: {
        zh: "取消",
        en: "Cancel",
        ja: "キャンセル",
    },
    channel_abbr: {
        zh: "通道",
        en: "CH",
        ja: "チャネル",
    },
    error: {
        zh: "错误",
        en: "Error",
        ja: "エラー",
    },
    warning: {
        zh: "警告",
        en: "Warning",
        ja: "警告",
    },
    apply: {
        zh: "应用",
        en: "Apply",
        ja: "適用",
    },
    settings: {
        zh: "设置",
        en: "Settings",
        ja: "設定",
    },
};

var MyError = /** @class */ (function (_super) {
    __extends(MyError, _super);
    function MyError(msg) {
        var _this = this;
        alert(msg.toString(), localize(str.error), true);
        _this = _super.call(this, msg.toString()) || this;
        return _this;
    }
    return MyError;
}(Error));
var CannotFindWindowError = /** @class */ (function (_super) {
    __extends(CannotFindWindowError, _super);
    function CannotFindWindowError() {
        return _super.call(this, "错误：无法找到或创建窗口。") || this;
    }
    return CannotFindWindowError;
}(MyError));
var UnsupportedSettingTypeError = /** @class */ (function (_super) {
    __extends(UnsupportedSettingTypeError, _super);
    function UnsupportedSettingTypeError() {
        return _super.call(this, "错误：不支持的设置数据类型。") || this;
    }
    return UnsupportedSettingTypeError;
}(MyError));
var FileUnreadableError = /** @class */ (function (_super) {
    __extends(FileUnreadableError, _super);
    function FileUnreadableError() {
        return _super.call(this, "错误：无法读取 MIDI 文件。该文件可能已占用或不存在。") || this;
    }
    return FileUnreadableError;
}(MyError));
var MidiHeaderValidationError = /** @class */ (function (_super) {
    __extends(MidiHeaderValidationError, _super);
    function MidiHeaderValidationError() {
        return _super.call(this, "错误：MIDI 文件头验证失败（不是标准 MIDI 文件或文件已损坏）。") || this;
    }
    return MidiHeaderValidationError;
}(MyError));
var MidiTrackHeaderValidationError = /** @class */ (function (_super) {
    __extends(MidiTrackHeaderValidationError, _super);
    function MidiTrackHeaderValidationError() {
        return _super.call(this, "错误：MIDI 轨道块标头验证失败。") || this;
    }
    return MidiTrackHeaderValidationError;
}(MyError));
var MidiCustomEventsError = /** @class */ (function (_super) {
    __extends(MidiCustomEventsError, _super);
    function MidiCustomEventsError() {
        return _super.call(this, "错误：自定义 MIDI 事件无法读取。") || this;
    }
    return MidiCustomEventsError;
}(MyError));
var MidiNoTrackError = /** @class */ (function (_super) {
    __extends(MidiNoTrackError, _super);
    function MidiNoTrackError() {
        return _super.call(this, "错误：该 MIDI 文件不包含任何有效轨道。") || this;
    }
    return MidiNoTrackError;
}(MyError));
var NotAfterEffectsError = /** @class */ (function (_super) {
    __extends(NotAfterEffectsError, _super);
    function NotAfterEffectsError() {
        return _super.call(this, "错误：请在 Adobe After Effects 上使用此脚本。") || this;
    }
    return NotAfterEffectsError;
}(MyError));
var CannotCreateFileError = /** @class */ (function (_super) {
    __extends(CannotCreateFileError, _super);
    function CannotCreateFileError() {
        return _super.call(this, "错误：无法创建文件。") || this;
    }
    return CannotCreateFileError;
}(MyError));
var CannotFindCompositionError = /** @class */ (function (_super) {
    __extends(CannotFindCompositionError, _super);
    function CannotFindCompositionError() {
        return _super.call(this, "错误：无法找到活动合成。请先激活一个合成。") || this;
    }
    return CannotFindCompositionError;
}(MyError));
var NoMidiError = /** @class */ (function (_super) {
    __extends(NoMidiError, _super);
    function NoMidiError() {
        return _super.call(this, "错误：请先打开一个有效的 MIDI 文件。") || this;
    }
    return NoMidiError;
}(MyError));
var NoOptionsCheckedError = /** @class */ (function (_super) {
    __extends(NoOptionsCheckedError, _super);
    function NoOptionsCheckedError() {
        return _super.call(this, "错误：请至少勾选一个项目。") || this;
    }
    return NoOptionsCheckedError;
}(MyError));
var NoLayerSelectedError = /** @class */ (function (_super) {
    __extends(NoLayerSelectedError, _super);
    function NoLayerSelectedError() {
        return _super.call(this, "错误：在当前合成中未选中任何图层。") || this;
    }
    return NoLayerSelectedError;
}(MyError));
var NotOneTrackForApplyEffectsOnlyError = /** @class */ (function (_super) {
    __extends(NotOneTrackForApplyEffectsOnlyError, _super);
    function NotOneTrackForApplyEffectsOnlyError() {
        return _super.call(this, "错误：应用效果只能同时选择一条轨道。") || this;
    }
    return NotOneTrackForApplyEffectsOnlyError;
}(MyError));

// 取名为 Setting 而不是 Settings 以免和内置对象冲突。
var sectionName = "om_midi";
var Setting = {
    get: function (key, defaultValue) {
        if (!app.settings.haveSetting(sectionName, key))
            return defaultValue;
        else {
            var str = app.settings.getSetting(sectionName, key);
            var result = void 0;
            if (typeof defaultValue == "string")
                result = str;
            else if (typeof defaultValue == "number")
                result = Number(str);
            else if (typeof defaultValue == "boolean")
                result = str !== "0";
            else
                throw new UnsupportedSettingTypeError();
            return result;
        }
    },
    set: function (key, value) {
        var v = value;
        if (typeof value == "boolean")
            v = v ? "1" : "0";
        app.settings.saveSetting(sectionName, key, v.toString());
    },
    has: function (key) {
        return app.settings.haveSetting(sectionName, key);
    }
};

var TempFile = /** @class */ (function (_super) {
    __extends(TempFile, _super);
    function TempFile(fileName) {
        return _super.call(this, Folder.temp.fsName + '/' + fileName) || this;
    }
    return TempFile;
}(File));

/**
 * 打开网址。
 * @param url - 网址。
 */
function openUrl(url) {
    var cmd;
    if ($.os.indexOf("Win") !== -1) { // Windows
        cmd = "explorer.exe " + url;
    }
    else { // macOS
        cmd = "open " + url;
    }
    try {
        system.callSystem(cmd);
    }
    catch (error) {
        // alert(error);
    }
}

var ABOUT = "\u8BFB\u53D6\u4E00\u4E2A MIDI \u5E8F\u5217\uFF0C\u5E76\u4E3A\u5F53\u524D\u5408\u6210\u6DFB\u52A0\u4E00\u4E2A\u6216\u591A\u4E2A\u65B0\u56FE\u5C42\uFF0C\u5176\u4E2D\u5305\u542B\u5404\u4E2A MIDI \u8F68\u9053\u7684\u97F3\u9AD8\u3001\u529B\u5EA6\u548C\u6301\u7EED\u65F6\u95F4\u7B49\u6ED1\u5757\u63A7\u4EF6\u3002\n\n\u811A\u672C\u539F\u4F5C\u8005\uFF1A\u5927\u536B\u00B7\u8303\u00B7\u5E03\u6797\u514B (omino)\u3001Dora (NGDXW)\u3001\u97E9\u7426\u3001\u5BB6\u9CD6\u5927\u5E1D\n\u811A\u672C\u4F5C\u8005\uFF1A\u5170\u97F3";
var SettingsDialog = /** @class */ (function () {
    //#endregion
    function SettingsDialog() {
        var _a;
        var _this = this;
        this.window = new Window("dialog", localize(str.settings) + " - " + User.scriptName + " v" + User.version, undefined, {
            resizeable: false,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.group = addControl(this.window, "group", { orientation: "row", alignChildren: "fill", alignment: "fill" });
        this.leftGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        this.separator = new Separator(this.group, "vertical");
        this.rightGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        this.aboutLbl = addControl(this.leftGroup, "statictext", { text: ABOUT }, { multiline: true, scrolling: true });
        this.openGithubBtnGroup = addControl(this.leftGroup, "group", { orientation: "row", alignment: "left" });
        this.openGithubLatestBtn = addControl(this.openGithubBtnGroup, "button", { text: "检查更新" });
        this.openGithubPageBtn = addControl(this.openGithubBtnGroup, "button", { text: "仓库地址" });
        this.importOmUtilsBtn = addControl(this.openGithubBtnGroup, "button", { text: "导入 om utils" });
        this.importPureQuarterMidiBtn = addControl(this.openGithubBtnGroup, "button", { text: "导入纯四分 MIDI" });
        (_a = addGroup(this.rightGroup, "语言", "dropdownlist"), this.languageGroup = _a.group, this.languageLbl = _a.label, this.languageCombo = _a.control);
        addItems(this.languageCombo, "应用默认值", "简体中文", "English", "日本語");
        var selectedLanguageIndex = Setting.get("Language", 0);
        if (selectedLanguageIndex > 0 && selectedLanguageIndex < this.languageCombo.items.length)
            this.languageCombo.selection = selectedLanguageIndex;
        this.usingSelectedLayerName = addControl(this.rightGroup, "checkbox", { text: "空对象：使用选中图层名称而不是 MIDI 轨道名称" });
        this.usingSelectedLayerName.value = Setting.get("UsingSelectedLayerName", false);
        this.usingLayering = addControl(this.rightGroup, "checkbox", { text: "应用效果：冰鸠さくの特有图层叠叠乐。" });
        this.usingLayering.value = Setting.get("UsingLayering", false);
        this.buttonGroup = addControl(this.rightGroup, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
        this.okBtn = addControl(this.buttonGroup, "button", { text: localize(str.ok) });
        this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(str.cancel) });
        this.window.defaultElement = this.okBtn;
        this.window.cancelElement = this.cancelBtn;
        this.okBtn.onClick = function () {
            Setting.set("UsingSelectedLayerName", _this.usingSelectedLayerName.value);
            Setting.set("UsingLayering", _this.usingLayering.value);
            Setting.set("Language", _this.languageCombo.getSelectedIndex());
            $.locale = SettingsDialog.langIso[_this.languageCombo.getSelectedIndex()];
            _this.window.close();
        };
        this.openGithubPageBtn.onClick = function () { return openUrl("https://github.com/otomad/om_midi"); };
        this.openGithubLatestBtn.onClick = function () { return openUrl("https://github.com/otomad/om_midi/releases/latest"); };
    }
    SettingsDialog.prototype.show = function () {
        this.window.center();
        this.window.show();
    };
    SettingsDialog.langIso = ["", "zh_CN", "en", "ja"];
    return SettingsDialog;
}());

// ²âÊÔ0 → 测试0
function convertTextEncoding(texts) {
    if (typeof texts === "string")
        texts = [texts];
    if (texts.length === 0)
        return [];
    var file = new TempFile("tmp" + new Date().valueOf() + ".txt");
    var defaultEncoding; // 系统默认编码
    if (file && file.open("w")) {
        defaultEncoding = file.encoding;
        file.encoding = "binary";
        for (var _i = 0, texts_1 = texts; _i < texts_1.length; _i++) {
            var text = texts_1[_i];
            file.writeln(text);
        }
        file.close();
    }
    else
        throw new CannotCreateFileError();
    var results = [];
    if (file && file.open("r")) {
        file.encoding = defaultEncoding;
        while (!file.eof)
            results.push(file.readln());
        file.close();
        file.remove();
    }
    else
        throw new CannotCreateFileError();
    return results;
}

/**
 * MIDI 文件格式类型。
 */
var MidiFormatType;
(function (MidiFormatType) {
    /**
     * MIDI 文件只有一条轨道，所有的通道都在一条轨道中。
     */
    MidiFormatType[MidiFormatType["SINGLE_TRACK"] = 0] = "SINGLE_TRACK";
    /**
     * MIDI 文件有多个音轨，并且是同步的，即所有的轨道同时播放。
     */
    MidiFormatType[MidiFormatType["SYNC_MULTI_TRACK"] = 1] = "SYNC_MULTI_TRACK";
    /**
     * MIDI 文件有多个音轨，不同步。
     */
    MidiFormatType[MidiFormatType["ASYNC_MULTI_TRACK"] = 2] = "ASYNC_MULTI_TRACK";
})(MidiFormatType || (MidiFormatType = {}));
var MetaEventType;
(function (MetaEventType) {
    // 结束
    MetaEventType[MetaEventType["END_OF_TRACK"] = 47] = "END_OF_TRACK";
    MetaEventType[MetaEventType["END_OF_FILE"] = -1] = "END_OF_FILE";
    // 读字符串
    MetaEventType[MetaEventType["TEXT_EVENT"] = 1] = "TEXT_EVENT";
    MetaEventType[MetaEventType["COPYRIGHT_NOTICE"] = 2] = "COPYRIGHT_NOTICE";
    MetaEventType[MetaEventType["TRACK_NAME"] = 3] = "TRACK_NAME";
    MetaEventType[MetaEventType["INSTRUMENT_NAME"] = 4] = "INSTRUMENT_NAME";
    MetaEventType[MetaEventType["LYRICS"] = 5] = "LYRICS";
    MetaEventType[MetaEventType["MARKER"] = 6] = "MARKER";
    MetaEventType[MetaEventType["CUE_POINT"] = 7] = "CUE_POINT";
    // 读一位数字
    MetaEventType[MetaEventType["MIDI_PORT"] = 33] = "MIDI_PORT";
    MetaEventType[MetaEventType["MIDI_PORT_2"] = 32] = "MIDI_PORT_2";
    MetaEventType[MetaEventType["SET_TEMPO"] = 81] = "SET_TEMPO";
    MetaEventType[MetaEventType["KEY_SIGNATURE"] = 89] = "KEY_SIGNATURE";
    MetaEventType[MetaEventType["SMPTE_OFFSET"] = 84] = "SMPTE_OFFSET";
    MetaEventType[MetaEventType["TIME_SIGNATURE"] = 88] = "TIME_SIGNATURE";
    MetaEventType[MetaEventType["SEQUENCER_SPECIFIC"] = 127] = "SEQUENCER_SPECIFIC";
})(MetaEventType || (MetaEventType = {}));
var RegularEventType;
(function (RegularEventType) {
    RegularEventType[RegularEventType["SYSTEM_EXCLUSIVE_EVENTS"] = 15] = "SYSTEM_EXCLUSIVE_EVENTS";
    RegularEventType[RegularEventType["NOTE_AFTERTOUCH"] = 10] = "NOTE_AFTERTOUCH";
    RegularEventType[RegularEventType["CONTROLLER"] = 11] = "CONTROLLER";
    RegularEventType[RegularEventType["PITCH_BEND_EVENT"] = 14] = "PITCH_BEND_EVENT";
    RegularEventType[RegularEventType["NOTE_OFF"] = 8] = "NOTE_OFF";
    RegularEventType[RegularEventType["NOTE_ON"] = 9] = "NOTE_ON";
    RegularEventType[RegularEventType["PROGRAM_CHANGE"] = 12] = "PROGRAM_CHANGE";
    RegularEventType[RegularEventType["CHANNEL_AFTERTOUCH"] = 13] = "CHANNEL_AFTERTOUCH";
    RegularEventType[RegularEventType["END_OF_FILE"] = -1] = "END_OF_FILE";
})(RegularEventType || (RegularEventType = {}));
var MidiFormatType$1 = MidiFormatType;

var IFileReader = /** @class */ (function () {
    function IFileReader() {
    }
    return IFileReader;
}());

var BinFileReader = /** @class */ (function (_super) {
    __extends(BinFileReader, _super);
    function BinFileReader(file) {
        var _this = _super.call(this) || this;
        _this.file = file;
        return _this;
    }
    BinFileReader.prototype.getPointer = function () {
        return this.file.tell();
    };
    BinFileReader.prototype.length = function () {
        return this.file.length;
    };
    BinFileReader.prototype.readByte = function (bytes) {
        if (bytes === void 0) { bytes = 1; }
        var str = this.file.read(bytes);
        var value = 0;
        for (var i = 0; i < str.length; i++) {
            value <<= 8;
            value += str.charCodeAt(i);
        }
        return value;
    };
    BinFileReader.prototype.readString = function (bytes) {
        return this.file.read(bytes);
    };
    BinFileReader.prototype.readByteArray = function (bytes) {
        var str = this.file.read(bytes);
        var array = [];
        for (var i = 0; i < str.length; i++)
            array.push(str.charCodeAt(i));
        return array;
    };
    BinFileReader.prototype.readDeltaTime = function () {
        var value = 0;
        var isLowByte = false;
        while (!(this.isReadOver() || isLowByte)) {
            value <<= 7;
            var b = this.file.read(1).charCodeAt(0);
            if (!(b & 128))
                isLowByte = true;
            value += b & 127;
        }
        return value;
    };
    BinFileReader.prototype.isReadOver = function () {
        return this.file.eof;
    };
    BinFileReader.prototype.movePointer = function (bytes) {
        this.file.seek(bytes, 1);
    };
    BinFileReader.prototype.setPointer = function (pos) {
        if (pos < 0 || pos >= this.length())
            return false;
        return this.file.seek(pos, 0);
    };
    return BinFileReader;
}(IFileReader));

var NoteEvent = /** @class */ (function () {
    function NoteEvent() {
        this.deltaTime = 0; // 与前一项间隔基本时间。
        this.sofarTick = 0; // 至乐曲开始的基本时间。
    }
    return NoteEvent;
}());
var MetaEvent = /** @class */ (function (_super) {
    __extends(MetaEvent, _super);
    function MetaEvent(type) {
        var _this = _super.call(this) || this;
        _this.type = 0;
        _this.type = type;
        return _this;
    }
    return MetaEvent;
}(NoteEvent));
var TextMetaEvent = /** @class */ (function (_super) {
    __extends(TextMetaEvent, _super);
    function TextMetaEvent(type, content) {
        var _this = _super.call(this, type) || this;
        _this.content = content;
        return _this;
    }
    return TextMetaEvent;
}(MetaEvent));
var NumberMetaEvent = /** @class */ (function (_super) {
    __extends(NumberMetaEvent, _super);
    function NumberMetaEvent(type, value) {
        var _this = _super.call(this, type) || this;
        _this.value = value;
        return _this;
    }
    return NumberMetaEvent;
}(MetaEvent));
var SmpteOffsetMetaEvent = /** @class */ (function (_super) {
    __extends(SmpteOffsetMetaEvent, _super);
    function SmpteOffsetMetaEvent(smpteOffset) {
        var _this = _super.call(this, MetaEventType.SMPTE_OFFSET) || this;
        _this.hour = smpteOffset[0];
        _this.min = smpteOffset[1];
        _this.sec = smpteOffset[2];
        _this.fr = smpteOffset[3];
        _this.subFr = smpteOffset[4];
        return _this;
    }
    return SmpteOffsetMetaEvent;
}(MetaEvent));
var TimeSignatureMetaEvent = /** @class */ (function (_super) {
    __extends(TimeSignatureMetaEvent, _super);
    function TimeSignatureMetaEvent(timeSignature) {
        var _this = _super.call(this, MetaEventType.TIME_SIGNATURE) || this;
        _this.number = timeSignature[0];
        _this.denom = timeSignature[1];
        _this.metro = timeSignature[2];
        _this.thirtySeconds = timeSignature[3];
        return _this;
    }
    TimeSignatureMetaEvent.prototype.toString = function () {
        return this.number + "/" + Math.pow(2, this.denom);
    };
    return TimeSignatureMetaEvent;
}(MetaEvent));
var CustomMetaEvent = /** @class */ (function (_super) {
    __extends(CustomMetaEvent, _super);
    function CustomMetaEvent(type, values) {
        var _this = _super.call(this, type) || this;
        _this.value = values;
        return _this;
    }
    return CustomMetaEvent;
}(MetaEvent));
var RegularEvent = /** @class */ (function (_super) {
    __extends(RegularEvent, _super);
    function RegularEvent(type, values) {
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.value = values;
        return _this;
    }
    return RegularEvent;
}(NoteEvent));
var NoteOnOffEvent = /** @class */ (function (_super) {
    __extends(NoteOnOffEvent, _super);
    function NoteOnOffEvent(type, values) {
        var _this = _super.call(this, type, values) || this;
        _this.pitch = values[0];
        _this.velocity = values[1];
        return _this;
    }
    return NoteOnOffEvent;
}(RegularEvent));
var NoteOnEvent = /** @class */ (function (_super) {
    __extends(NoteOnEvent, _super);
    function NoteOnEvent(values) {
        return _super.call(this, RegularEventType.NOTE_ON, values) || this;
    }
    return NoteOnEvent;
}(NoteOnOffEvent));
var NoteOffEvent = /** @class */ (function (_super) {
    __extends(NoteOffEvent, _super);
    function NoteOffEvent(values) {
        return _super.call(this, RegularEventType.NOTE_OFF, values) || this;
    }
    return NoteOffEvent;
}(NoteOnOffEvent));
var SystemExclusiveEvents = /** @class */ (function (_super) {
    __extends(SystemExclusiveEvents, _super);
    function SystemExclusiveEvents(values) {
        return _super.call(this, RegularEventType.SYSTEM_EXCLUSIVE_EVENTS, values) || this;
    }
    return SystemExclusiveEvents;
}(RegularEvent));

var MidiTrack = /** @class */ (function () {
    function MidiTrack(parent, offset, size) {
        this.events = [];
        this.noteCount = 0;
        this.lengthTick = 0; // 此处表示轨道的持续时间。
        this.splice = [].splice;
        this.parent = parent;
        this.offset = offset;
        this.size = size;
        this.readNotes();
    }
    MidiTrack.prototype.length = function () { return this.events.length; };
    // 以下全部没法用 setter 属性。
    MidiTrack.prototype.setName = function (value) { var _a; (_a = this.name) !== null && _a !== void 0 ? _a : (this.name = value); };
    MidiTrack.prototype.setInstrument = function (value) { var _a; (_a = this.instrument) !== null && _a !== void 0 ? _a : (this.instrument = value); };
    MidiTrack.prototype.setChannel = function (value) { var _a; (_a = this.channel) !== null && _a !== void 0 ? _a : (this.channel = value); };
    MidiTrack.prototype.setTempo = function (value) { var _a, _b; var _c; (_a = this.tempo) !== null && _a !== void 0 ? _a : (this.tempo = value); (_b = (_c = this.parent.midi).bpm) !== null && _b !== void 0 ? _b : (_c.bpm = this.bpm()); };
    MidiTrack.prototype.bpm = function () {
        if (this.tempo === undefined)
            return undefined;
        var bpm = 6e7 / this.tempo;
        return parseFloat(bpm.toFixed(2));
    };
    MidiTrack.prototype.push = function (item) {
        this.events.push(item);
    };
    MidiTrack.prototype.readNotes = function () {
        var endOffset = this.offset + this.size;
        var noteOnStack = []; // 音符开事件栈，用于匹配音符关事件。为什么是栈而不是队列？这与 FL Studio 相匹配。
        var statusByte;
        while (!(this.parent.isReadOver() || this.parent.getPointer() >= endOffset)) {
            var deltaTime = this.parent.readDeltaTime();
            var sofarTick = this.lengthTick += deltaTime;
            var lastStatusByte = statusByte; // 当 statusByte 最高二进制位不为 1（即 statusByte < 128），表示与前一次状态相同。
            statusByte = this.parent.readByte(1);
            if (statusByte === -1)
                break;
            else if (!(statusByte & 128)) {
                statusByte = lastStatusByte;
                this.parent.movePointer(-1);
            }
            var note = null;
            if (statusByte === 0xff) { // 元数据事件
                var metaType = this.parent.readByte(1);
                var metaEventLength = this.parent.readDeltaTime();
                switch (metaType) {
                    case MetaEventType.END_OF_TRACK:
                        if (this.parent.getPointer() !== endOffset)
                            alert("\u8F68\u9053\u7ED3\u675F\u4F4D\u7F6E\u6709\u8BEF\u3002\u5E94\u4E3A " + endOffset + "\uFF0C\u5B9E\u9645 " + this.parent.getPointer(), localize(str.error), true);
                    case MetaEventType.END_OF_FILE:
                        return;
                    case MetaEventType.TEXT_EVENT:
                    case MetaEventType.COPYRIGHT_NOTICE:
                    case MetaEventType.TRACK_NAME:
                    case MetaEventType.INSTRUMENT_NAME:
                    case MetaEventType.LYRICS:
                    case MetaEventType.MARKER:
                    case MetaEventType.CUE_POINT:
                        var textContent = this.parent.readString(metaEventLength);
                        note = new TextMetaEvent(metaType, textContent);
                        if (metaType === MetaEventType.TRACK_NAME)
                            this.setName(textContent);
                        else if (metaType === MetaEventType.INSTRUMENT_NAME)
                            this.setInstrument(textContent);
                        break;
                    case MetaEventType.MIDI_PORT: // 长度一般为 1
                    case MetaEventType.MIDI_PORT_2: // 长度一般为 1
                    case MetaEventType.KEY_SIGNATURE: // 长度一般为 2
                    case MetaEventType.SET_TEMPO: // 长度一般为 3
                        var numberValue = this.parent.readByte(metaEventLength);
                        note = new NumberMetaEvent(metaType, numberValue);
                        if (metaType === MetaEventType.SET_TEMPO)
                            this.setTempo(numberValue);
                        break;
                    case MetaEventType.SMPTE_OFFSET: // 长度一般为 5
                        var smpteOffset = this.parent.readByteArray(metaEventLength);
                        note = new SmpteOffsetMetaEvent(smpteOffset);
                        break;
                    case MetaEventType.TIME_SIGNATURE: // 长度一般为 4
                        var timeSignature = this.parent.readByteArray(metaEventLength);
                        note = new TimeSignatureMetaEvent(timeSignature);
                        break;
                    default: // 自定义事件
                        var customValue = this.parent.readByteArray(metaEventLength);
                        note = new CustomMetaEvent(metaType, customValue);
                        break;
                }
            }
            else { // 常规事件
                this.setChannel((statusByte & 0x0f) + 1); // 后半字节表示通道编号。
                var regularType = statusByte >> 4; // 只取前半字节。
                switch (regularType) {
                    case RegularEventType.NOTE_AFTERTOUCH:
                    case RegularEventType.CONTROLLER:
                    case RegularEventType.PITCH_BEND_EVENT:
                    case RegularEventType.NOTE_OFF:
                    case RegularEventType.NOTE_ON:
                        var byte2 = this.parent.readByteArray(2); // 读两位
                        if (regularType == RegularEventType.NOTE_ON) {
                            note = new NoteOnEvent(byte2);
                            var noteOn = note;
                            this.noteCount++;
                            for (var _i = 0, noteOnStack_1 = noteOnStack; _i < noteOnStack_1.length; _i++) {
                                var prevNoteOn = noteOnStack_1[_i];
                                if (prevNoteOn.interruptDuration === undefined)
                                    if (sofarTick <= prevNoteOn.sofarTick)
                                        noteOn.interruptDuration = 0;
                                    else
                                        prevNoteOn.interruptDuration = sofarTick - prevNoteOn.sofarTick;
                            } // 中断复音上的其它音符开。
                            noteOnStack.push(noteOn);
                        }
                        else if (regularType == RegularEventType.NOTE_OFF) {
                            note = new NoteOffEvent(byte2);
                            var noteOff = note;
                            for (var i = noteOnStack.length - 1; i >= 0; i--) {
                                var noteOn = noteOnStack[i];
                                if (noteOn.pitch === noteOff.pitch) {
                                    noteOn.duration = sofarTick - noteOn.sofarTick; // 计算音符时长。
                                    noteOn.noteOff = noteOff;
                                    noteOff.noteOn = noteOn; // 将两个音符关联在一起。
                                    noteOnStack.splice(i, 1); // 移出栈。
                                    break;
                                }
                            }
                        }
                        else
                            note = new RegularEvent(regularType, byte2); // 其它事件暂时无需求而忽略。
                        break;
                    case RegularEventType.PROGRAM_CHANGE:
                    case RegularEventType.CHANNEL_AFTERTOUCH:
                        var byte1 = this.parent.readByteArray(1); // 读一位
                        note = new RegularEvent(regularType, byte1);
                        break;
                    case RegularEventType.END_OF_FILE:
                        return;
                    case RegularEventType.SYSTEM_EXCLUSIVE_EVENTS:
                        var systemExclusiveEventLength = this.parent.readDeltaTime();
                        note = new SystemExclusiveEvents(this.parent.readByteArray(systemExclusiveEventLength));
                        break;
                    default: // 自定义事件，不知道怎么读。
                        throw new MidiCustomEventsError();
                }
            }
            if (note !== null) {
                note.deltaTime = deltaTime;
                note.sofarTick = sofarTick;
                this.push(note);
            }
        }
    };
    /**
     * 表示标识当前轨道的名称。
     * 用于在界面当中显示。
     * @returns 标识当前轨道的名称。
     */
    MidiTrack.prototype.toString = function () {
        var _a;
        var description = localize(str.channel_abbr) + " " + ((_a = this.channel) !== null && _a !== void 0 ? _a : 0);
        if (this.name)
            description += ": " + this.name;
        description += " (" + this.noteCount + ")";
        return description;
    };
    /**
     * 返回当前指针的偏移量。
     * 只是为了调试更方便。
     * @returns 当前指针的偏移量。
     */
    MidiTrack.prototype.getPointer = function () { return this.parent.getPointer(); };
    return MidiTrack;
}());

var MidiReader = /** @class */ (function (_super) {
    __extends(MidiReader, _super);
    function MidiReader(midi) {
        var _this = 
        // super(midi.content);
        _super.call(this, midi.file) || this;
        _this.midi = midi;
        _this.readHeader();
        _this.readTracks();
        return _this;
    }
    MidiReader.prototype.readHeader = function () {
        if (this.readByte(4) !== 0x4D546864) // MThd - Midi Type Header
            throw new MidiHeaderValidationError();
        this.readByte(4); // 文件头字节长度（舍弃）
        this.midi.formatType = this.readByte(2); // MIDI 文件格式类型
        this.midi.trackCount = this.readByte(2); // 轨道数目
        var timeDivisionByte1 = this.readByte(1), timeDivisionByte2 = this.readByte(1); // 时分数据。
        if (timeDivisionByte1 & 128) // 基本时间格式 (fps 或 tpf)
            this.midi.timeDivision = [
                timeDivisionByte1 & 127,
                timeDivisionByte2, // 基本时间每帧 (ticks in each frame) (第 2 字节)
            ];
        else
            this.midi.timeDivision = (timeDivisionByte1 << 8) + timeDivisionByte2; // 基本时间每拍 (ticks per beat) 模式 (2 字节)
    };
    MidiReader.prototype.readTracks = function () {
        while (!this.isReadOver()) {
            var headerValidation = this.readByte(4);
            if (headerValidation === -1)
                break; // 读完了。
            if (headerValidation !== 0x4D54726B) { // MTrk - Midi Track
                throw new MidiTrackHeaderValidationError();
            }
            var trackSize = this.readByte(4); // 当前轨道字节长度（舍弃）
            var track = new MidiTrack(this, this.getPointer(), trackSize);
            this.midi.tracks.push(track);
        }
    };
    return MidiReader;
}(BinFileReader));

var Midi = /** @class */ (function () {
    function Midi(file) {
        this.formatType = MidiFormatType$1.SYNC_MULTI_TRACK;
        this.trackCount = 0;
        this.timeDivision = 0;
        this.tracks = [];
        this.preferredTrackIndex = 0;
        this.isPureQuarter = false;
        if (file === true) {
            this.isPureQuarter = true;
            this.formatType = MidiFormatType$1.SINGLE_TRACK;
            this.trackCount = 1;
            this.timeDivision = 1;
            return;
        }
        this.file = file;
        if (file && file.open("r")) {
            file.encoding = "binary"; // 读取为二进制编码。
            this.length = file.length;
            // this.content = file.read(this.length);
            this.midiReader = new MidiReader(this);
            file.close();
            this.removeNotNoteTrack();
            this.setPreferredTrack();
            this.convertTracksNameEncoding();
        }
        else
            throw new FileUnreadableError();
    }
    /**
     * 删除不是音符的轨道。
     * 可根据需要调用。
     * 如果将来需要读取动态 BPM、节拍等信息时再对此处做出修改。
     */
    Midi.prototype.removeNotNoteTrack = function () {
        for (var i = this.tracks.length - 1; i >= 0; i--) {
            var track = this.tracks[i];
            if (track.noteCount === 0)
                this.tracks.splice(i, 1);
        }
    };
    /**
     * 设定首选轨道。
     */
    Midi.prototype.setPreferredTrack = function () {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            if (track.channel !== 10) {
                this.preferredTrackIndex = i;
                break;
            }
        }
    };
    /**
     * 将 Latin1 编码的轨道名称转换回系统默认编码。
     */
    Midi.prototype.convertTracksNameEncoding = function () {
        var tracks = [];
        var trackNames = [];
        for (var _i = 0, _a = this.tracks; _i < _a.length; _i++) {
            var track = _a[_i];
            if (track.name) {
                tracks.push(track);
                trackNames.push(track.name);
            }
        }
        if (trackNames.length === 0)
            return;
        trackNames = convertTextEncoding(trackNames);
        for (var i = 0; i < tracks.length && i < trackNames.length; i++) {
            var track = tracks[i];
            var name = trackNames[i].trim();
            if (name == "")
                name = undefined;
            track.name = name;
        }
    };
    return Midi;
}());

var MidiTrackSelector = /** @class */ (function () {
    function MidiTrackSelector(parent) {
        var _this = this;
        this.parent = parent;
        this.window = new Window("dialog", "选择 MIDI 轨道", undefined, {
            resizeable: true,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.window.onResizing = this.window.onResize = function () { return _this.window.layout.resize(); };
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: ["fill", "fill"] });
        this.selectAllCheck = addControl(this.group, "checkbox", { text: "全选" });
        this.trackList = addControl(this.group, "listbox", { alignment: ["fill", "fill"] }, {
            multiselect: true, numberOfColumns: 4, showHeaders: true,
            columnTitles: ["通道", "名称", "音符数"],
            columnWidths: [50, 225, 75],
        });
        this.trackList.size = [400, 400];
        this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
        this.okBtn = addControl(this.buttonGroup, "button", { text: localize(str.ok) });
        this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(str.cancel) });
        this.window.defaultElement = this.okBtn;
        this.window.cancelElement = this.cancelBtn;
        this.initMidiTracks();
        this.selectAllCheck.onClick = function () {
            var checked = _this.selectAllCheck.value;
            for (var _i = 0, _a = _this.trackList.items; _i < _a.length; _i++) {
                var item = _a[_i];
                item.checked = item.selected = checked;
            }
        };
        this.trackList.onChange = function () { return _this.trackList_onChange(); };
        this.okBtn.onClick = function () {
            var _a;
            if (!_this.parent.midi) {
                _this.window.close();
                return;
            }
            var checks = [];
            for (var i = 0; i < _this.trackList.items.length; i++) {
                var item = _this.trackList.items[i];
                var track = _this.parent.midi.tracks[i];
                if (item.checked)
                    checks.push(track);
            }
            var text = "";
            if (checks.length === 0) {
                alert("请至少选择一条轨道。", localize(str.warning));
                return;
            }
            else if (checks.length === 1)
                text = checks[0].toString();
            else {
                var arr = [];
                for (var _i = 0, checks_1 = checks; _i < checks_1.length; _i++) {
                    var track = checks_1[_i];
                    var text_1 = String((_a = track.channel) !== null && _a !== void 0 ? _a : 0);
                    if (track.name)
                        text_1 += ": " + track.name;
                    arr.push(text_1);
                }
                text = arr.join("; ");
            }
            _this.parent.selectedTracks = checks;
            _this.parent.selectTrackBtn.text = text;
            _this.window.close();
        };
    }
    MidiTrackSelector.prototype.show = function () {
        this.window.center();
        this.window.show();
    };
    MidiTrackSelector.prototype.initMidiTracks = function () {
        var _a, _b;
        if (this.parent.midi)
            for (var _i = 0, _c = this.parent.midi.tracks; _i < _c.length; _i++) {
                var track = _c[_i];
                var item = this.trackList.add("item", String((_a = track.channel) !== null && _a !== void 0 ? _a : 0));
                item.checked = this.parent.selectedTracks.includes(track);
                item.subItems[0].text = (_b = track.name) !== null && _b !== void 0 ? _b : "";
                item.subItems[1].text = track.noteCount;
            }
        this.trackList_onChange(true);
    };
    MidiTrackSelector.prototype.trackList_onChange = function (forInitTracks) {
        if (forInitTracks === void 0) { forInitTracks = false; }
        var checkAll = true;
        for (var _i = 0, _a = this.trackList.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!forInitTracks)
                item.checked = item.selected;
            if (!item.checked)
                checkAll = false;
        }
        this.selectAllCheck.value = checkAll;
    };
    return MidiTrackSelector;
}());

/**
 * 获取当前激活合成。
 * @returns 当前合成。如果当前没有激活的合成则返回 null。
 */
function getComp() {
    var comp = app.project.activeItem;
    if (!isValid(comp))
        return null;
    return comp;
}

var MIN_INTERVAL = 5e-4;
var NULL_SOURCE_NAME = "om midi null";
var Core = /** @class */ (function () {
    function Core(portal) {
        this.portal = portal;
    }
    Core.prototype.apply = function () {
        var comp = getComp();
        if (comp === null)
            throw new CannotFindCompositionError();
        try {
            var tab = this.portal.getSelectedTab();
            if (tab === this.portal.nullObjTab)
                this.applyCreateNullObject(comp);
            else if (tab === this.portal.applyEffectsTab)
                this.applyEffects(comp);
            else if (tab === this.portal.toolsTab) {
                if (this.portal.toolsTab.toolsCombo.getSelectedIndex() === 0)
                    this.applyMarkerConductor(comp);
            }
        }
        catch (error) {
            throw new MyError(error);
        }
        finally {
            app.endUndoGroup();
        }
    };
    Core.prototype.applyCreateNullObject = function (comp) {
        var _this = this;
        var _a, _b, _c, _d;
        app.beginUndoGroup("om midi - Apply Create Null Object");
        var nullTab = this.portal.nullObjTab;
        if (this.portal.selectedTracks.length === 0 || !this.portal.midi)
            throw new NoMidiError();
        var checks = nullTab.getCheckedChecks();
        if (checks.length === 0)
            throw new NoOptionsCheckedError();
        var usingSelectedLayerName = Setting.get("UsingSelectedLayerName", false);
        var selectedLayer = this.getSelectLayer(comp);
        if (selectedLayer === null)
            usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
        var secondsPerTick = this.getSecondsPerTick();
        var _loop_1 = function (track) {
            if (track === undefined)
                return "continue";
            var nullLayer = this_1.createNullLayer(comp);
            nullLayer.name = "[midi]" + (usingSelectedLayerName && selectedLayer !== null ? selectedLayer.name :
                ((_a = track.name) !== null && _a !== void 0 ? _a : "Channel " + ((_b = track.channel) !== null && _b !== void 0 ? _b : 0)));
            for (var _f = 0, checks_1 = checks; _f < checks_1.length; _f++) {
                var check = checks_1[_f];
                this_1.addSliderControl(nullLayer, check.text);
            } // 限制：只能存储索引值。
            var setValueAtTime = function (check, seconds, value, inType, outType) {
                return _this.setValueAtTime(nullLayer, checks, check, seconds, value, inType, outType);
            };
            var noteOnCount = 0, lastEventType = RegularEventType.NOTE_OFF, lastEventSofarTick = 0;
            for (var _g = 0, _h = track.events; _g < _h.length; _g++) {
                var noteEvent = _h[_g];
                if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
                    continue; // 跳过同一时间点上的音符。
                var seconds = noteEvent.sofarTick * secondsPerTick;
                if (noteEvent instanceof NoteOnEvent) {
                    if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
                        noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
                        noteEvent.duration && noteEvent.duration < 0)
                        continue;
                    setValueAtTime(nullTab.pitch, seconds, noteEvent.pitch, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.velocity, seconds, noteEvent.velocity, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.duration, seconds, (_c = noteEvent.duration) !== null && _c !== void 0 ? _c : 0, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.count, seconds, noteOnCount, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.bool, seconds, +!(noteOnCount % 2), KeyframeInterpolationType.HOLD); // 迷惑行为，为了和旧版脚本行为保持一致。
                    setValueAtTime(nullTab.scale, seconds, noteOnCount % 2 ? -100 : 100, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.cwRotation, seconds, (noteOnCount % 4) * 90, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.ccwRotation, seconds, ((4 - noteOnCount % 4) % 4) * 90, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.noteOn, seconds, 1, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.timeRemap, seconds, 0, KeyframeInterpolationType.LINEAR);
                    setValueAtTime(nullTab.whirl, seconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR);
                    if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
                        var duration = (_d = noteEvent.interruptDuration) !== null && _d !== void 0 ? _d : noteEvent.duration;
                        var noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
                        setValueAtTime(nullTab.timeRemap, noteOffSeconds, 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                        setValueAtTime(nullTab.whirl, noteOffSeconds, +!(noteOnCount % 2), KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                    noteOnCount++;
                    lastEventType = RegularEventType.NOTE_ON;
                    lastEventSofarTick = noteEvent.sofarTick;
                }
                else if (noteEvent instanceof NoteOffEvent) {
                    var noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
                    setValueAtTime(nullTab.velocity, noteOffSeconds, noteEvent.velocity, KeyframeInterpolationType.HOLD); // 新增松键力度。
                    setValueAtTime(nullTab.noteOn, seconds, 0, KeyframeInterpolationType.HOLD);
                    lastEventType = RegularEventType.NOTE_OFF;
                    lastEventSofarTick = noteEvent.sofarTick;
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, _e = this.portal.selectedTracks; _i < _e.length; _i++) {
            var track = _e[_i];
            _loop_1(track);
        }
    };
    Core.prototype.applyMarkerConductor = function (comp) {
        app.beginUndoGroup("om midi - Apply Marker Conductor");
        var marker = this.portal.toolsTab.marker;
        var layer;
        if (marker.markOnCombo.getSelectedIndex() === 1) {
            var _layer = this.getSelectLayer(comp);
            if (_layer === null)
                throw new NoLayerSelectedError();
            layer = _layer;
        }
        else {
            layer = this.createNullLayer(comp);
            layer.name = "BPM:" + marker.bpmTxt.text + " (" + marker.beatTxt.text + "/4)";
        }
        var startTimePos = this.portal.startTimeCombo.getSelectedIndex();
        var startTime = startTimePos === 0 ? comp.displayStartTime :
            (startTimePos === 1 ? comp.time :
                (startTimePos === 2 ? comp.workAreaStart : 0)); // ExtendScript 似乎对三元运算符的优先级有偏见。
        layer.startTime = startTime;
        var beat = 1;
        var nextBeat = function () {
            var comment = String(beat);
            beat = beat % parseInt(marker.beatTxt.text) + 1;
            return comment;
        };
        var bpm = parseFloat(marker.bpmTxt.text);
        while (startTime <= comp.displayStartTime + comp.duration) {
            layer.marker.setValueAtTime(startTime, new MarkerValue(nextBeat()));
            startTime += 60 / bpm;
        }
    };
    Core.prototype.applyEffects = function (comp) {
        var _a, _b;
        app.beginUndoGroup("om midi - Apply Effects");
        var effectsTab = this.portal.applyEffectsTab;
        if (this.portal.selectedTracks.length === 0 || !this.portal.midi)
            throw new NoMidiError();
        if (effectsTab.getCheckedChecks().length === 0)
            throw new NoOptionsCheckedError();
        if (this.portal.selectedTracks.length !== 1)
            throw new NotOneTrackForApplyEffectsOnlyError();
        var layer = this.getSelectLayer(comp);
        if (layer === null)
            throw new NoLayerSelectedError();
        var secondsPerTick = this.getSecondsPerTick();
        var track = this.portal.selectedTracks[0];
        if (layer.timeRemapEnabled)
            layer.timeRemapEnabled = false;
        var source = layer.source;
        (+(source.duration / source.frameDuration).toFixed(0) - 1) * source.frameDuration;
        var layerLength = layer.outPoint - layer.startTime - source.frameDuration;
        var startTime = 0;
        if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.tunning.value) {
            layer.timeRemapEnabled = true;
            layer.timeRemap.removeKey(2);
            startTime = layer.timeRemap.value;
        }
        var noteOnCount = 0, lastEventType = RegularEventType.NOTE_OFF, lastEventSofarTick = 0;
        for (var _i = 0, _c = track.events; _i < _c.length; _i++) {
            var noteEvent = _c[_i];
            if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
                continue; // 跳过同一时间点上的音符。
            var seconds = noteEvent.sofarTick * secondsPerTick;
            if (noteEvent instanceof NoteOnEvent) {
                if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
                    noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
                    noteEvent.duration && noteEvent.duration < 0)
                    continue;
                if (effectsTab.hFlip.value) {
                    var key = layer.scale.addKey(seconds);
                    layer.scale.setValueAtKey(key, [noteOnCount % 2 ? -100 : 100, 100]);
                    layer.scale.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                }
                if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
                    var value = effectsTab.cwRotation.value ? (noteOnCount % 4) * 90 : ((4 - noteOnCount % 4) % 4) * 90;
                    var key = layer.rotation.addKey(seconds);
                    layer.rotation.setValueAtKey(key, value);
                    layer.rotation.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                }
                if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value) {
                    var key = layer.timeRemap.addKey(seconds);
                    layer.timeRemap.setValueAtKey(key, startTime);
                    // layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                    if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
                        var duration = (_a = noteEvent.interruptDuration) !== null && _a !== void 0 ? _a : noteEvent.duration;
                        var noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
                        var key2 = layer.timeRemap.addKey(noteOffSeconds);
                        var endTime = effectsTab.timeRemap.value ? startTime + layerLength : noteOffSeconds - seconds + startTime;
                        layer.timeRemap.setValueAtKey(key2, endTime);
                        // layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                }
                if (effectsTab.tunning.value) { // 已知问题：拉伸（时间重映射截断）长度不能比原素材长；如果素材不在项目开头，前面的内容无法播放
                    var key = layer.timeRemap.addKey(seconds);
                    layer.timeRemap.setValueAtKey(key, startTime);
                    // layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                    if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
                        var duration = (_b = noteEvent.interruptDuration) !== null && _b !== void 0 ? _b : noteEvent.duration;
                        var noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
                        var key2 = layer.timeRemap.addKey(noteOffSeconds);
                        var duration2 = noteOffSeconds - seconds;
                        var pitch = noteEvent.pitch - 60;
                        var stretch = Math.pow(2, (pitch / 12));
                        layer.timeRemap.setValueAtKey(key2, duration2 * stretch + startTime);
                        // layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                }
                noteOnCount++;
                lastEventType = RegularEventType.NOTE_ON;
                lastEventSofarTick = noteEvent.sofarTick;
            }
        }
    };
    /**
     * 创建一个空对象图层。
     * @param comp - 合成。
     * @returns 空对象图层。
     */
    Core.prototype.createNullLayer = function (comp) {
        var nullLayer;
        refindNullSource: while (true) {
            var hasNullSource = false;
            try {
                hasNullSource = !!this.nullSource && !!this.nullSource.parentFolder;
            }
            catch (error) {
                hasNullSource = false;
            }
            if (hasNullSource) { // 如果有现有的空对象纯色，不用重新新建一个。
                nullLayer = comp.layers.add(this.nullSource, comp.workAreaDuration);
                nullLayer.opacity.setValue(0);
                nullLayer.anchorPoint.setValue([0, 0]);
            }
            else {
                nullLayer = comp.layers.addNull(comp.workAreaDuration);
                var nullSource = nullLayer.source;
                for (var i = 1; i <= nullSource.parentFolder.items.length; i++) { // 从 1 起始。
                    var item = nullSource.parentFolder.items[i];
                    if (item.name === NULL_SOURCE_NAME && item instanceof FootageItem) {
                        this.nullSource = item;
                        nullSource.remove();
                        continue refindNullSource;
                    }
                }
                this.nullSource = nullSource;
                nullLayer.source.name = NULL_SOURCE_NAME;
            }
            break;
        }
        nullLayer.enabled = false;
        return nullLayer;
    };
    /**
     * 获取指定图层的效果属性集合。
     * @param layer - 图层。
     * @returns 效果组。
     */
    Core.prototype.getEffects = function (layer) {
        return layer("Effects");
    };
    /**
     * 为指定图层添加一个表达式控制 - 滑块控制的效果。
     * @param layer - 图层。
     * @param name - 滑块名称。
     * @returns 滑块控制效果序号。
     */
    Core.prototype.addSliderControl = function (layer, name) {
        var slider = this.getEffects(layer).addProperty("ADBE Slider Control"); // 中文版竟然能正常运行？ADBE 是什么鬼？
        slider.name = name;
        return slider.propertyIndex; // 向索引组添加新属性时，将从头开始重新创建索引组，从而使对属性的所有现有引用无效。
    };
    Core.prototype.setValueAtTime = function (layer, checks, check, seconds, value, inType, outType) {
        if (outType === void 0) { outType = inType; }
        var index = checks.indexOf(check);
        if (index === -1)
            return;
        var slider = this.getEffects(layer).property(index + 1).property(1);
        var key = slider.addKey(seconds);
        slider.setValueAtKey(key, value);
        slider.setInterpolationTypeAtKey(key, inType, outType);
    };
    /**
     * 获取当前合成所选中的第一个图层。
     * @param comp - 合成。
     * @returns 选中图层。
     */
    Core.prototype.getSelectLayer = function (comp) {
        if (comp.selectedLayers.length === 0)
            return null;
        var layer = comp.selectedLayers[0];
        if (layer instanceof AVLayer)
            return layer;
        return null;
    };
    Core.prototype.getSecondsPerTick = function () {
        if (!this.portal.midi)
            throw new NoMidiError();
        var secondsPerTick;
        var ticksPerQuarter = this.portal.midi.timeDivision; // 基本时间每四分音符
        if (ticksPerQuarter instanceof Array) {
            secondsPerTick = 1 / ticksPerQuarter[0] / ticksPerQuarter[1]; // 帧每秒这种格式不支持，随便弄一个数不要报错就好了。
        }
        else {
            var quartersPerMinute = parseFloat(this.portal.selectBpmTxt.text), // 四分音符每分钟 (BPM)
            secondsPerQuarter = 60 / quartersPerMinute; // 秒每四分音符
            secondsPerTick = secondsPerQuarter / ticksPerQuarter; // 秒每基本时间
        }
        return secondsPerTick;
    };
    return Core;
}());

var LARGE_NUMBER = 1e4; // 这个大数设置大了会跑不了。
var Portal = /** @class */ (function () {
    //#endregion
    function Portal(window) {
        var _a, _b, _c, _d;
        var _this = this;
        this.selectedTracks = [];
        this.window = window;
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill", spacing: 5 });
        var MidiButtonHeight = 22;
        var FILL_CENTER = ["fill", "center"];
        (_a = addGroup(this.group, "MIDI 文件", "button", { text: "...", size: [15, MidiButtonHeight] }), this.selectMidiGroup = _a.group, this.selectMidiLbl = _a.label, this.selectMidiBtn = _a.control);
        this.selectMidiName = addControl(this.selectMidiGroup, "statictext", { text: "未选择", alignment: FILL_CENTER });
        (_b = addGroup(this.group, "选择轨道", "button", {
            text: "",
            alignment: FILL_CENTER,
            maximumSize: [LARGE_NUMBER, MidiButtonHeight],
            enabled: false,
        }), this.selectTrackGroup = _b.group, this.selectTrackLbl = _b.label, this.selectTrackBtn = _b.control);
        (_c = addGroup(this.group, "设定 BPM", "edittext", { text: "120", alignment: FILL_CENTER, enabled: false }), this.selectBpmGroup = _c.group, this.selectBpmLbl = _c.label, this.selectBpmTxt = _c.control);
        (_d = addGroup(this.group, "开始位置", "dropdownlist", { alignment: FILL_CENTER }), this.startTimeGroup = _d.group, this.startTimeLbl = _d.label, this.startTimeCombo = _d.control);
        addItems(this.startTimeCombo, "显示开始时间", "当前时间", "工作区域", "0");
        this.tabs = addControl(this.group, "tabbedpanel", { alignment: ["fill", "fill"] });
        this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"] });
        this.applyBtn = addControl(this.buttonGroup, "button", { text: localize(str.apply), alignment: "left" });
        this.settingBtn = addControl(this.buttonGroup, "iconbutton", { alignment: ["right", "center"] }, { style: "toolbutton" });
        this.nullObjTab = new NullObjTab(this);
        this.applyEffectsTab = new ApplyEffectsTab(this);
        this.toolsTab = new ToolsTab(this);
        this.core = new Core(this);
        setNumberEditText(this.selectBpmTxt, NumberType.POSITIVE_DECIMAL, 120);
        this.selectMidiBtn.onClick = function () {
            var _a;
            var file = File.openDialog("选择一个 MIDI 序列", "MIDI 序列:*.mid;*.midi,所有文件:*.*");
            if (file === null)
                return;
            var midi;
            try {
                midi = new Midi(file);
                if (midi.bpm)
                    _this.selectBpmTxt.text = String(midi.bpm);
                if (midi.tracks.length === 0)
                    throw new MidiNoTrackError();
                _this.selectMidiName.text = file.displayName;
                var firstTrack = midi.tracks[midi.preferredTrackIndex];
                _this.selectedTracks = [firstTrack];
                _this.selectTrackBtn.text = firstTrack.toString();
                _this.selectTrackBtn.enabled = true;
                _this.selectBpmTxt.enabled = true;
                _this.midi = midi;
            }
            catch (error) {
                if (midi)
                    (_a = midi.file) === null || _a === void 0 ? void 0 : _a.close();
                // throw new MyError(error as Error);
            }
        };
        this.applyBtn.onClick = function () { return _this.core.apply(); };
        this.settingBtn.onClick = function () {
            new SettingsDialog().show();
        };
        this.selectTrackBtn.onClick = function () {
            new MidiTrackSelector(_this).show();
        };
    }
    Portal.build = function (thisObj, User) {
        $.strict = true;
        var window = thisObj instanceof Panel ? thisObj :
            new Window("palette", User.scriptName + " v" + User.version, undefined, {
                resizeable: true,
            });
        if (window === null)
            throw new CannotFindWindowError();
        var portal = new Portal(window);
        if (window instanceof Window) {
            window.onResizing = window.onResize = function () { return window.layout.resize(); };
            window.center();
            window.show();
        }
        else {
            window.layout.layout(true);
            window.layout.resize();
        }
        return portal;
    };
    Portal.prototype.getSelectedTab = function () {
        switch (this.tabs.selection.text) {
            case this.nullObjTab.tab.text:
                return this.nullObjTab;
            case this.applyEffectsTab.tab.text:
                return this.applyEffectsTab;
            case this.toolsTab.tab.text:
                return this.toolsTab;
            default:
                return null;
        }
    };
    return Portal;
}());
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

/// <reference path="prototypes.d.ts" />
/**
 * 初始化为 ExtendScript 的扩展方法。
 */
function initPrototypes() {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    };
    Array.prototype.indexOf = function (item) {
        for (var i = 0; i < this.length; i++)
            if (this[i] === item)
                return i;
        return -1;
    };
    Array.prototype.includes = function (item) {
        return this.indexOf(item) !== -1;
    };
    DropDownList.prototype.getSelectedIndex = function () {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].selected)
                return i;
        return -1;
    };
}

if (BridgeTalk.appName !== "aftereffects")
    throw new NotAfterEffectsError();
else {
    initPrototypes();
    Portal.build(thisObj, User);
}

})(this);
