/**
 * om midi v3.0
 * After Effects 的音 MAD / YTPMV 辅助脚本。它是一个能够自动将 MIDI 文件转换为 After Effects 中关键帧的脚本。
 * 希望在 om midi 的帮助下，可以把人们从枯燥繁重的音画对齐中解救出来，把更多的精力投入到更有创造性的工作中。
 * 描述：读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。
 * 
 * 脚本原作者：David Van Brink (omino)、Dora (NGDXW)、韩琦、家鳖大帝
 * 脚本作者：兰音
 * 
 * 部署时间：2022/08/24 Wednesday 16:11:31
 * Copyright (c) 2022, Ranne
 * 
 * 原作者介绍：
 * Date: Sun Dec 25 22:58:10 PST 2011
 * Author: David Van Brink
 * This script is part of the omino adobe script suite.
 * The latest version can be found at http://omino.com/pixelblog/.
 * 
 * I write these because I like to. Please enjoy as you see fit.
 * 
 * Questions to poly@omino.com, subject line should start with "plugins" so my spam filter lets it in.
 * 
 * This file has been preprocessed to be standalone. I develop them against some reusable libraries
 * -- such as for dialog layout -- but for distribution it's nicer to have just one file. dvb 2007.
 * 
 * Description: This After Effects script reads a Standard MIDI file (.mid)
 * and creates layers and keyframes corresponding to the notes and controllers in that MIDI file.
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

var SPACING = 2;
var tabGroupParams = {
    orientation: "column",
    alignment: "left",
    alignChildren: "left",
    spacing: SPACING,
    margins: [10, 5, 10, 0],
};
var NullObjTab = /** @class */ (function () {
    //#endregion
    function NullObjTab(parent) {
        this.parent = parent;
        this.tab = addControl(this.parent.tabs, "tab", { text: "空对象" });
        this.group = addControl(this.tab, "group", tabGroupParams);
        this.pitch = addControl(this.group, "checkbox", { text: "音高" });
        this.velocity = addControl(this.group, "checkbox", { text: "力度" });
        this.duration = addControl(this.group, "checkbox", { text: "持续时间" });
        this.scale = addControl(this.group, "checkbox", { text: "缩放" });
        this.cwRotation = addControl(this.group, "checkbox", { text: "顺时针旋转" });
        this.count = addControl(this.group, "checkbox", { text: "计数" });
        this.bool = addControl(this.group, "checkbox", { text: "布尔" });
        this.timeRemap = addControl(this.group, "checkbox", { text: "时间重映射（拉伸）" });
        this.timeRemap2 = addControl(this.group, "checkbox", { text: "时间重映射（截断）" });
    }
    return NullObjTab;
}());

var ApplyEffectsTab = /** @class */ (function () {
    //#endregion
    function ApplyEffectsTab(parent) {
        this.parent = parent;
        this.tab = addControl(this.parent.tabs, "tab", { text: "应用效果" });
        this.group = addControl(this.tab, "group", tabGroupParams);
        this.timeRemap = addControl(this.group, "checkbox", { text: "时间重映射" });
        this.hFlip = addControl(this.group, "checkbox", { text: "水平翻转" });
        this.cwRotation = addControl(this.group, "checkbox", { text: "顺时针旋转" });
    }
    return ApplyEffectsTab;
}());

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
        this.parent = parent;
        this.group = addControl(this.parent.toolsPanel, "group", {
            orientation: "column",
            alignment: ["fill", "fill"],
            alignChildren: "fill",
            spacing: SPACING,
        });
        var FILL = ["fill", "center"];
        this.bpmGroup = this.addGroup();
        this.bpmLbl = this.addLabel(this.bpmGroup, "BPM");
        this.bpmTxt = addControl(this.bpmGroup, "edittext", { text: "120", alignment: FILL });
        this.beatGroup = this.addGroup();
        this.beatLbl = this.addLabel(this.beatGroup, "节拍");
        this.beatTxt = addControl(this.beatGroup, "edittext", { text: "4", alignment: FILL });
        this.markOnGroup = this.addGroup();
        this.markOnLbl = this.addLabel(this.markOnGroup, "标记在");
        this.markOnCombo = addControl(this.markOnGroup, "dropdownlist", { alignment: FILL });
        addItems(this.markOnCombo, "新建空对象图层", "当前图层");
        this.startTimeGroup = this.addGroup();
        this.startTimeLbl = this.addLabel(this.startTimeGroup, "开始位置");
        this.startTimeCombo = addControl(this.startTimeGroup, "dropdownlist", { alignment: FILL });
        addItems(this.startTimeCombo, "显示开始时间", "当前时间", "工作区域", "0");
        setNumberEditText(this.beatTxt, NumberType.POSITIVE_INT, 4);
        setNumberEditText(this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
    }
    MarkerConductor.prototype.addGroup = function () {
        return addControl(this.group, "group", { orientation: "row", spacing: 7, alignment: "fill", alignChildren: "fill" });
    };
    MarkerConductor.prototype.addLabel = function (parent, text) {
        var label = addControl(parent, "statictext", { text: text });
        setLabelMinWidth(label);
        return label;
    };
    return MarkerConductor;
}());

