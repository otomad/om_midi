/**
 * om midi v3.9.10.0
 * 简称 OMM，After Effects 的音 MAD / YTPMV 辅助脚本。它是一个能够自动将 MIDI 文件转换为 After Effects 中关键帧的脚本。
 * 希望在 om midi 的帮助下，可以把人们从枯燥繁重的音画对齐中解救出来，把更多的精力投入到更有创造性的工作中。
 *
 * 描述：读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。
 *
 * 脚本原作者：大卫·范·布林克 (omino)、Dora (NGDXW)、韩琦、家鳖大帝
 * 脚本作者：兰音
 *
 * 在此处获取最新版：https://github.com/otomad/om_midi/releases/latest
 * 仓库地址：https://github.com/otomad/om_midi
 *
 * 构建日期：2022 年 10 月 19 日 星期三 晚上 23:43:32
 * Copyright (c) 2022 ~, Ranne
 *
 * 原作者介绍：
 * 日期：2011 年 12 月 25 日 星期日 晚上 22:58:10 太平洋时间
 * 作者：大卫·范·布林克
 *
 * 此脚本是 omino Adobe 脚本套件的一部分。
 * 我写这些是因为我喜欢。请尽情享受。
 * 向 poly@omino.com 提出问题，主题行应以“插件”开头，以便我的垃圾邮件过滤器允许它。
 * 此文件已被预处理为独立脚本。我针对一些可重用的库开发它们⸺例如对话框布局⸺但对于分发来说，最好只有一个文件。
 * 大卫·范·布林克 2007。
 *
 * ****************************************************************************************************
 *
 * om midi v3.9.10.0
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
 * Get the Latest Version Here: https://github.com/otomad/om_midi/releases/latest
 * Repository Link: https://github.com/otomad/om_midi
 *
 * Building Date: Wednesday, October 19, 2022 11:43 PM
 * Copyright (c) 2022 ~, Ranne
 *
 * Introduction by the Original Author:
 * Date: Sunday, December 25, 2011 10:58 PM PST
 * Author: David Van Brink
 * This script is part of the omino adobe script suite.
 *
 * I write these because I like to. Please enjoy as you see fit.
 *
 * Questions to poly@omino.com, subject line should start with "plugins" so my spam filter lets it in.
 *
 * This file has been preprocessed to be standalone. I develop them against some reusable libraries
 * ⸺ such as for dialog layout ⸺ but for distribution it's nicer to have just one file.
 * dvb 2007.
 */

(function (thisObj) {

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
// 破烂玩意ㄦ，改写 Object.prototype.hasOwnProperty 则 TypeScript 不支持；改写 Object.hasOwn 则 ExtendScript 不支持。

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
    // TODO: 技术难点待解决，联合类型无法被收敛到此重载函数。暂时无解用 any 临时解决。
    else
        _control = parent.add(type, undefined, undefined, properties);
    // TODO: 技术难点待解决，未知原因，疑同上。
    var control = _control;
    if (params != undefined)
        for (var key in params)
            if (hasOwn(params, key))
                control[key] = params[key];
    return control;
}

var SCROLLBAR_WIDTH = 13;
var ScrollGroup = /** @class */ (function () {
    function ScrollGroup(parent) {
        var _this = this;
        this.scrollY = 0;
        this.parent = parent;
        this.panel = addControl(parent, "group", { orientation: "row", alignment: ["fill", "fill"] });
        this.content = addControl(this.panel, "group", { orientation: "column", alignment: ["left", "top"], alignChildren: "fill" });
        this.scrollbar = addControl(this.panel, "scrollbar", { alignment: "right" });
        this.scrollbar.onChanging = function () { return _this.onScroll(); }; // 居然没有 bind。
    }
    ScrollGroup.prototype.add = function (type, params, properties) {
        addControl(this.content, type, params, properties);
    };
    ScrollGroup.prototype.onResize = function () {
        var bounds = this.parent.bounds;
        this.panel.bounds = __assign(__assign({}, bounds), { x: 0, y: 0 });
        var hideScrollbar = false;
        var heights = this.getViewHeight();
        if (heights.viewHeight >= heights.height) {
            this.scrollY = 0;
            hideScrollbar = true;
        }
        else if (heights.viewHeight > heights.height + this.scrollY)
            this.scrollY = heights.viewHeight - heights.height;
        this.content.bounds = { x: 0, y: this.scrollY, width: bounds.width - SCROLLBAR_WIDTH * (+!hideScrollbar), height: this.getContentHeight() };
        this.scrollbar.bounds = { x: hideScrollbar ? bounds.width : bounds.width - SCROLLBAR_WIDTH, y: 0, width: SCROLLBAR_WIDTH, height: bounds.height };
        this.scrollbar.value = this.scrollY / (-heights.y) * (this.scrollbar.maxvalue - this.scrollbar.minvalue) + this.scrollbar.minvalue;
    };
    ScrollGroup.prototype.getContentHeight = function () {
        var marginTop = this.content.margins[1];
        var height = marginTop;
        for (var _i = 0, _a = this.content.children; _i < _a.length; _i++) {
            var control = _a[_i];
            height += getHeight(control) + this.content.spacing;
        }
        return height;
    };
    ScrollGroup.prototype.onScroll = function () {
        var y = this.getViewHeight().y;
        if (y <= 0)
            return;
        this.content.location.y = this.scrollY = -y * (this.scrollbar.value - this.scrollbar.minvalue) / (this.scrollbar.maxvalue - this.scrollbar.minvalue);
    };
    ScrollGroup.prototype.getViewHeight = function () {
        var height = getHeight(this.content);
        var viewHeight = getHeight(this.panel);
        var y = height - viewHeight;
        return { height: height, viewHeight: viewHeight, y: y };
    };
    ScrollGroup.test = function () {
        var window = new Window("window", "Scroll Test", undefined, { resizeable: true });
        var group = addControl(window, "group", { alignment: ["fill", "fill"] });
        var scroll = new ScrollGroup(group);
        var num = 20;
        for (var i = 1; i <= num; i++)
            scroll.add("checkbox", { text: "Item " + i });
        window.onShow = window.onResizing = window.onResize = function () {
            window.layout.resize();
            scroll.onResize();
        };
        window.center();
        window.show();
    };
    return ScrollGroup;
}());
function getHeight(control) {
    return control.size.height; // 已知暂时无法解决特性之一，具体详见：https://github.com/microsoft/TypeScript/issues/51229
}

/* if (BridgeTalk.appName !== "aftereffects")
    throw new NotAfterEffectsError();
else {
    initPrototypes();
    Portal.build(thisObj, user);
} */
ScrollGroup.test();

})(this);