var ToolsTab = /** @class */ (function () {
    //#endregion
    function ToolsTab(parent) {
        this.parent = parent;
        this.tab = addControl(this.parent.tabs, "tab", { text: "工具" });
        this.group = addControl(this.tab, "group", { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] });
        this.toolsCombo = addControl(this.group, "dropdownlist");
        this.toolsCombo.add("item", "标记生成");
        this.toolsCombo.selection = 0;
        this.toolsPanel = addControl(this.group, "group", { alignment: "fill", alignChildren: "fill" });
        this.marker = new MarkerConductor(this);
    }
    return ToolsTab;
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

var Separator = /** @class */ (function () {
    function Separator(parent) {
        this.control = parent.add("panel");
        this.control.alignment = ["fill", "top"];
    }
    return Separator;
}());

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

var MyError = /** @class */ (function (_super) {
    __extends(MyError, _super);
    function MyError(msg) {
        var _this = this;
        alert(msg.toString());
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

var str = {
    ok: {
        zh: "确定",
        en: "OK",
    },
    cancel: {
        zh: "取消",
        en: "Cancel",
    },
};

var ABOUT = "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。";
var SettingsDialog = /** @class */ (function () {
    //#endregion
    function SettingsDialog() {
        var _this = this;
        this.window = new Window("dialog", "设置", undefined, {
            resizeable: false,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        this.aboutLbl = addControl(this.group, "statictext", { text: ABOUT }, { multiline: true });
        this.separator = new Separator(this.group);
        this.languageGroup = addControl(this.group, "group", { orientation: "row" });
        this.languageLbl = addControl(this.languageGroup, "statictext", { text: "语言" });
        this.langugaeCombo = addControl(this.languageGroup, "dropdownlist");
        addItems(this.langugaeCombo, "应用默认值", "简体中文", "English", "日本語");
        this.usingSelectedLayerName = addControl(this.group, "checkbox", { text: "使用选择图层名称而不是轨道名称" });
        this.usingSelectedLayerName.value = Setting.get("UsingSelectedLayerName", false);
        this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
        this.okBtn = addControl(this.buttonGroup, "button", { text: localize(str.ok) });
        this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(str.cancel) });
        this.window.defaultElement = this.okBtn;
        this.window.cancelElement = this.cancelBtn;
        this.okBtn.onClick = function () {
            Setting.set("UsingSelectedLayerName", _this.usingSelectedLayerName.value);
            _this.window.close();
        };
    }
    SettingsDialog.prototype.show = function () {
        this.window.center();
        this.window.show();
    };
    return SettingsDialog;
}());

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

var NoteEvent = /** @class */ (function () {
    function NoteEvent() {
        this.deltaTime = 0;
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
    function NoteOnOffEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoteOnOffEvent.prototype.pitch = function () { return this.value[0]; };
    NoteOnOffEvent.prototype.velocity = function () { return this.value[1]; };
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
        this.length = 0;
        this.noteCount = 0;
        this.splice = [].splice;
        this.parent = parent;
        this.offset = offset;
        this.size = size;
        this.readNotes();
    }
    // 以下全部没法用 setter 属性。
    MidiTrack.prototype.setName = function (value) { var _a; (_a = this.name) !== null && _a !== void 0 ? _a : (this.name = value); };
    MidiTrack.prototype.setInstrument = function (value) { var _a; (_a = this.instrument) !== null && _a !== void 0 ? _a : (this.instrument = value); };
    MidiTrack.prototype.setMidiPort = function (value) { var _a; (_a = this.midiPort) !== null && _a !== void 0 ? _a : (this.midiPort = value); };
    MidiTrack.prototype.setTempo = function (value) { var _a, _b; var _c; (_a = this.tempo) !== null && _a !== void 0 ? _a : (this.tempo = value); (_b = (_c = this.parent.midi).bpm) !== null && _b !== void 0 ? _b : (_c.bpm = this.bpm()); };
    MidiTrack.prototype.bpm = function () {
        if (this.tempo === undefined)
            return undefined;
        var bpm = 6e7 / this.tempo;
        return parseFloat(bpm.toFixed(2));
    };
    MidiTrack.prototype.push = function (item) {
        this[this.events.length] = item;
        this.events.push(item);
        this.length = this.events.length;
    };
    MidiTrack.prototype.readNotes = function () {
        var endOffset = this.offset + this.size;
        var statusByte, lastStatusByte; // 当 statusByte 最高二进制位不为 1（即 statusByte < 128），表示与前一次状态相同。
        while (!(this.parent.isReadOver() || this.parent.getPointer() >= endOffset)) {
            var deltaTime = this.parent.readDeltaTime();
            statusByte = this.parent.readByte(1);
            if (statusByte === -1)
                break;
            else if (statusByte & 128)
                lastStatusByte = statusByte;
            else {
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
                            alert("\u8F68\u9053\u7ED3\u675F\u4F4D\u7F6E\u6709\u8BEF\u3002\u5E94\u4E3A " + endOffset + "\uFF0C\u5B9E\u9645 " + this.parent.getPointer());
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
                        if (metaType === MetaEventType.MIDI_PORT || metaType === MetaEventType.MIDI_PORT_2)
                            this.setMidiPort(numberValue);
                        else if (metaType === MetaEventType.SET_TEMPO)
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
                var regularType = statusByte >> 4; // 只取前半字节
                switch (regularType) {
                    case RegularEventType.NOTE_AFTERTOUCH:
                    case RegularEventType.CONTROLLER:
                    case RegularEventType.PITCH_BEND_EVENT:
                    case RegularEventType.NOTE_OFF:
                    case RegularEventType.NOTE_ON:
                        var byte2 = this.parent.readByteArray(2); // 读两位
                        if (regularType == RegularEventType.NOTE_ON) {
                            note = new NoteOnEvent(byte2);
                            this.noteCount++;
                        }
                        else if (regularType == RegularEventType.NOTE_OFF)
                            note = new NoteOffEvent(byte2);
                        else
                            note = new RegularEvent(regularType, byte2); // 其它事件暂时无需求而忽略
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
                this.push(note);
            }
        }
    };
    /**
     * 表示标识当前轨道的名称。
     * 用于在界面当中显示。
     * @returns - 标识当前轨道的名称。
     */
    MidiTrack.prototype.toString = function () {
        var _a;
        var description = "CH " + ((_a = this.midiPort) !== null && _a !== void 0 ? _a : "?");
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
    /**
     * 构建 MIDI 对象。
     * @param file - 一个从 After Effects 打开，但还没有开始读取的 MIDI 文件。
     */
    function Midi(file) {
        this.formatType = 1;
        this.trackCount = 0;
        this.timeDivision = 0;
        this.tracks = [];
        this.file = file;
        if (file && file.open("r")) {
            file.encoding = "binary"; // 读取为二进制编码。
            this.length = file.length;
            // this.content = file.read(this.length);
            this.midiReader = new MidiReader(this);
            file.close();
            this.removeNotNoteTrack();
        }
        else
            throw new FileUnreadableError();
    }
    /**
     * 删除不是音符的轨道。
     * 可根据需要调用。
     */
    Midi.prototype.removeNotNoteTrack = function () {
        for (var i = this.tracks.length - 1; i >= 0; i--) {
            var track = this.tracks[i];
            if (track.noteCount === 0)
                this.tracks.splice(i, 1);
        }
    };
    return Midi;
}());

var LARGE_NUMBER = 1e5;
var Portal = /** @class */ (function () {
    //#endregion
    function Portal(window) {
        var _this = this;
        this.window = window;
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        var MidiGroupsParams = { orientation: "row", spacing: 7 };
        var MidiButtonHeight = 22;
        var FILL_CENTER = ["fill", "center"];
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
        this.selectMidiBtn.onClick = function () {
            var file = File.openDialog("选择一个 MIDI 序列", "MIDI 序列:*.mid;*.midi,所有文件:*.*");
            if (file === null)
                return;
            try {
                var midi = new Midi(file);
                if (midi.bpm)
                    _this.selectBpmTxt.text = String(midi.bpm);
                if (midi.tracks.length === 0)
                    throw new MidiNoTrackError();
                _this.selectMidiName.text = file.displayName;
                var firstTrack = midi.tracks[0];
                _this.selectTrackBtn.text = firstTrack.toString();
                _this.selectTrackBtn.enabled = true;
                _this.midi = midi;
            }
            catch (error) {
                // throw new MyError(error as Error);
            }
        };
        this.applyBtn.onClick = function () {
            var comp = getComp();
            if (comp === null)
                return;
            var nullLayer = comp.layers.addNull(LARGE_NUMBER);
            nullLayer.name = "fuck";
        };
        this.settingBtn.onClick = function () {
            new SettingsDialog().show();
        };
    }
    Portal.build = function (thisObj, User) {
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
    return Portal;
}());
function setLabelMinWidth(label) {
    var LABEL_MIN_WIDTH = 60;
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

if (BridgeTalk.appName !== "aftereffects")
    throw new NotAfterEffectsError();
else
    Portal.build(thisObj, User);

})(this);
