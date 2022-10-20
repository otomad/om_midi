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
 * 构建日期：2022 年 10 月 20 日 星期四 下午 16:03:52
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
 * Building Date: Thursday, October 20, 2022 4:03 PM
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

var User = {
    scriptName: "om midi",
    version: "3.9.10.0",
    githubPage: "https://github.com/otomad/om_midi",
    githubLatest: "https://github.com/otomad/om_midi/releases/latest",
};
// 该文件不得包含任何类型注解以便 rollup 配置识别。

function hasOwn(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
// 破烂玩意ㄦ，改写 Object.prototype.hasOwnProperty 则 TypeScript 不支持；改写 Object.hasOwn 则 ExtendScript 不支持。

// 兼容版 Object.assign。
/**
 * `Object.assign()` 方法将所有可枚举（`Object.propertyIsEnumerable()` 返回 true）的自有（`Object.hasOwnProperty()`
 * 返回 true）属性从一个或多个源对象复制到目标对象，返回修改后的对象。
 * @param target - 目标对象，接收源对象属性的对象，也是修改后的返回值。
 * @param source - 源对象，包含将被合并的属性。
 * @returns 目标对象。
 */
function assign(target, source) {
    for (var key in source) {
        try {
            if (hasOwn(source, key))
                target[key] = source[key];
        }
        catch (error) { }
    }
    return target;
}

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
        assign(control, params);
    return control;
}
function addItems(dropDownList) {
    var items = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        items[_i - 1] = arguments[_i];
    }
    var selection = dropDownList.items.length ? dropDownList.getSelectedIndex() : 0;
    dropDownList.removeAll();
    for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
        var item = items_1[_a];
        dropDownList.add("item", item);
    }
    dropDownList.selection = selection;
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

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var English = {
    ok: "OK",
    cancel: "Cancel",
    channel_abbr: "CH",
    error: "Error",
    warning: "Warning",
    apply: "Apply",
    settings: "Settings",
    select_all: "Select all",
    channel: "Channel",
    name: "name",
    note_count: "Note count",
    language: "Language",
    general: "General",
    app_default: "App Default",
    tools: "Tools",
    create_null_object_short: "Null",
    create_null_object: "Create Null Object",
    apply_effects_short: "Effects",
    apply_effects: "Apply Effects",
    marker_conductor: "Marker Conductor",
    easing_100_percent: "Easing 100%",
    unit: "Unit",
    time: "Time",
    frames: "Frames",
    seconds: "Seconds",
    beat: "Beat",
    shift_seconds_and_frames: "Shift",
    mark_on: "Mark on",
    add_null_layer: "Add null layer",
    current_layer: "Current layer",
    ease_in: "Ease in",
    ease_out: "Ease out",
    ease_in_out: "Ease in out",
    midi_track_selector_title: "Select MIDI tracks",
    select_at_least_one_track: "Please select at least one track.",
    no_midi_file_selected: "No MIDI file selected",
    select_midi_file: "MIDI",
    select_midi_track: "Track",
    set_midi_bpm: "BPM",
    start_time: "Start time",
    display_start_time: "Display start time",
    current_time: "Current time",
    work_area: "Work area",
    select_a_midi_file: "Select a MIDI Sequence",
    midi_files: "MIDI Sequence",
    all_files: "All Files",
    check_update: "Check for updates",
    repository_link: "Repository link",
    about_script_engine: "About ExtendScript engine",
    import_om_utils: "Import om utils",
    import_pure_quarter_midi: "Import pure quarter MIDI",
    using_selected_layer_name: "Use selected layer name instead of MIDI track name.",
    normalize_pan_to_100: "Normalize the pan to -100 ~ 100.",
    using_layering: "@Koorihato Sakuno's unique layering method.",
    optimize_apply_effects: "Optimize some effects visual.",
    add_to_effect_transform: "Add the properties to an effect called Transform.",
    sure_to_import_pure_quarter_midi: "Are you sure you want to import the pure quarter notes MIDI file?",
    pure_quarter_midi: "Pure quarter notes MIDI",
    add_at_top_of_expression: "Prepend to expressions",
    om_utils_same_as_project_directory: "If placed in the same directory as the aep project",
    om_utils_added_to_project: "If placed anywhere, and then add to AE project",
    pitch: "Pitch",
    velocity: "Velocity",
    duration: "Duration",
    scale: "Scale",
    cw_rotation: "Clockwise Rotation",
    ccw_ratation: "Counterclockwise Rotation",
    count: "Count",
    bool: "Bool",
    time_remap: "Time Remap",
    pingpong: "Ping-pong",
    note_on: "Note On",
    channel_pan: "Channel Pan",
    channel_volume: "Channel Volume",
    channel_glide: "Channel Glide",
    horizontal_flip: "Horizontal Flip",
    invert_color: "Invert Color",
    tuning: "Tuning",
    base_pitch: "Base pitch",
    paren_stretched: " (Stretched)",
    paren_truncated: " (Truncated)",
    cannot_find_window_error: "Error: Unable to find or create window.",
    unsupported_setting_type_error: "Error: Unsupported setting data type.",
    file_unreadable_error: "Error: Could not read the MIDI file. The file may already be occupied or not exist.",
    midi_header_validation_error: "Error: MIDI file header chunks validation failed (not a standard MIDI file or this file is corrupt).",
    midi_track_header_validation_error: "Error: MIDI track header chunks validation failed.",
    midi_custom_events_error: "Error: Custom MIDI events could not be read.",
    midi_no_track_error: "Error: This MIDI file does not contain any valid tracks.",
    not_after_effects_error: "Error: Please use this script on Adobe After Effects.",
    cannot_create_file_error: "Error: Could not create file.",
    cannot_find_composition_error: "Error: Could not find an active composition. Please activate a composition first.\n\nSolution: Open a composite first, then click on the composite preview or track window to make it active.",
    no_midi_error: "Error: Please open a valid MIDI file first.",
    no_options_checked_error: "Error: Please check at least one option.",
    no_layer_selected_error: "Error: No layers are selected in the current composition.",
    not_one_track_for_apply_effects_only_error: "Error: Applying effects can only select one MIDI track at one time.",
    end_of_track_position_error: "Error: Track ends in wrong position. Expected %1, actually %2.",
    cannot_set_time_remap_error: "Error: Time remapping cannot be set for the selected layer.",
    cannot_tuning_error: "Error: The selected layer does not contain audio so that cannot be tuned.",
    about: "It reads a Standard MIDI sequence file and creates layers and keyframes corresponding to the notes and controllers in that MIDI sequence file.\n\nScript Original Authors: David Van Brink (omino), Dora (NGDXW), HanceyMica, Z4HD\nScript Author: Ranne\nRepository Link: %1",
    horizontal_mirror: "Horizontal Mirror",
    advanced_scale: "Advanced Scale",
    loading_midi: "Loading %1 ...",
};

var Japanese = {
    ok: "OK",
    cancel: "キャンセル",
    channel_abbr: "チャネル",
    error: "エラー",
    warning: "警告",
    apply: "適用",
    settings: "設定",
    select_all: "すべて選択",
    channel: "チャネル",
    name: "名",
    note_count: "音符の数",
    language: "言語",
    general: "一般",
    app_default: "アプリのデフォルト",
    tools: "ツール",
    create_null_object_short: "ヌル",
    create_null_object: "ヌル オブジェクトを作成",
    apply_effects_short: "効果を適用",
    apply_effects: "効果を適用",
    marker_conductor: "マーカー司令官",
    easing_100_percent: "イージング百パーセント",
    unit: "単位",
    time: "時間",
    frames: "フレーム",
    seconds: "秒数",
    beat: "拍子",
    shift_seconds_and_frames: "シフト",
    mark_on: "どこ",
    add_null_layer: "ヌルレイヤーを追加",
    current_layer: "現在のレイヤー",
    ease_in: "イーズイン",
    ease_out: "イーズアウト",
    ease_in_out: "イーズインアウト",
    midi_track_selector_title: "MIDI トラックを選択",
    select_at_least_one_track: "少なくとも 1 つのトラックを選択してください。",
    no_midi_file_selected: "MIDI が選択されていない",
    select_midi_file: "MIDI",
    select_midi_track: "トラック",
    set_midi_bpm: "BPM",
    start_time: "開始時刻",
    display_start_time: "表示開始時刻",
    current_time: "現在の時刻",
    work_area: "作業エリア",
    select_a_midi_file: "MIDI シーケンスを選択する",
    midi_files: "MIDI シーケンス",
    all_files: "全ファイル",
    check_update: "アップデートを確認",
    repository_link: "リポジトリ リンク",
    about_script_engine: "スクリプトエンジンについて",
    import_om_utils: "om utilsをインポート",
    import_pure_quarter_midi: "純粋な4分MIDIをインポート",
    using_selected_layer_name: "MIDI トラック名の代わりに、選択したレイヤー名を使用します。",
    normalize_pan_to_100: "パンを -100~100 に正規化します。",
    using_layering: "@氷鳩さくのの特有なレイヤリング方法。",
    optimize_apply_effects: "一部のエフェクトのビジュアルを最適化。",
    add_to_effect_transform: "変換という効果にプロパティを追加します。",
    sure_to_import_pure_quarter_midi: "純粋な 4 分音符 MIDI ファイルをインポートしてもよろしいですか？",
    pure_quarter_midi: "純粋な 4 分音符 MIDI",
    add_at_top_of_expression: "式の先頭に追加",
    om_utils_same_as_project_directory: "AEP プロジェクトと同じディレクトリに配置する場合",
    om_utils_added_to_project: "任意の場所に配置し、AE プロジェクトに追加する場合",
    pitch: "ピッチ",
    velocity: "ヴェロシティ",
    duration: "持続時間",
    scale: "スケール",
    cw_rotation: "右回り",
    ccw_ratation: "左回り",
    count: "カウント",
    bool: "ブール",
    time_remap: "時間リマップ",
    pingpong: "ピンポン",
    note_on: "音符オン",
    channel_pan: "チャンネルパン",
    channel_volume: "チャンネル音量",
    channel_glide: "チャンネルポルタメント",
    horizontal_flip: "水平方向にフリップ",
    invert_color: "色を反転",
    tuning: "色を反転",
    base_pitch: "ベースピッチ",
    paren_stretched: "（ストレッチ）",
    paren_truncated: "（切り捨て）",
    cannot_find_window_error: "エラー: ウィンドウが見つからないか作成できません。",
    unsupported_setting_type_error: "エラー: サポートされていないセット データ型です。",
    file_unreadable_error: "エラー: MIDI ファイルを読み取れませんでした。ファイルが既に占有されているか、存在しない可能性があります。",
    midi_header_validation_error: "エラー: MIDI ファイル ヘッダー チャンクの検証に失敗しました（標準の MIDI ファイルではないか、ファイルが破損しています）。",
    midi_track_header_validation_error: "エラー: MIDI トラック ヘッダー チャンクの検証に失敗しました。",
    midi_custom_events_error: "エラー: カスタム MIDI イベントを読み取れませんでした。",
    midi_no_track_error: "エラー: MIDI ファイルに有効なトラックが含まれていません。",
    not_after_effects_error: "エラー: Adobe After Effects でこのスクリプトを使用してください。",
    cannot_create_file_error: "エラー: ファイルを作成できませんでした。",
    cannot_find_composition_error: "エラー: アクティブな構成が見つかりません。最初にコンポジションをアクティブにしてください。\n\n解決策: まずコンポジットを開き、コンポジット プレビューまたはトラック ウィンドウをクリックしてアクティブにします。",
    no_midi_error: "エラー: 最初に有効な MIDI ファイルを開いてください。",
    no_options_checked_error: "エラー: 少なくとも 1 つのオプションをオンにしてください。",
    no_layer_selected_error: "エラー: 現在のコンポジションでレイヤーが選択されていません。",
    not_one_track_for_apply_effects_only_error: "エラー: エフェクトを適用すると、一度に選択できる MIDI トラックは 1 つだけです。",
    end_of_track_position_error: "エラー: トラックの終了位置が間違っています。期待される %1、実際には %2。",
    cannot_set_time_remap_error: "エラー: 選択したレイヤーにタイム リマップを設定できません。",
    cannot_tuning_error: "エラー: 選択したレイヤーにはオーディオが含まれていないため、調整できません。",
    about: "標準 MIDI ファイルを読み取り、その MIDI ファイル内のノートとコントローラーに対応するレイヤーとキーフレームを作成します。\n\n脚本原作者：デビッド・ヴァン・ブリンク（オミノ）、ドラ (NGDXW)、韓琦、家鼈大帝\n脚本作者：蘭音\nリポジトリ リンク：%1",
    horizontal_mirror: "水平方向のミラー",
    advanced_scale: "高度なスケール",
    loading_midi: "%1 を読み込んでいます...",
};

var SChinese = {
    ok: "确定",
    cancel: "取消",
    channel_abbr: "通道",
    error: "错误",
    warning: "警告",
    apply: "应用",
    settings: "设置",
    select_all: "全选",
    channel: "通道",
    name: "名称",
    note_count: "音符数",
    language: "语言",
    general: "通用",
    app_default: "应用默认值",
    tools: "工具",
    create_null_object_short: "空对象",
    create_null_object: "创建空对象",
    apply_effects_short: "应用效果",
    apply_effects: "应用效果",
    marker_conductor: "标记指挥官",
    easing_100_percent: "缓动百分百",
    unit: "单位",
    time: "时间",
    frames: "帧数",
    seconds: "秒数",
    beat: "节拍",
    shift_seconds_and_frames: "偏移",
    mark_on: "标记在",
    add_null_layer: "新建空对象图层",
    current_layer: "当前图层",
    ease_in: "缓入",
    ease_out: "缓出",
    ease_in_out: "缓入缓出",
    midi_track_selector_title: "选择 MIDI 轨道",
    select_at_least_one_track: "请至少选择一条轨道。",
    no_midi_file_selected: "未选择 MIDI 文件",
    select_midi_file: "MIDI 文件",
    select_midi_track: "选择轨道",
    set_midi_bpm: "设定 BPM",
    start_time: "开始时间",
    display_start_time: "显示开始时间",
    current_time: "当前时间",
    work_area: "工作区域",
    select_a_midi_file: "选择一个 MIDI 序列",
    midi_files: "MIDI 序列",
    all_files: "所有文件",
    check_update: "检查更新",
    repository_link: "仓库地址",
    about_script_engine: "关于脚本引擎",
    import_om_utils: "导入 om utils",
    import_pure_quarter_midi: "导入纯四分 MIDI",
    using_selected_layer_name: "使用选中图层名称而不是 MIDI 轨道名称。",
    normalize_pan_to_100: "声像标准化到 -100 ~ 100。",
    using_layering: "@冰鸠さくの的特有图层叠叠乐方法。",
    optimize_apply_effects: "优化部分效果视觉。",
    add_to_effect_transform: "将属性添加到效果中的变换中。",
    sure_to_import_pure_quarter_midi: "确定要导入纯四分音符 MIDI 文件吗？",
    pure_quarter_midi: "纯四分音符 MIDI",
    add_at_top_of_expression: "在表达式顶部添加",
    om_utils_same_as_project_directory: "若放置在 aep 项目的相同目录下",
    om_utils_added_to_project: "若放置在任意位置，然后添加到 AE 项目中",
    pitch: "音高",
    velocity: "力度",
    duration: "持续时间",
    scale: "缩放",
    cw_rotation: "顺时针旋转",
    ccw_ratation: "逆时针旋转",
    count: "计数",
    bool: "布尔",
    time_remap: "时间重映射",
    pingpong: "来回",
    note_on: "音符开",
    channel_pan: "通道声像",
    channel_volume: "通道音量",
    channel_glide: "通道弯音",
    horizontal_flip: "水平翻转",
    invert_color: "颜色反转",
    tuning: "调音",
    base_pitch: "原始音高",
    paren_stretched: "（拉伸）",
    paren_truncated: "（截断）",
    cannot_find_window_error: "错误：无法找到或创建窗口。",
    unsupported_setting_type_error: "错误：不支持的设置数据类型。",
    file_unreadable_error: "错误：无法读取 MIDI 文件。该文件可能已占用或不存在。",
    midi_header_validation_error: "错误：MIDI 文件头验证失败（不是标准 MIDI 文件或文件已损坏）。",
    midi_track_header_validation_error: "错误：MIDI 轨道块标头验证失败。",
    midi_custom_events_error: "错误：自定义 MIDI 事件无法读取。",
    midi_no_track_error: "错误：该 MIDI 文件不包含任何有效轨道。",
    not_after_effects_error: "错误：请在 Adobe After Effects 上使用此脚本。",
    cannot_create_file_error: "错误：无法创建文件。",
    cannot_find_composition_error: "错误：无法找到活动合成。请先激活一个合成。\n\n解决方法：请先打开一个合成，然后点击一下该合成的预览画面或轨道的窗口使之处于活跃状态即可。",
    no_midi_error: "错误：请先打开一个有效的 MIDI 文件。",
    no_options_checked_error: "错误：请至少勾选一个项目。",
    no_layer_selected_error: "错误：在当前合成中未选中任何图层。",
    not_one_track_for_apply_effects_only_error: "错误：应用效果只能同时选择一条轨道。",
    end_of_track_position_error: "错误：轨道结束位置有误。应为 %1，实际 %2。",
    cannot_set_time_remap_error: "错误：所选图层不能设置时间重映射。",
    cannot_tuning_error: "错误：所选图层不包含音频，不能进行调音。",
    about: "读取一个 MIDI 序列，并为当前合成添加一个或多个新图层，其中包含各个 MIDI 轨道的音高、力度和持续时间等滑块控件。\n\n脚本原作者：大卫·范·布林克 (omino)、Dora (NGDXW)、韩琦、家鳖大帝\n脚本作者：兰音\n仓库地址：%1",
    horizontal_mirror: "水平镜像",
    advanced_scale: "高级缩放",
    loading_midi: "加载 %1 ...",
    unsupported_fps_time_division_error: "错误：当前模式不支持帧每秒时分数据格式。",
};

var uiStr = {};
for (var key in SChinese) {
    if (hasOwn(SChinese, key)) {
        uiStr[key] = {
            zh: SChinese[key],
            en: English[key],
            ja: Japanese[key],
        };
    }
}
var DIALOG_SIGN = "...";

var SCROLLBAR_WIDTH = 13;
var ScrollGroup = /** @class */ (function () {
    function ScrollGroup(parent, contentParams) {
        var _this = this;
        if (contentParams === void 0) { contentParams = {}; }
        this.scrollY = 0;
        this.parent = parent;
        this.panel = addControl(parent, "group", { orientation: "row", alignment: ["fill", "fill"], spacing: 0 });
        this.content = addControl(this.panel, "group", __assign({ orientation: "column", alignment: ["left", "top"], alignChildren: "fill" }, contentParams));
        this.children = this.content.children;
        (this.margins = contentParams.margins);
        this.scrollbar = addControl(this.panel, "scrollbar", { alignment: "right" });
        this.scrollbar.onChanging = function () { return _this.onScroll(); }; // 居然没有 bind。
    }
    ScrollGroup.prototype.add = function (type, params, properties) {
        return addControl(this.content, type, params, properties);
    };
    ScrollGroup.prototype.onResize = function () {
        var _a = this.getContentPadding(), paddingLeft = _a[0]; _a[1];
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
        this.content.bounds = { x: paddingLeft, y: this.scrollY, width: bounds.width - SCROLLBAR_WIDTH * (+!hideScrollbar) - paddingLeft, height: this.getContentHeight() };
        this.scrollbar.bounds = { x: hideScrollbar ? bounds.width : bounds.width - SCROLLBAR_WIDTH, y: 0, width: SCROLLBAR_WIDTH, height: bounds.height };
        this.scrollbar.value = this.scrollY / (-heights.y) * (this.scrollbar.maxvalue - this.scrollbar.minvalue) + this.scrollbar.minvalue;
    };
    ScrollGroup.prototype.getContentHeight = function () {
        var marginTop = this.content.margins[1];
        var height = marginTop;
        for (var _i = 0, _a = this.content.children; _i < _a.length; _i++) {
            var control = _a[_i];
            height += control.size.height + this.content.spacing;
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
        var height = this.content.size.height;
        var viewHeight = this.panel.size.height;
        var y = height - viewHeight;
        return { height: height, viewHeight: viewHeight, y: y };
    };
    /** @deprecated */
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
    ScrollGroup.prototype.getContentPadding = function () {
        if (this.margins instanceof Array)
            return [this.margins[0], this.margins[1]];
        else if (typeof this.margins === "number")
            return [this.margins, this.margins];
        else
            return [0, 0];
    };
    return ScrollGroup;
}());
/* function getHeight(control: _Control) {
    return (control.size as Dimension).height; // 已知暂时无法解决特性之一，具体详见：https://github.com/microsoft/TypeScript/issues/51229
} */

var SPACING = 2;
var tabScrollGroupParams = {
    spacing: SPACING,
    margins: [7, 5, 0, 0],
};
var tabGroupParams = {
    orientation: "column",
    alignment: ["fill", "top"],
    alignChildren: "fill",
    spacing: SPACING,
    margins: [10, 5, 10, 0],
};
var BaseTab = /** @class */ (function () {
    //#endregion
    function BaseTab(parent, isScrollGroup, text, groupParams) {
        this.parent = parent;
        this.tab = addControl(this.parent.tabs, "tab", { text: text });
        groupParams !== null && groupParams !== void 0 ? groupParams : (groupParams = isScrollGroup ? tabScrollGroupParams : tabGroupParams);
        this.group = (isScrollGroup ?
            new ScrollGroup(this.tab, groupParams) :
            addControl(this.tab, "group", groupParams));
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
        var params = { text: text, alignment: ["fill", "fill"] };
        return this.group instanceof ScrollGroup ?
            this.group.add("checkbox", params) :
            addControl(this.group, "checkbox", params);
    };
    return BaseTab;
}());

var NullObjTab = /** @class */ (function (_super) {
    __extends(NullObjTab, _super);
    //#endregion
    function NullObjTab(parent) {
        var _this = _super.call(this, parent, true) || this;
        //#region 组件对象
        _this.pitch = _this.addCheckbox();
        _this.velocity = _this.addCheckbox(); // 致前辈：Velocity 就是力度，不是速度。
        _this.duration = _this.addCheckbox();
        _this.scale = _this.addCheckbox();
        _this.advancedScale = _this.addCheckbox();
        _this.cwRotation = _this.addCheckbox();
        _this.ccwRotation = _this.addCheckbox();
        _this.count = _this.addCheckbox();
        _this.bool = _this.addCheckbox();
        _this.timeRemap = _this.addCheckbox();
        _this.pingpong = _this.addCheckbox();
        _this.noteOn = _this.addCheckbox();
        _this.pan = _this.addCheckbox();
        _this.volume = _this.addCheckbox();
        _this.glide = _this.addCheckbox();
        return _this;
    }
    NullObjTab.prototype.translate = function () {
        this.tab.text = localize(uiStr.create_null_object_short);
        this.pitch.text = localize(uiStr.pitch);
        this.velocity.text = localize(uiStr.velocity);
        this.duration.text = localize(uiStr.duration);
        this.scale.text = localize(uiStr.scale);
        this.advancedScale.text = localize(uiStr.advanced_scale);
        this.cwRotation.text = localize(uiStr.cw_rotation);
        this.ccwRotation.text = localize(uiStr.ccw_ratation);
        this.count.text = localize(uiStr.count);
        this.bool.text = localize(uiStr.bool);
        this.timeRemap.text = localize(uiStr.time_remap);
        this.pingpong.text = localize(uiStr.pingpong);
        this.noteOn.text = localize(uiStr.note_on);
        this.pan.text = localize(uiStr.channel_pan);
        this.volume.text = localize(uiStr.channel_volume);
        this.glide.text = localize(uiStr.channel_glide);
    };
    return NullObjTab;
}(BaseTab));

var ApplyEffectsTab = /** @class */ (function (_super) {
    __extends(ApplyEffectsTab, _super);
    //#endregion
    function ApplyEffectsTab(parent) {
        var _a;
        var _this = _super.call(this, parent, true) || this;
        //#region 组件对象
        _this.timeRemap = _this.addCheckbox();
        _this.timeRemap2 = _this.addCheckbox();
        _this.pingpong = _this.addCheckbox();
        _this.hFlip = _this.addCheckbox();
        _this.hMirror = _this.addCheckbox();
        _this.cwRotation = _this.addCheckbox();
        _this.ccwRotation = _this.addCheckbox();
        _this.negative = _this.addCheckbox();
        _this.tuning = _this.addCheckbox();
        (_a = addGroup(_this.group.content, "", "dropdownlist"), _this.basePitchGroup = _a.group, _this.basePitchLbl = _a.label, _this.basePitchKeyCombo = _a.control);
        _this.basePitchOctCombo = addControl(_this.basePitchGroup, "dropdownlist");
        addItems.apply(void 0, __spreadArray([_this.basePitchKeyCombo], "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(",")));
        addItems.apply(void 0, __spreadArray([_this.basePitchOctCombo], "0,1,2,3,4,5,6,7,8,9,10".split(",")));
        _this.basePitchOctCombo.selection = 5;
        _this.basePitchGroup.enabled = false;
        _this.tuning.onClick = function () { return _this.basePitchGroup.enabled = _this.tuning.value; };
        _this.cwRotation.onClick = function () { return _this.ccwRotation.value = false; };
        _this.ccwRotation.onClick = function () { return _this.cwRotation.value = false; };
        _this.timeRemap.onClick = function () { return _this.timeRemap2.value = _this.pingpong.value = false; };
        _this.timeRemap2.onClick = function () { return _this.timeRemap.value = _this.pingpong.value = false; };
        _this.pingpong.onClick = function () { return _this.timeRemap.value = _this.timeRemap2.value = false; };
        return _this;
    }
    ApplyEffectsTab.prototype.translate = function () {
        this.tab.text = localize(uiStr.apply_effects_short);
        this.basePitchLbl.text = localize(uiStr.base_pitch);
        this.timeRemap.text = localize(uiStr.time_remap) + localize(uiStr.paren_stretched);
        this.timeRemap2.text = localize(uiStr.time_remap) + localize(uiStr.paren_truncated);
        this.pingpong.text = localize(uiStr.pingpong);
        this.hFlip.text = localize(uiStr.horizontal_flip);
        this.hMirror.text = localize(uiStr.horizontal_mirror);
        this.cwRotation.text = localize(uiStr.cw_rotation);
        this.ccwRotation.text = localize(uiStr.ccw_ratation);
        this.negative.text = localize(uiStr.invert_color);
        this.tuning.text = localize(uiStr.tuning);
    };
    return ApplyEffectsTab;
}(BaseTab));

var NumberType;
(function (NumberType) {
    NumberType[NumberType["POSITIVE_INT"] = 0] = "POSITIVE_INT";
    NumberType[NumberType["POSITIVE_DECIMAL"] = 1] = "POSITIVE_DECIMAL";
    NumberType[NumberType["DECIMAL"] = 2] = "DECIMAL";
})(NumberType || (NumberType = {}));
function setNumberEditText(editText, type, defaultValue) {
    editText.onChange = function () {
        var text = editText.text;
        // TODO: 这部分将会被修改为三元运算符。
        var regex = /\d+/g;
        if (type === NumberType.POSITIVE_DECIMAL)
            regex = /\d+(\.\d+)?/g;
        else if (type === NumberType.DECIMAL)
            regex = /-?\d+(\.\d+)?/g;
        var matches = text.match(regex);
        if (matches) {
            text = matches[0].replace(/^0+(?!\.)/g, "");
            text || (text = "0");
            var num = type == NumberType.POSITIVE_INT ? parseInt(text, 10) : parseFloat(text);
            text = String((type !== NumberType.DECIMAL && num <= 0 || isNaN(num)) ? defaultValue : num);
        }
        else
            text = String(defaultValue);
        editText.text = text;
    };
}

var BaseTool = /** @class */ (function () {
    //#endregion
    function BaseTool(parent) {
        this.parent = parent;
        this.group = addControl(this.parent.toolsPanel, "group", {
            orientation: "column",
            alignment: ["fill", "fill"],
            alignChildren: "fill",
            spacing: SPACING,
        });
    }
    return BaseTool;
}());

var MarkerConductor = /** @class */ (function (_super) {
    __extends(MarkerConductor, _super);
    //#endregion
    function MarkerConductor(parent) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, parent) || this;
        var FILL_CENTER = ["fill", "center"];
        (_a = addGroup(_this.group, "", "dropdownlist", { alignment: FILL_CENTER }), _this.unitGroup = _a.group, _this.unitLbl = _a.label, _this.unitCombo = _a.control);
        (_b = addGroup(_this.group, "BPM", "edittext", { text: "120", alignment: FILL_CENTER }), _this.bpmGroup = _b.group, _this.bpmLbl = _b.label, _this.bpmTxt = _b.control);
        (_c = addGroup(_this.group, "", "edittext", { text: "4", alignment: FILL_CENTER }), _this.beatGroup = _c.group, _this.beatLbl = _c.label, _this.beatTxt = _c.control);
        (_d = addGroup(_this.group, "", "dropdownlist", { alignment: FILL_CENTER }), _this.markOnGroup = _d.group, _this.markOnLbl = _d.label, _this.markOnCombo = _d.control);
        _this.translate();
        setNumberEditText(_this.bpmTxt, NumberType.POSITIVE_DECIMAL, 120);
        _this.unitCombo.onChange = function () {
            var unitIndex = _this.unitCombo.getSelectedIndex();
            _this.beatLbl.text = unitIndex === 0 ? localize(uiStr.beat) : localize(uiStr.shift_seconds_and_frames);
            if (unitIndex === 0)
                _this.bpmLbl.text = "BPM"; // TODO: 这部分将会被修改为三元运算符。
            else if (unitIndex === 1)
                _this.bpmLbl.text = localize(uiStr.seconds);
            else
                _this.bpmLbl.text = localize(uiStr.frames);
            setNumberEditText(_this.beatTxt, unitIndex === 0 ? NumberType.POSITIVE_INT : NumberType.DECIMAL, 4);
            _this.beatTxt.notify("onChange");
        };
        _this.unitCombo.notify("onChange");
        return _this;
    }
    MarkerConductor.prototype.translate = function () {
        this.unitLbl.text = localize(uiStr.unit);
        this.markOnLbl.text = localize(uiStr.mark_on);
        addItems(this.unitCombo, "BPM", localize(uiStr.time), localize(uiStr.frames));
        addItems(this.markOnCombo, localize(uiStr.add_null_layer), localize(uiStr.current_layer));
    };
    return MarkerConductor;
}(BaseTool));

var Separator = /** @class */ (function () {
    function Separator(parent, orientation) {
        this.control = parent.add("panel");
        this.control.alignment = orientation === "horizontal" ? ["fill", "top"] : ["center", "fill"];
    }
    return Separator;
}());

/**
 * 缓动类型。
 */
var EaseType;
(function (EaseType) {
    /**
     * 缓入。
     */
    EaseType[EaseType["EASE_IN"] = 0] = "EASE_IN";
    /**
     * 缓出。
     */
    EaseType[EaseType["EASE_OUT"] = 1] = "EASE_OUT";
    /**
     * 缓入缓出。
     */
    EaseType[EaseType["EASE_IN_OUT"] = 2] = "EASE_IN_OUT";
})(EaseType || (EaseType = {}));
var EaseType$1 = EaseType;

var Ease100Percent = /** @class */ (function (_super) {
    __extends(Ease100Percent, _super);
    //#endregion
    function Ease100Percent(parent) {
        var _this = _super.call(this, parent) || this;
        _this.easeInRadio = addControl(_this.group, "radiobutton", { value: true });
        _this.easeOutRadio = addControl(_this.group, "radiobutton");
        _this.easeInOutRadio = addControl(_this.group, "radiobutton");
        _this.translate();
        return _this;
    }
    Ease100Percent.prototype.getValue = function () {
        if (this.easeInOutRadio.value)
            return EaseType$1.EASE_IN_OUT;
        else if (this.easeOutRadio.value)
            return EaseType$1.EASE_OUT;
        else
            return EaseType$1.EASE_IN;
    };
    Ease100Percent.prototype.translate = function () {
        this.easeInRadio.text = localize(uiStr.ease_in);
        this.easeOutRadio.text = localize(uiStr.ease_out);
        this.easeInOutRadio.text = localize(uiStr.ease_in_out);
    };
    return Ease100Percent;
}(BaseTool));

var MyError = /** @class */ (function (_super) {
    __extends(MyError, _super);
    function MyError(msg) {
        var _newTarget = this.constructor;
        var _this = this;
        // 如果参数就是一个 MyError，就不用再警告了。
        if (typeof msg === "string" || !(msg instanceof MyError))
            alert(msg.toString(), localize(uiStr.error), true);
        _this = _super.call(this, msg.toString()) || this;
        _this.isMyError = true;
        _this.__proto__ = _newTarget.prototype;
        return _this;
    }
    return MyError;
}(Error));
var CannotFindWindowError = /** @class */ (function (_super) {
    __extends(CannotFindWindowError, _super);
    function CannotFindWindowError() {
        return _super.call(this, localize(uiStr.cannot_find_window_error)) || this;
    }
    return CannotFindWindowError;
}(MyError));
var UnsupportedSettingTypeError = /** @class */ (function (_super) {
    __extends(UnsupportedSettingTypeError, _super);
    function UnsupportedSettingTypeError() {
        return _super.call(this, localize(uiStr.unsupported_setting_type_error)) || this;
    }
    return UnsupportedSettingTypeError;
}(MyError));
var FileUnreadableError = /** @class */ (function (_super) {
    __extends(FileUnreadableError, _super);
    function FileUnreadableError() {
        return _super.call(this, localize(uiStr.file_unreadable_error)) || this;
    }
    return FileUnreadableError;
}(MyError));
var MidiHeaderValidationError = /** @class */ (function (_super) {
    __extends(MidiHeaderValidationError, _super);
    function MidiHeaderValidationError() {
        return _super.call(this, localize(uiStr.midi_header_validation_error)) || this;
    }
    return MidiHeaderValidationError;
}(MyError));
var MidiTrackHeaderValidationError = /** @class */ (function (_super) {
    __extends(MidiTrackHeaderValidationError, _super);
    function MidiTrackHeaderValidationError() {
        return _super.call(this, localize(uiStr.midi_track_header_validation_error)) || this;
    }
    return MidiTrackHeaderValidationError;
}(MyError));
var MidiCustomEventsError = /** @class */ (function (_super) {
    __extends(MidiCustomEventsError, _super);
    function MidiCustomEventsError() {
        return _super.call(this, localize(uiStr.midi_custom_events_error)) || this;
    }
    return MidiCustomEventsError;
}(MyError));
var MidiNoTrackError = /** @class */ (function (_super) {
    __extends(MidiNoTrackError, _super);
    function MidiNoTrackError() {
        return _super.call(this, localize(uiStr.midi_no_track_error)) || this;
    }
    return MidiNoTrackError;
}(MyError));
var NotAfterEffectsError = /** @class */ (function (_super) {
    __extends(NotAfterEffectsError, _super);
    function NotAfterEffectsError() {
        return _super.call(this, localize(uiStr.not_after_effects_error)) || this;
    }
    return NotAfterEffectsError;
}(MyError));
var CannotCreateFileError = /** @class */ (function (_super) {
    __extends(CannotCreateFileError, _super);
    function CannotCreateFileError() {
        return _super.call(this, localize(uiStr.cannot_create_file_error)) || this;
    }
    return CannotCreateFileError;
}(MyError));
var CannotFindCompositionError = /** @class */ (function (_super) {
    __extends(CannotFindCompositionError, _super);
    function CannotFindCompositionError() {
        return _super.call(this, localize(uiStr.cannot_find_composition_error)) || this;
    }
    return CannotFindCompositionError;
}(MyError));
var NoMidiError = /** @class */ (function (_super) {
    __extends(NoMidiError, _super);
    function NoMidiError() {
        return _super.call(this, localize(uiStr.no_midi_error)) || this;
    }
    return NoMidiError;
}(MyError));
var NoOptionsCheckedError = /** @class */ (function (_super) {
    __extends(NoOptionsCheckedError, _super);
    function NoOptionsCheckedError() {
        return _super.call(this, localize(uiStr.no_options_checked_error)) || this;
    }
    return NoOptionsCheckedError;
}(MyError));
var NoLayerSelectedError = /** @class */ (function (_super) {
    __extends(NoLayerSelectedError, _super);
    function NoLayerSelectedError() {
        return _super.call(this, localize(uiStr.no_layer_selected_error)) || this;
    }
    return NoLayerSelectedError;
}(MyError));
var NotOneTrackForApplyEffectsOnlyError = /** @class */ (function (_super) {
    __extends(NotOneTrackForApplyEffectsOnlyError, _super);
    function NotOneTrackForApplyEffectsOnlyError() {
        return _super.call(this, localize(uiStr.not_one_track_for_apply_effects_only_error)) || this;
    }
    return NotOneTrackForApplyEffectsOnlyError;
}(MyError));
var EndOfTrackPositionError = /** @class */ (function (_super) {
    __extends(EndOfTrackPositionError, _super);
    function EndOfTrackPositionError(endOffset, pointer) {
        return _super.call(this, localize(uiStr.end_of_track_position_error, endOffset, pointer)) || this;
    }
    return EndOfTrackPositionError;
}(MyError));
var CannotSetTimeRemapError = /** @class */ (function (_super) {
    __extends(CannotSetTimeRemapError, _super);
    function CannotSetTimeRemapError() {
        return _super.call(this, localize(uiStr.cannot_set_time_remap_error)) || this;
    }
    return CannotSetTimeRemapError;
}(MyError));
var CannotTuningError = /** @class */ (function (_super) {
    __extends(CannotTuningError, _super);
    function CannotTuningError() {
        return _super.call(this, localize(uiStr.cannot_tuning_error)) || this;
    }
    return CannotTuningError;
}(MyError));
var UnsupportedFpsTimeDivisionError = /** @class */ (function (_super) {
    __extends(UnsupportedFpsTimeDivisionError, _super);
    function UnsupportedFpsTimeDivisionError() {
        return _super.call(this, localize(uiStr.unsupported_fps_time_division_error)) || this;
    }
    return UnsupportedFpsTimeDivisionError;
}(MyError));

var sectionName = "om_midi";
var SettingsHelper = {
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
    },
};

// 取名为 Setting 而不是 Settings 以免和内置对象冲突。
var defs = {
    Language: 0,
    UsingSelectedLayerName: false,
    UsingLayering: false,
    OptimizeApplyEffects: true,
    NormalizePanTo100: true,
    AddToEffectTransform: false,
    ApplyEffectsStartTime: 1,
    NullObjectStartTime: 0,
    LastTool: 0,
};
var Setting = {};
var _loop_1 = function (tag) {
    if (hasOwn(defs, tag)) {
        Setting["get" + tag] = function (def) {
            if (def === void 0) { def = defs[tag]; }
            return SettingsHelper.get(tag, def);
        };
        Setting["set" + tag] = function (value) { return SettingsHelper.set(tag, value); };
    }
};
for (var tag in defs) {
    _loop_1(tag);
}

var ToolsTab = /** @class */ (function (_super) {
    __extends(ToolsTab, _super);
    //#endregion
    function ToolsTab(parent) {
        var _this = _super.call(this, parent, false, undefined, { orientation: "column", alignment: "fill", alignChildren: "fill", margins: [10, 5, 0, 0] }) || this;
        _this.toolsCombo = addControl(_this.group, "dropdownlist");
        _this.toolsCombo.selection = Setting.getLastTool();
        _this.separator = new Separator(_this.group, "horizontal");
        _this.toolsPanel = addControl(_this.group, "group", { orientation: "stack", alignment: "fill", alignChildren: "fill" });
        _this.marker = new MarkerConductor(_this);
        _this.ease = new Ease100Percent(_this);
        _this.toolsCombo.onChange = function () {
            var selected = _this.toolsCombo.getSelectedIndex();
            for (var i = 0; i < _this.toolsPanel.children.length; i++) {
                var tool = _this.toolsPanel.children[i];
                tool.visible = i === selected;
            }
            Setting.setLastTool(_this.toolsCombo.getSelectedIndex());
        };
        _this.toolsCombo.notify("onChange");
        return _this;
    }
    ToolsTab.prototype.getSelectedTool = function () {
        switch (this.toolsCombo.getSelectedIndex()) {
            case 0: return this.marker;
            case 1: return this.ease;
            default: return null;
        }
    };
    ToolsTab.prototype.translate = function () {
        this.tab.text = localize(uiStr.tools);
        addItems(this.toolsCombo, localize(uiStr.marker_conductor), localize(uiStr.easing_100_percent));
        this.marker.translate();
        this.ease.translate();
    };
    return ToolsTab;
}(BaseTab));

/**
 * 用于利用临时生成文件来执行操作的函数。
 */
var TempFile = /** @class */ (function (_super) {
    __extends(TempFile, _super);
    function TempFile(fileName) {
        return _super.call(this, Folder.temp.fsName + "/" + new Date().valueOf() + "_" + fileName) || this;
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
        throw new MyError(error);
    }
}

var ImportOmUtilsDialog = /** @class */ (function () {
    function ImportOmUtilsDialog() {
        this.window = new Window("dialog", localize(uiStr.add_at_top_of_expression), undefined, {
            resizeable: false,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        addControl(this.group, "statictext", { text: localize(uiStr.om_utils_same_as_project_directory) });
        addControl(this.group, "edittext", { text: '$.evalFile(thisProject.fullPath.replace(/\\\\[^\\\\]*$/, "/om_utils.jsx"));' }, { readonly: true });
        addControl(this.group, "statictext", { text: localize(uiStr.om_utils_added_to_project) });
        addControl(this.group, "edittext", { text: 'footage("om_utils.jsx").sourceData;' }, { readonly: true });
        this.okBtn = addControl(this.group, "button", { text: localize(uiStr.ok), alignment: "right" });
        this.window.defaultElement = this.okBtn;
    }
    ImportOmUtilsDialog.prototype.showDialog = function () {
        this.window.center();
        this.window.show();
    };
    return ImportOmUtilsDialog;
}());

// ²âÊÔ0 → 测试0
function convertTextEncoding(texts) {
    if (typeof texts === "string")
        texts = [texts];
    if (texts.length === 0)
        return [];
    var file = new TempFile("tmp.txt");
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
 * 存储 BPM 关键帧数据的类。
 */
var BpmKeysData = /** @class */ (function () {
    /**
     * 存储 BPM 关键帧数据的类。
     * @param secondsPerQuarter - 此刻的秒每四分音符的值（即当前速度）。
     * @param startTick - 相对开始位置。
     * @param startSecond - 之前所有数据实际秒数的总和。
     */
    function BpmKeysData(secondsPerQuarter, startTick, startSecond) {
        this.secondsPerQuarter = secondsPerQuarter;
        this.startTick = startTick;
        this.startSecond = startSecond;
    }
    return BpmKeysData;
}());

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
/**
 * 元数据事件类型。
 */
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
/**
 * 常规事件类型。
 */
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
/**
 * 控制器事件类型。
 */
var ControllerType;
(function (ControllerType) {
    ControllerType[ControllerType["BANK_SELECT"] = 0] = "BANK_SELECT";
    ControllerType[ControllerType["MODULATION"] = 1] = "MODULATION";
    ControllerType[ControllerType["BREATH_CONTROLLER"] = 2] = "BREATH_CONTROLLER";
    ControllerType[ControllerType["FOOT_CONTROLLER"] = 4] = "FOOT_CONTROLLER";
    ControllerType[ControllerType["PORTAMENTO_TIME"] = 5] = "PORTAMENTO_TIME";
    ControllerType[ControllerType["DATA_ENTRY"] = 6] = "DATA_ENTRY";
    ControllerType[ControllerType["MAIN_VOLUME"] = 7] = "MAIN_VOLUME";
    ControllerType[ControllerType["BALANCE"] = 8] = "BALANCE";
    ControllerType[ControllerType["PAN"] = 10] = "PAN";
    ControllerType[ControllerType["EXPRESSION_CONTROLLER"] = 11] = "EXPRESSION_CONTROLLER";
    ControllerType[ControllerType["EFFECT_CONTROL_1"] = 12] = "EFFECT_CONTROL_1";
    ControllerType[ControllerType["EFFECT_CONTROL_2"] = 13] = "EFFECT_CONTROL_2";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_1"] = 16] = "GENERAL_PURPOSE_CONTROLLERS_1";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_2"] = 17] = "GENERAL_PURPOSE_CONTROLLERS_2";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_3"] = 18] = "GENERAL_PURPOSE_CONTROLLERS_3";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_4"] = 19] = "GENERAL_PURPOSE_CONTROLLERS_4";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_0"] = 32] = "LSB_FOR_CONTROLLERS_0";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_1"] = 33] = "LSB_FOR_CONTROLLERS_1";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_2"] = 34] = "LSB_FOR_CONTROLLERS_2";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_3"] = 35] = "LSB_FOR_CONTROLLERS_3";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_4"] = 36] = "LSB_FOR_CONTROLLERS_4";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_5"] = 37] = "LSB_FOR_CONTROLLERS_5";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_6"] = 38] = "LSB_FOR_CONTROLLERS_6";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_7"] = 39] = "LSB_FOR_CONTROLLERS_7";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_8"] = 40] = "LSB_FOR_CONTROLLERS_8";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_9"] = 41] = "LSB_FOR_CONTROLLERS_9";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_10"] = 42] = "LSB_FOR_CONTROLLERS_10";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_11"] = 43] = "LSB_FOR_CONTROLLERS_11";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_12"] = 44] = "LSB_FOR_CONTROLLERS_12";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_13"] = 45] = "LSB_FOR_CONTROLLERS_13";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_14"] = 46] = "LSB_FOR_CONTROLLERS_14";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_15"] = 47] = "LSB_FOR_CONTROLLERS_15";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_16"] = 48] = "LSB_FOR_CONTROLLERS_16";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_17"] = 49] = "LSB_FOR_CONTROLLERS_17";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_18"] = 50] = "LSB_FOR_CONTROLLERS_18";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_19"] = 51] = "LSB_FOR_CONTROLLERS_19";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_20"] = 52] = "LSB_FOR_CONTROLLERS_20";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_21"] = 53] = "LSB_FOR_CONTROLLERS_21";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_22"] = 54] = "LSB_FOR_CONTROLLERS_22";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_23"] = 55] = "LSB_FOR_CONTROLLERS_23";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_24"] = 56] = "LSB_FOR_CONTROLLERS_24";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_25"] = 57] = "LSB_FOR_CONTROLLERS_25";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_26"] = 58] = "LSB_FOR_CONTROLLERS_26";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_27"] = 59] = "LSB_FOR_CONTROLLERS_27";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_28"] = 60] = "LSB_FOR_CONTROLLERS_28";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_29"] = 61] = "LSB_FOR_CONTROLLERS_29";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_30"] = 62] = "LSB_FOR_CONTROLLERS_30";
    ControllerType[ControllerType["LSB_FOR_CONTROLLERS_31"] = 63] = "LSB_FOR_CONTROLLERS_31";
    ControllerType[ControllerType["DAMPER_PEDAL"] = 64] = "DAMPER_PEDAL";
    ControllerType[ControllerType["PORTAMENTO"] = 65] = "PORTAMENTO";
    ControllerType[ControllerType["SOSTENUTO"] = 66] = "SOSTENUTO";
    ControllerType[ControllerType["SOFT_PEDAL"] = 67] = "SOFT_PEDAL";
    ControllerType[ControllerType["LEGATO_FOOTSWITCH"] = 68] = "LEGATO_FOOTSWITCH";
    ControllerType[ControllerType["HOLD_2"] = 69] = "HOLD_2";
    ControllerType[ControllerType["SOUND_CONTROLLER_1"] = 70] = "SOUND_CONTROLLER_1";
    ControllerType[ControllerType["SOUND_CONTROLLER_2"] = 71] = "SOUND_CONTROLLER_2";
    ControllerType[ControllerType["SOUND_CONTROLLER_3"] = 72] = "SOUND_CONTROLLER_3";
    ControllerType[ControllerType["SOUND_CONTROLLER_4"] = 73] = "SOUND_CONTROLLER_4";
    ControllerType[ControllerType["SOUND_CONTROLLER_5"] = 74] = "SOUND_CONTROLLER_5";
    ControllerType[ControllerType["SOUND_CONTROLLER_6"] = 75] = "SOUND_CONTROLLER_6";
    ControllerType[ControllerType["SOUND_CONTROLLER_7"] = 76] = "SOUND_CONTROLLER_7";
    ControllerType[ControllerType["SOUND_CONTROLLER_8"] = 77] = "SOUND_CONTROLLER_8";
    ControllerType[ControllerType["SOUND_CONTROLLER_9"] = 78] = "SOUND_CONTROLLER_9";
    ControllerType[ControllerType["SOUND_CONTROLLER_10"] = 79] = "SOUND_CONTROLLER_10";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_5"] = 80] = "GENERAL_PURPOSE_CONTROLLERS_5";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_6"] = 81] = "GENERAL_PURPOSE_CONTROLLERS_6";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_7"] = 82] = "GENERAL_PURPOSE_CONTROLLERS_7";
    ControllerType[ControllerType["GENERAL_PURPOSE_CONTROLLERS_8"] = 83] = "GENERAL_PURPOSE_CONTROLLERS_8";
    ControllerType[ControllerType["PORTAMENTO_CONTROL"] = 84] = "PORTAMENTO_CONTROL";
    ControllerType[ControllerType["EFFECTS_1_DEPTH"] = 91] = "EFFECTS_1_DEPTH";
    ControllerType[ControllerType["EFFECTS_2_DEPTH"] = 92] = "EFFECTS_2_DEPTH";
    ControllerType[ControllerType["EFFECTS_3_DEPTH"] = 93] = "EFFECTS_3_DEPTH";
    ControllerType[ControllerType["EFFECTS_4_DEPTH"] = 94] = "EFFECTS_4_DEPTH";
    ControllerType[ControllerType["EFFECTS_5_DEPTH"] = 95] = "EFFECTS_5_DEPTH";
    ControllerType[ControllerType["DATA_INCREMENT"] = 96] = "DATA_INCREMENT";
    ControllerType[ControllerType["DATA_DECREMENT"] = 97] = "DATA_DECREMENT";
    ControllerType[ControllerType["NON_REGISTERED_PARAMETER_NUMBER_LSB"] = 98] = "NON_REGISTERED_PARAMETER_NUMBER_LSB";
    ControllerType[ControllerType["NON_REGISTERED_PARAMETER_NUMBER_MSB"] = 99] = "NON_REGISTERED_PARAMETER_NUMBER_MSB";
    ControllerType[ControllerType["REGISTERED_PARAMETER_NUMBER_LSB"] = 100] = "REGISTERED_PARAMETER_NUMBER_LSB";
    ControllerType[ControllerType["REGISTERED_PARAMETER_NUMBER_MSB"] = 101] = "REGISTERED_PARAMETER_NUMBER_MSB";
    ControllerType[ControllerType["MODE_MESSAGES_1"] = 121] = "MODE_MESSAGES_1";
    ControllerType[ControllerType["MODE_MESSAGES_2"] = 122] = "MODE_MESSAGES_2";
    ControllerType[ControllerType["MODE_MESSAGES_3"] = 123] = "MODE_MESSAGES_3";
    ControllerType[ControllerType["MODE_MESSAGES_4"] = 124] = "MODE_MESSAGES_4";
    ControllerType[ControllerType["MODE_MESSAGES_5"] = 125] = "MODE_MESSAGES_5";
    ControllerType[ControllerType["MODE_MESSAGES_6"] = 126] = "MODE_MESSAGES_6";
    ControllerType[ControllerType["MODE_MESSAGES_7"] = 127] = "MODE_MESSAGES_7";
})(ControllerType || (ControllerType = {}));

var NoteEvent = /** @class */ (function () {
    function NoteEvent() {
        /** 与前一项间隔基本时间。 */
        this.deltaTime = 0;
        /** 至乐曲开始的基本时间。 */
        this.startTick = 0;
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
var TempoMetaEvent = /** @class */ (function (_super) {
    __extends(TempoMetaEvent, _super);
    function TempoMetaEvent(tempo) {
        var _this = _super.call(this, MetaEventType.SET_TEMPO, tempo) || this;
        _this.tempo = tempo;
        return _this;
    }
    return TempoMetaEvent;
}(NumberMetaEvent));
// Set Tempo Meta Event Values
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
    function RegularEvent(type, channel, values) {
        var _this = _super.call(this) || this;
        _this.type = type;
        _this.channel = channel;
        _this.values = values;
        return _this;
    }
    return RegularEvent;
}(NoteEvent));
var NoteOnOffEvent = /** @class */ (function (_super) {
    __extends(NoteOnOffEvent, _super);
    function NoteOnOffEvent(type, channel, values) {
        var _this = _super.call(this, type, channel, values) || this;
        _this.pitch = values[0];
        _this.velocity = values[1];
        return _this;
    }
    return NoteOnOffEvent;
}(RegularEvent));
var NoteOnEvent = /** @class */ (function (_super) {
    __extends(NoteOnEvent, _super);
    function NoteOnEvent(channel, values, velocity, deltaTime, duration, startTick) {
        var _this = this;
        if (values instanceof Array)
            _this = _super.call(this, RegularEventType.NOTE_ON, channel, values) || this;
        else {
            _this = _super.call(this, RegularEventType.NOTE_ON, channel, [values, velocity]) || this;
            _this.deltaTime = deltaTime;
            _this.duration = duration;
            _this.startTick = startTick;
        }
        return _this;
    }
    return NoteOnEvent;
}(NoteOnOffEvent));
var NoteOffEvent = /** @class */ (function (_super) {
    __extends(NoteOffEvent, _super);
    function NoteOffEvent(channel, values) {
        return _super.call(this, RegularEventType.NOTE_OFF, channel, values) || this;
    }
    return NoteOffEvent;
}(NoteOnOffEvent));
var SystemExclusiveEvent = /** @class */ (function (_super) {
    __extends(SystemExclusiveEvent, _super);
    function SystemExclusiveEvent(channel, values) {
        return _super.call(this, RegularEventType.SYSTEM_EXCLUSIVE_EVENTS, channel, values) || this;
    }
    return SystemExclusiveEvent;
}(RegularEvent));
var ControllerEvent = /** @class */ (function (_super) {
    __extends(ControllerEvent, _super);
    function ControllerEvent(channel, values) {
        var _this = _super.call(this, RegularEventType.CONTROLLER, channel, values) || this;
        _this.controller = values[0];
        _this.value = values[1];
        return _this;
    }
    return ControllerEvent;
}(RegularEvent));
var PitchBendEvent = /** @class */ (function (_super) {
    __extends(PitchBendEvent, _super);
    function PitchBendEvent(channel, values) {
        var _this = _super.call(this, RegularEventType.PITCH_BEND_EVENT, channel, values) || this;
        _this.value = PitchBendEvent.take7Bit(values[1]) << 7 | PitchBendEvent.take7Bit(values[0]);
        return _this;
    }
    /**
     * 取后 7 位。
     * @param b - 1 个字节。
     * @returns 后 7 位。
     */
    PitchBendEvent.take7Bit = function (b) {
        return b & 127;
    };
    return PitchBendEvent;
}(RegularEvent));
var NoteOnSecondEvent = /** @class */ (function (_super) {
    __extends(NoteOnSecondEvent, _super);
    function NoteOnSecondEvent(raw, startSecond) {
        var _this = _super.call(this, raw.channel, raw.values) || this;
        assign(_this, raw);
        _this.startSecond = startSecond;
        return _this;
    }
    return NoteOnSecondEvent;
}(NoteOnEvent));
var NoteOffSecondEvent = /** @class */ (function (_super) {
    __extends(NoteOffSecondEvent, _super);
    function NoteOffSecondEvent(raw, startSecond) {
        var _this = _super.call(this, raw.channel, raw.values) || this;
        _this.startSecond = startSecond;
        return _this;
    }
    return NoteOffSecondEvent;
}(NoteOffEvent));

/**
 * 动态 BPM 积分器。
 */
var DynamicBpmIntegrator = /** @class */ (function () {
    function DynamicBpmIntegrator(tempoTrack) {
        this.datas = [];
        this.tempoTrack = tempoTrack;
        var midi = tempoTrack.midi();
        if (!midi.isTpbTimeDivision())
            throw new UnsupportedFpsTimeDivisionError();
        this.ticksPerQuarter = midi.timeDivision;
        this.initData();
    }
    DynamicBpmIntegrator.prototype.initData = function () {
        for (var _i = 0, _a = this.tempoTrack; _i < _a.length; _i++) {
            var note = _a[_i];
            if (note instanceof TempoMetaEvent) {
                var startTick = note.startTick;
                if (this.datas.length === 0 && startTick !== 0)
                    startTick = 0;
                var startSecond = 0;
                var lastData = this.getLastData();
                var secondsPerQuarter = note.tempo / 1e6;
                if (lastData) {
                    if (secondsPerQuarter === lastData.secondsPerQuarter)
                        continue;
                    else if (startTick === lastData.startTick) {
                        lastData.secondsPerQuarter = secondsPerQuarter;
                        continue;
                    }
                    startSecond = (startTick - lastData.startTick) / this.ticksPerQuarter * lastData.secondsPerQuarter;
                }
                this.datas.push(new BpmKeysData(secondsPerQuarter, startTick, startSecond));
            }
        }
    };
    DynamicBpmIntegrator.prototype.getLastData = function () { return this.datas[this.datas.length - 1]; };
    DynamicBpmIntegrator.prototype.getSecond = function (note) {
        var startSecond = this.getActualSecond(note.startTick);
        if (note instanceof NoteOnEvent) {
            var result = new NoteOnSecondEvent(note, startSecond);
            if (note.duration)
                result.durationSecond = this.getActualSecond(note.startTick + note.duration) - startSecond;
            if (note.interruptDuration)
                result.interruptDurationSecond = this.getActualSecond(note.startTick + note.interruptDuration) - startSecond;
            return result;
        }
        else {
            var result = new NoteOffSecondEvent(note, startSecond);
            return result;
        }
    };
    /**
     * 根据 MIDI 音符的相对时刻获取音频播放的实际时刻（秒）。
     * @param tick - 音符相对时刻。
     * @returns 音频播放的实际时刻。
     */
    DynamicBpmIntegrator.prototype.getActualSecond = function (tick) {
        for (var i = 0; i < this.datas.length; i++) {
            var curData = this.datas[i], nextData = this.datas[i + 1];
            if (nextData !== undefined && tick > nextData.startTick)
                continue;
            var currentSecond = (tick - curData.startTick) * curData.secondsPerQuarter / this.ticksPerQuarter;
            return curData.startSecond + currentSecond;
        }
        // 针对没有任何 BPM 关键帧却误打误撞进入这个函数环节的。
        alert("No Bpm Keys!");
        return tick;
    };
    return DynamicBpmIntegrator;
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

var MidiTrack = /** @class */ (function (_super) {
    __extends(MidiTrack, _super);
    function MidiTrack(parent, offset, size) {
        var _newTarget = this.constructor;
        var _this = _super.call(this) || this;
        _this.noteCount = 0;
        _this.lengthTick = 0; // 此处表示轨道的持续时间。
        _this.__proto__ = _newTarget.prototype;
        _this.parent = parent;
        _this.offset = offset;
        _this.size = size;
        _this.readNotes();
        return _this;
    }
    // 以下全部没法用 setter 属性。
    MidiTrack.prototype.setName = function (value) { var _a; (_a = this.name) !== null && _a !== void 0 ? _a : (this.name = value); };
    MidiTrack.prototype.setInstrument = function (value) { var _a; (_a = this.instrument) !== null && _a !== void 0 ? _a : (this.instrument = value); };
    MidiTrack.prototype.setChannel = function (value) { var _a; (_a = this.channel) !== null && _a !== void 0 ? _a : (this.channel = value); };
    MidiTrack.prototype.setTempo = function (value) {
        var _a, _b, _c;
        (_a = this.tempo) !== null && _a !== void 0 ? _a : (this.tempo = value);
        var midi = this.midi(), bpm = this.bpm();
        (_b = midi.bpm) !== null && _b !== void 0 ? _b : (midi.bpm = bpm);
        (_c = midi.tempoTrack) !== null && _c !== void 0 ? _c : (midi.tempoTrack = this);
        if (midi.bpm !== bpm)
            midi.isDynamicBpm = true;
    };
    MidiTrack.prototype.bpm = function () {
        if (this.tempo === undefined)
            return undefined;
        var bpm = 6e7 / this.tempo;
        return parseFloat(bpm.toFixed(3));
    };
    MidiTrack.prototype.readNotes = function () {
        var endOffset = this.offset + this.size;
        var noteOnStack = []; // 音符开事件栈，用于匹配音符关事件。为什么是栈而不是队列？这与 FL Studio 相匹配。
        var statusByte;
        while (!(this.parent.isReadOver() || this.parent.getPointer() >= endOffset)) {
            var deltaTime = this.parent.readDeltaTime();
            var startTick = this.lengthTick += deltaTime;
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
                            new EndOfTrackPositionError(endOffset, this.parent.getPointer());
                    // eslint-disable-next-line no-fallthrough
                    case MetaEventType.END_OF_FILE:
                        return;
                    case MetaEventType.TEXT_EVENT:
                    case MetaEventType.COPYRIGHT_NOTICE:
                    case MetaEventType.TRACK_NAME:
                    case MetaEventType.INSTRUMENT_NAME:
                    case MetaEventType.LYRICS:
                    case MetaEventType.MARKER:
                    case MetaEventType.CUE_POINT: {
                        var textContent = this.parent.readString(metaEventLength);
                        note = new TextMetaEvent(metaType, textContent);
                        if (metaType === MetaEventType.TRACK_NAME)
                            this.setName(textContent);
                        else if (metaType === MetaEventType.INSTRUMENT_NAME)
                            this.setInstrument(textContent);
                        break;
                    }
                    case MetaEventType.MIDI_PORT: // 长度一般为 1
                    case MetaEventType.MIDI_PORT_2: // 长度一般为 1
                    case MetaEventType.KEY_SIGNATURE: // 长度一般为 2
                    case MetaEventType.SET_TEMPO: { // 长度一般为 3
                        var numberValue = this.parent.readByte(metaEventLength);
                        if (metaType === MetaEventType.SET_TEMPO) {
                            note = new TempoMetaEvent(numberValue);
                            this.setTempo(numberValue);
                        }
                        else
                            note = new NumberMetaEvent(metaType, numberValue);
                        break;
                    }
                    case MetaEventType.SMPTE_OFFSET: { // 长度一般为 5
                        var smpteOffset = this.parent.readByteArray(metaEventLength);
                        note = new SmpteOffsetMetaEvent(smpteOffset);
                        break;
                    }
                    case MetaEventType.TIME_SIGNATURE: { // 长度一般为 4
                        var timeSignature = this.parent.readByteArray(metaEventLength);
                        note = new TimeSignatureMetaEvent(timeSignature);
                        break;
                    }
                    default: { // 自定义事件
                        var customValue = this.parent.readByteArray(metaEventLength);
                        note = new CustomMetaEvent(metaType, customValue);
                        break;
                    }
                }
            }
            else { // 常规事件
                var channel = (statusByte & 0x0f) + 1; // 后半字节表示通道编号。
                this.setChannel(channel);
                var regularType = statusByte >> 4; // 只取前半字节。
                switch (regularType) {
                    case RegularEventType.NOTE_AFTERTOUCH:
                    case RegularEventType.CONTROLLER:
                    case RegularEventType.PITCH_BEND_EVENT:
                    case RegularEventType.NOTE_OFF:
                    case RegularEventType.NOTE_ON: {
                        var byte2 = this.parent.readByteArray(2); // 读两位
                        switch (regularType) {
                            case RegularEventType.NOTE_ON: {
                                note = new NoteOnEvent(channel, byte2);
                                var noteOn = note;
                                this.noteCount++;
                                for (var _i = 0, noteOnStack_1 = noteOnStack; _i < noteOnStack_1.length; _i++) {
                                    var prevNoteOn = noteOnStack_1[_i];
                                    if (prevNoteOn.interruptDuration === undefined)
                                        if (startTick <= prevNoteOn.startTick)
                                            noteOn.interruptDuration = 0;
                                        else
                                            prevNoteOn.interruptDuration = startTick - prevNoteOn.startTick;
                                } // 中断复音上的其它音符开。
                                noteOnStack.push(noteOn);
                                break;
                            }
                            case RegularEventType.NOTE_OFF: {
                                note = new NoteOffEvent(channel, byte2);
                                var noteOff = note;
                                for (var i = noteOnStack.length - 1; i >= 0; i--) {
                                    var noteOn = noteOnStack[i];
                                    if (noteOn.pitch === noteOff.pitch) {
                                        noteOn.duration = startTick - noteOn.startTick; // 计算音符时长。
                                        noteOn.noteOff = noteOff;
                                        noteOff.noteOn = noteOn; // 将两个音符关联在一起。
                                        noteOnStack.splice(i, 1); // 移出栈。
                                        break;
                                    }
                                }
                                break;
                            }
                            case RegularEventType.CONTROLLER:
                                note = new ControllerEvent(channel, byte2);
                                break;
                            case RegularEventType.PITCH_BEND_EVENT:
                                note = new PitchBendEvent(channel, byte2);
                                break;
                            case RegularEventType.NOTE_AFTERTOUCH:
                            default:
                                note = new RegularEvent(regularType, channel, byte2); // 其它事件暂时无需求而忽略。
                                break;
                        }
                        break;
                    }
                    case RegularEventType.PROGRAM_CHANGE:
                    case RegularEventType.CHANNEL_AFTERTOUCH: {
                        var byte1 = this.parent.readByteArray(1); // 读一位
                        note = new RegularEvent(regularType, channel, byte1);
                        break;
                    }
                    case RegularEventType.END_OF_FILE:
                        return;
                    case RegularEventType.SYSTEM_EXCLUSIVE_EVENTS: {
                        var systemExclusiveEventLength = this.parent.readDeltaTime();
                        note = new SystemExclusiveEvent(channel, this.parent.readByteArray(systemExclusiveEventLength));
                        break;
                    }
                    default: // 自定义事件，不知道怎么读。
                        throw new MidiCustomEventsError();
                }
            }
            if (note !== null) {
                note.deltaTime = deltaTime;
                note.startTick = startTick;
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
        var description = localize(uiStr.channel_abbr) + " " + ((_a = this.channel) !== null && _a !== void 0 ? _a : 0);
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
    MidiTrack.prototype.midi = function () { return this.parent.midi; };
    return MidiTrack;
}(Array));

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
        this.formatType = MidiFormatType.SYNC_MULTI_TRACK;
        this.trackCount = 0;
        this.timeDivision = 0;
        this.tracks = [];
        this.preferredTrackIndex = 0;
        this.isPureQuarter = false;
        this.isDynamicBpm = false;
        if (file === true) {
            this.fileName = localize(uiStr.pure_quarter_midi);
            this.isPureQuarter = true;
            this.formatType = MidiFormatType.SINGLE_TRACK;
            this.trackCount = 1;
            this.timeDivision = 1;
            return;
        }
        this.file = file;
        this.fileName = file.displayName;
        if (file && file.open("r")) {
            file.encoding = "binary"; // 读取为二进制编码。
            this.length = file.length;
            // this.content = file.read(this.length);
            this.midiReader = new MidiReader(this);
            file.close();
            if (this.isDynamicBpm && this.tempoTrack)
                this.integrator = new DynamicBpmIntegrator(this.tempoTrack);
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
    /**
     * 判断时分数据是否为标准的基本时间每拍格式。
     */
    Midi.prototype.isTpbTimeDivision = function () { return typeof this.timeDivision === "number"; };
    return Midi;
}());

var FlowGroup = /** @class */ (function () {
    function FlowGroup(parent, columns, alignment) {
        if (alignment === void 0) { alignment = "fill"; }
        this.parent = parent;
        this.outerGroup = addControl(this.parent, "group", { orientation: "column", alignment: alignment, alignChildren: "fill" });
        this.columns = columns;
    }
    FlowGroup.prototype.add = function (type, params, properties) {
        var rows = this.outerGroup.children;
        if (rows.length === 0 || rows[rows.length - 1].children.length >= this.columns)
            this.addRow();
        rows = this.outerGroup.children;
        var lastRow = rows[rows.length - 1];
        return addControl(lastRow, type, params, properties);
    };
    FlowGroup.prototype.addRow = function () {
        addControl(this.outerGroup, "group", { orientation: "row", alignment: "fill", alignChildren: "left" });
    };
    return FlowGroup;
}());

var SettingsDialog = /** @class */ (function () {
    //#endregion
    function SettingsDialog(portal) {
        var _a;
        var _this = this;
        this.portal = portal;
        this.window = new Window("dialog", localize(uiStr.settings) + " - " + User.scriptName + " v" + User.version, undefined, {
            resizeable: false,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.group = addControl(this.window, "group", { orientation: "row", alignChildren: "fill", alignment: "fill" });
        this.leftGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill" });
        this.separator = new Separator(this.group, "vertical");
        this.rightGroup = addControl(this.group, "group", { orientation: "column", alignChildren: "fill", alignment: "fill", spacing: 5 });
        this.aboutLbl = addControl(this.leftGroup, "statictext", { text: localize(uiStr.about, User.githubPage) }, { multiline: true, scrolling: true });
        this.openGithubBtnGroup = new FlowGroup(this.leftGroup, 3, ["fill", "bottom"]);
        this.openGithubLatestBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.check_update) + DIALOG_SIGN });
        this.openGithubPageBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.repository_link) });
        this.extendScriptEngineAboutBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.about_script_engine) });
        this.importOmUtilsBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.import_om_utils) + DIALOG_SIGN });
        this.importPureQuarterMidiBtn = this.openGithubBtnGroup.add("button", { text: localize(uiStr.import_pure_quarter_midi) + DIALOG_SIGN });
        this.generalPanel = this.addPanel(this.rightGroup, localize(uiStr.general), [10, 10, 10, 7]);
        (_a = addGroup(this.generalPanel, localize(uiStr.language), "dropdownlist"), this.languageGroup = _a.group, this.languageLbl = _a.label, this.languageCombo = _a.control);
        addItems(this.languageCombo, localize(uiStr.app_default), "简体中文", "English", "日本語");
        var selectedLanguageIndex = Setting.getLanguage();
        if (selectedLanguageIndex > 0 && selectedLanguageIndex < this.languageCombo.items.length)
            this.languageCombo.selection = selectedLanguageIndex;
        this.nullObjPanel = this.addPanel(this.rightGroup, localize(uiStr.create_null_object));
        this.usingSelectedLayerName = addControl(this.nullObjPanel, "checkbox", { text: localize(uiStr.using_selected_layer_name) });
        this.usingSelectedLayerName.value = Setting.getUsingSelectedLayerName();
        this.normalizePanTo100 = addControl(this.nullObjPanel, "checkbox", { text: localize(uiStr.normalize_pan_to_100) });
        this.normalizePanTo100.value = Setting.getNormalizePanTo100();
        this.applyEffectsPanel = this.addPanel(this.rightGroup, localize(uiStr.apply_effects));
        this.usingLayering = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.using_layering) });
        this.usingLayering.value = Setting.getUsingLayering();
        this.optimizeApplyEffects = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.optimize_apply_effects) });
        this.optimizeApplyEffects.value = Setting.getOptimizeApplyEffects();
        this.addToEffectTransform = addControl(this.applyEffectsPanel, "checkbox", { text: localize(uiStr.add_to_effect_transform) });
        this.addToEffectTransform.value = Setting.getAddToEffectTransform();
        this.buttonGroup = addControl(this.rightGroup, "group", { orientation: "row", alignment: ["fill", "bottom"], alignChildren: ["right", "center"] });
        this.okBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.ok) });
        this.cancelBtn = addControl(this.buttonGroup, "button", { text: localize(uiStr.cancel) });
        this.window.defaultElement = this.okBtn;
        this.window.cancelElement = this.cancelBtn;
        this.okBtn.onClick = function () {
            Setting.setUsingSelectedLayerName(_this.usingSelectedLayerName.value);
            Setting.setUsingLayering(_this.usingLayering.value);
            Setting.setOptimizeApplyEffects(_this.optimizeApplyEffects.value);
            Setting.setNormalizePanTo100(_this.normalizePanTo100.value);
            Setting.setAddToEffectTransform(_this.addToEffectTransform.value);
            Setting.setLanguage(_this.languageCombo.getSelectedIndex());
            $.locale = SettingsDialog.langIso[_this.languageCombo.getSelectedIndex()];
            _this.window.close();
        };
        this.openGithubPageBtn.onClick = function () { return openUrl(User.githubPage); };
        this.openGithubLatestBtn.onClick = function () { return openUrl(User.githubLatest); };
        this.importPureQuarterMidiBtn.onClick = function () {
            if (!confirm(localize(uiStr.sure_to_import_pure_quarter_midi), true, localize(uiStr.import_pure_quarter_midi)))
                return;
            _this.portal.midi = new Midi(true);
            _this.portal.selectedTracks = [undefined];
            _this.portal.selectMidiName.text = localize(uiStr.pure_quarter_midi);
            _this.portal.selectTrackBtn.text = "";
            _this.portal.selectTrackBtn.enabled = false;
            _this.portal.selectBpmTxt.enabled = true;
        };
        this.importOmUtilsBtn.onClick = function () { return new ImportOmUtilsDialog().showDialog(); };
        this.extendScriptEngineAboutBtn.onClick = function () { return $.about(); };
    }
    SettingsDialog.prototype.showDialog = function () {
        this.window.center();
        this.window.show();
    };
    SettingsDialog.prototype.addPanel = function (parent, name, margins) {
        if (margins === void 0) { margins = [10, 13, 10, 3]; }
        return addControl(parent, "panel", {
            text: name,
            orientation: "column",
            alignChildren: "fill",
            alignment: "fill",
            spacing: 2,
            margins: margins,
        });
    };
    SettingsDialog.langIso = ["", "zh_CN", "en", "ja"];
    return SettingsDialog;
}());

var MidiTrackSelector = /** @class */ (function () {
    function MidiTrackSelector(parent) {
        var _this = this;
        this.parent = parent;
        this.window = new Window("dialog", localize(uiStr.midi_track_selector_title), undefined, {
            resizeable: true,
        });
        if (this.window === null)
            throw new CannotFindWindowError();
        this.window.onResizing = this.window.onResize = function () { return _this.window.layout.resize(); };
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
                alert(localize(uiStr.select_at_least_one_track), localize(uiStr.warning));
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
    MidiTrackSelector.prototype.showDialog = function () {
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

var ProgressPalette = /** @class */ (function () {
    function ProgressPalette(title1, title2) {
        this.running = true;
        this.palette = new Window("palette");
        this.palette.orientation = "column";
        this.palette.alignChildren = "left";
        this.title1 = this.palette.add("statictext", undefined, title1);
        this.title2 = this.palette.add("statictext", undefined, title2);
        this.progressBar = this.palette.add("progressbar");
        this.cancelBtn = this.palette.add("button", undefined, localize(uiStr.cancel));
        this.cancelBtn.alignment = "right";
        this.palette.cancelElement = this.cancelBtn;
    }
    ProgressPalette.prototype.isRunning = function () { return this.running; };
    ProgressPalette.prototype.isCanceled = function () { return !this.running; };
    ProgressPalette.prototype.setValue = function (value) {
        this.progressBar.value = value * 100;
        // this.palette.update(); // 有这玩意ㄦ吗？
    };
    ProgressPalette.prototype.setTitle1 = function (title1) { this.title1.text = title1; };
    ProgressPalette.prototype.setTitle2 = function (title2) { this.title2.text = title2; };
    ProgressPalette.prototype.close = function () { this.palette.close(); };
    ProgressPalette.prototype.show = function () { this.palette.show(); };
    return ProgressPalette;
}());

var MIN_INTERVAL = 5e-4; // 最小间隔，为前一音符关与当前音符开之间避让而腾出的间隔，单位秒，默认为 5 丝秒。
var NULL_SOURCE_NAME = "om midi null"; // 生成的空对象纯色名称。为避免造成不必要的麻烦因此统一用英文，下同。
var TRANSFORM_NAME = "om midi Transform"; // 生成的变换效果名称。
var ENTER_INCREMENTAL = 15; // 水平翻转的优化效果变换值，单位百分比。
var ROTATION_INCREMENTAL = 15; // 顺时针和逆时针旋转的优化效果变换值，单位角度。
var SHOW_PROGRESSBAR = false; // 是否显示进度条调色板。
var Core = /** @class */ (function () {
    function Core(portal) {
        this.portal = portal;
    }
    Core.prototype.apply = function () {
        var comp = getComp();
        if (comp === null)
            throw new CannotFindCompositionError();
        var progressBar;
        try {
            var tab = this.portal.getSelectedTab();
            if (tab !== this.portal.toolsTab && this.portal.midi && SHOW_PROGRESSBAR) {
                progressBar = new ProgressPalette(localize(uiStr.loading_midi, this.portal.midi.fileName)); // 进度条调色板。
                progressBar.show();
                progressBar.setValue(0.6);
            }
            if (tab === this.portal.nullObjTab)
                this.applyCreateNullObject(comp);
            else if (tab === this.portal.applyEffectsTab)
                this.applyEffects(comp);
            else if (tab === this.portal.toolsTab) {
                var tool = this.portal.toolsTab.getSelectedTool();
                if (tool === this.portal.toolsTab.marker)
                    this.applyMarkerConductor(comp);
                else if (tool === this.portal.toolsTab.ease)
                    this.applyEase100Percent(comp);
            }
        }
        catch (error) {
            throw new MyError(error);
        }
        finally {
            if (progressBar)
                progressBar.close();
            app.endUndoGroup();
        }
    };
    Core.prototype.applyCreateNullObject = function (comp) {
        var _this = this;
        var _a, _b;
        app.beginUndoGroup("om midi - Apply Create Null Object");
        var nullTab = this.portal.nullObjTab;
        if (!this.portal.midi || this.portal.selectedTracks.length === 0)
            throw new NoMidiError();
        var checks = nullTab.getCheckedChecks();
        if (checks.length === 0)
            throw new NoOptionsCheckedError();
        //#region 设置
        var usingSelectedLayerName = Setting.getUsingSelectedLayerName();
        var selectedLayer = this.getSelectLayer(comp);
        if (selectedLayer === null)
            usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
        var pan100 = Setting.getNormalizePanTo100();
        //#endregion
        var secondsPerTick = this.getSecondsPerTick();
        var startTime = this.getStartTime(comp);
        var _loop_1 = function (track) {
            if (track === undefined && !this_1.portal.midi.isPureQuarter)
                return "continue";
            var nullLayer = this_1.createNullLayer(comp);
            if (track !== undefined)
                nullLayer.name = "[midi]" + (usingSelectedLayerName && selectedLayer !== null ? selectedLayer.name :
                    ((_a = track.name) !== null && _a !== void 0 ? _a : "Channel " + ((_b = track.channel) !== null && _b !== void 0 ? _b : 0)));
            else
                nullLayer.name = "[midi]BPM: " + this_1.portal.selectBpmTxt.text;
            nullLayer.inPoint = startTime;
            nullLayer.outPoint = track !== undefined ? startTime + track.lengthTick * secondsPerTick :
                startTime + comp.duration;
            for (var _d = 0, checks_1 = checks; _d < checks_1.length; _d++) {
                var check = checks_1[_d];
                this_1.addSliderControl(nullLayer, check.text);
            } // 限制：只能存储索引值。
            var setValueAtTime = function (check, seconds, value, inType, outType) {
                return _this.setValueAtTime(nullLayer, checks, check, startTime + seconds, value, inType, outType);
            };
            var noteOnCount = 0, // 音符开计数。
            lastEventType = RegularEventType.NOTE_OFF, // 上一次音符事件类型。
            lastEventStartTick = -1, // 上一次迄今基本时间。
            lastPan = NaN, lastVolume = NaN, lastGlide = NaN; // 上一次声像、音量、弯音。
            var addNoteEvent = function (noteEvent) {
                var _a, _b;
                if (noteEvent.startTick <= lastEventStartTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent) && (noteEvent instanceof NoteOnEvent || noteEvent instanceof NoteOffEvent))
                    return; // 跳过同一时间点上的音符。
                var seconds = noteEvent.startTick * secondsPerTick;
                if (noteEvent instanceof NoteOnEvent && noteEvent.velocity !== 0) { // 音符开。
                    if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
                        +noteEvent.interruptDuration < 0 || +noteEvent.duration < 0)
                        return;
                    // ExtendScript 最新迷惑行为：undefined < 0 为 true！！！
                    // 解决方法：将 undefined 前加一元正号强行转换为数字类型 NaN，即可进行比较。
                    noteOnCount++;
                    setValueAtTime(nullTab.pitch, seconds, noteEvent.pitch, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.velocity, seconds, noteEvent.velocity, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.duration, seconds, ((_a = noteEvent.duration) !== null && _a !== void 0 ? _a : 0) * secondsPerTick, KeyframeInterpolationType.HOLD); // 持续时间单位改为秒。
                    setValueAtTime(nullTab.count, seconds, noteOnCount, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.bool, seconds, noteOnCount % 2, KeyframeInterpolationType.HOLD); // 迷惑行为，为了和旧版脚本行为保持一致。
                    setValueAtTime(nullTab.scale, seconds, noteOnCount % 2 ? 100 : -100, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.advancedScale, seconds, noteOnCount % 2 ? 1 : -1, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.cwRotation, seconds, ((noteOnCount - 1) % 4) * 90, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.ccwRotation, seconds, ((4 - (noteOnCount - 1) % 4) % 4) * 90, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.noteOn, seconds, 1, KeyframeInterpolationType.HOLD);
                    setValueAtTime(nullTab.timeRemap, seconds, 0, KeyframeInterpolationType.LINEAR);
                    setValueAtTime(nullTab.pingpong, seconds, +!(noteOnCount % 2), KeyframeInterpolationType.LINEAR);
                    if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
                        var duration = (_b = noteEvent.interruptDuration) !== null && _b !== void 0 ? _b : noteEvent.duration;
                        var noteOffSeconds = (noteEvent.startTick + duration) * secondsPerTick - MIN_INTERVAL;
                        setValueAtTime(nullTab.timeRemap, noteOffSeconds, 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                        setValueAtTime(nullTab.pingpong, noteOffSeconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                    lastEventType = RegularEventType.NOTE_ON;
                    lastEventStartTick = noteEvent.startTick;
                }
                else if (noteEvent instanceof NoteOnEvent && noteEvent.velocity === 0 || noteEvent instanceof NoteOffEvent) { // 音符关。力度为 0 的音符开视为音符关。
                    var noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
                    setValueAtTime(nullTab.velocity, noteOffSeconds, noteEvent.velocity, KeyframeInterpolationType.HOLD); // 新增松键力度。
                    setValueAtTime(nullTab.noteOn, seconds, 0, KeyframeInterpolationType.HOLD);
                    lastEventType = RegularEventType.NOTE_OFF;
                    lastEventStartTick = noteEvent.startTick;
                }
                else if (noteEvent instanceof ControllerEvent) { // 控制器事件。
                    var controller = noteEvent.controller;
                    if (controller === ControllerType.PAN) { // 声像。
                        if (lastPan === noteEvent.value)
                            return;
                        lastPan = noteEvent.value;
                        var pan = noteEvent.value - 64; // 64 为中置 0。
                        if (pan100) { // 规范到 -100 ~ 100（小数）。
                            if (pan < 0)
                                pan = pan / 64 * 100;
                            else if (pan > 0)
                                pan = pan / 63 * 100;
                        } // 否则是 -64 ~ 63（整数），两边没对齐。
                        setValueAtTime(nullTab.pan, seconds, pan, KeyframeInterpolationType.HOLD);
                    }
                    else if (controller === ControllerType.MAIN_VOLUME) { // 主音量。
                        if (lastVolume === noteEvent.value)
                            return;
                        lastVolume = noteEvent.value;
                        setValueAtTime(nullTab.volume, seconds, noteEvent.value, KeyframeInterpolationType.HOLD);
                    }
                    // lastEventType = RegularEventType.CONTROLLER;
                }
                else if (noteEvent instanceof PitchBendEvent) { // 弯音事件。
                    if (lastGlide === noteEvent.value)
                        return;
                    lastGlide = noteEvent.value;
                    var glide = noteEvent.value - 0x2000; // 8192 为中央 0。
                    // 取值范围：-8192 ~ 8191（整数）。
                    setValueAtTime(nullTab.glide, seconds, glide, KeyframeInterpolationType.HOLD);
                    // lastEventType = RegularEventType.PITCH_BEND_EVENT;
                }
            };
            //#region 在轨道起始处添加
            // 这些内容以保持和 v0.1 原版一致。
            // 从零开始“力度”，因此您可以根据需要绘制它。事实上在 0 时不会有任何音符（后人注：才怪）……
            setValueAtTime(nullTab.velocity, 0, 0, KeyframeInterpolationType.HOLD);
            setValueAtTime(nullTab.noteOn, 0, 0, KeyframeInterpolationType.HOLD);
            // “计数”从 1 开始，为了表示一开始如果没有音符的话用 0 了。
            setValueAtTime(nullTab.count, 0, 0, KeyframeInterpolationType.HOLD);
            //#endregion
            this_1.dealNoteEvents(track, comp, secondsPerTick, startTime, addNoteEvent);
        };
        var this_1 = this;
        for (var _i = 0, _c = this.portal.selectedTracks; _i < _c.length; _i++) {
            var track = _c[_i];
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
        var startTime = this.getStartTime(comp);
        layer.startTime = startTime;
        var beat = 1;
        var unit = marker.unitCombo.getSelectedIndex();
        if (unit === 1)
            startTime -= parseFloat(marker.beatTxt.text); // 偏移秒数
        else if (unit === 2)
            startTime -= parseFloat(marker.beatTxt.text) * comp.frameDuration; // 偏移帧数
        var bpm = parseFloat(marker.bpmTxt.text);
        while (startTime <= comp.displayStartTime + comp.duration) {
            if (startTime >= comp.displayStartTime)
                layer.marker.setValueAtTime(startTime, new MarkerValue(String(beat)));
            if (unit === 0) {
                beat = beat % parseInt(marker.beatTxt.text) + 1;
                startTime += 60 / bpm; // 周期 BPM
            }
            else {
                beat++;
                if (unit === 1)
                    startTime += bpm; // 周期秒数
                else if (unit === 2)
                    startTime += bpm * comp.frameDuration; // 周期帧数
            }
        }
    };
    Core.prototype.applyEffects = function (comp) {
        var _this = this;
        app.beginUndoGroup("om midi - Apply Effects");
        var effectsTab = this.portal.applyEffectsTab;
        if (!this.portal.midi || this.portal.selectedTracks.length === 0)
            throw new NoMidiError();
        if (effectsTab.getCheckedChecks().length === 0)
            throw new NoOptionsCheckedError();
        if (this.portal.selectedTracks.length !== 1)
            throw new NotOneTrackForApplyEffectsOnlyError();
        var isTunningOnly = effectsTab.getCheckedChecks().length === 1 && effectsTab.tuning.value;
        var _layer = this.getSelectLayer(comp);
        if (_layer === null)
            throw new NoLayerSelectedError();
        var layer = _layer; // 去掉后，所有函数内部截获的 layer 变量可能会为 null。
        var secondsPerTick = this.getSecondsPerTick();
        var track = this.portal.selectedTracks[0];
        var startTime = this.getStartTime(comp);
        var getLayerStartTime = function () { return startTime - (layer.inPoint - layer.startTime); };
        var getLayerOutPoint = function () { return track !== undefined ? startTime + track.lengthTick * secondsPerTick :
            startTime + comp.duration; };
        if (this.portal.startTimeCombo.getSelectedIndex() === 1)
            startTime = layer.inPoint;
        else if (!isTunningOnly)
            layer.startTime = getLayerStartTime();
        //#region 设置
        var layering = Setting.getUsingLayering();
        var optimize = Setting.getOptimizeApplyEffects();
        var addToGeometry2 = Setting.getAddToEffectTransform();
        //#endregion
        //#region 预处理效果
        if (layer.timeRemapEnabled)
            layer.timeRemapEnabled = false;
        var source = layer.source;
        var sourceLength = (+(source.duration / source.frameDuration).toFixed(0) - 1) * source.frameDuration;
        var layerLength = layer.outPoint - layer.inPoint - source.frameDuration;
        var mirrorIndex = 0;
        var mirrorProp = function () { return Core.getEffects(layer).property(mirrorIndex).property(2); };
        if (effectsTab.hMirror.value) {
            mirrorIndex = Core.getEffects(layer).addProperty("ADBE Mirror").propertyIndex;
            Core.getEffects(layer).property(mirrorIndex).property(1).setValue([source.width / 2, source.height / 2]);
        }
        var geometry2Index = 0;
        var geometry2 = {
            prop: function () { return Core.getEffects(layer).property(geometry2Index); },
            scaleTogether: function () { return this.prop().property(3); },
            scaleHeight: function () { return this.prop().property(4); },
            scaleWidth: function () { return this.prop().property(5); },
            rotation: function () { return this.prop().property(8); },
        };
        if (effectsTab.hFlip.value || effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
            if (effectsTab.hFlip.value)
                layer.scale.expressionEnabled = false;
            else if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value)
                layer.rotation.expressionEnabled = false;
            if (addToGeometry2) {
                geometry2Index = this.getGeometry2Effect(layer).propertyIndex;
                geometry2.scaleTogether().setValue(false);
            }
        }
        var timeRemapRemoveKey = function (layer, keyIndex) {
            try {
                layer.timeRemap.removeKey(keyIndex);
            }
            catch (error) { } // 如果关键帧在合成时间外，会报错。
        };
        var curStartTime = 0;
        if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value) {
            if (!layer.canSetTimeRemapEnabled)
                throw new CannotSetTimeRemapError();
            layer.timeRemapEnabled = true;
            curStartTime = layer.timeRemap.valueAtTime(layer.inPoint, false);
            timeRemapRemoveKey(layer, 2);
            layer.timeRemap.expressionEnabled = false;
        }
        if (!isTunningOnly)
            layer.outPoint = getLayerOutPoint();
        var audioLayer;
        var basePitch = this.getBasePitch();
        if (effectsTab.tuning.value) {
            if (!layer.hasAudio)
                throw new CannotTuningError();
            audioLayer = layer.duplicate();
            audioLayer.enabled = false;
            audioLayer.moveAfter(layer);
            audioLayer.timeRemapEnabled = true;
            if (!(effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value))
                curStartTime = audioLayer.timeRemap.valueAtTime(layer.inPoint, false);
            timeRemapRemoveKey(audioLayer, 2);
            audioLayer.startTime = getLayerStartTime();
            audioLayer.outPoint = getLayerOutPoint();
            audioLayer.timeRemap.expressionEnabled = false;
            layer.audioEnabled = false;
        }
        var invertIndex = 0;
        var invertProp = function () { return Core.getEffects(layer).property(invertIndex).property(2); };
        if (effectsTab.negative.value) {
            invertIndex = Core.getEffects(layer).addProperty("ADBE Invert").propertyIndex;
            invertProp().setValue(100);
        }
        //#endregion
        var noteOnCount = 0, lastEventType = RegularEventType.NOTE_OFF, lastEventStartTick = -1;
        var addNoteEvent = function (noteEvent) {
            var _a, _b;
            if (noteEvent.startTick <= lastEventStartTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
                return; // 跳过同一时间点上的音符。
            var seconds = noteEvent.startTick * secondsPerTick + startTime;
            if (noteEvent instanceof NoteOnEvent) {
                if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
                    +noteEvent.interruptDuration < 0 || +noteEvent.duration < 0)
                    return;
                var hasDuration = noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined;
                var duration = (_b = (_a = noteEvent.interruptDuration) !== null && _a !== void 0 ? _a : noteEvent.duration) !== null && _b !== void 0 ? _b : 0;
                var noteOffSeconds = (noteEvent.startTick + duration) * secondsPerTick - MIN_INTERVAL + startTime;
                if (effectsTab.hFlip.value) {
                    var addKey = function (seconds) { return !addToGeometry2 ? layer.scale.addKey(seconds) :
                        (geometry2.scaleHeight().addKey(seconds), geometry2.scaleWidth().addKey(seconds)); };
                    var setValueAtKey = function (keyIndex, value) {
                        return !addToGeometry2 ? layer.scale.setValueAtKey(keyIndex, value) :
                            (geometry2.scaleHeight().setValueAtKey(keyIndex, value[1]),
                                geometry2.scaleWidth().setValueAtKey(keyIndex, value[0]));
                    };
                    var setInterpolationTypeAtKey = function (keyIndex, inType) {
                        return !addToGeometry2 ? layer.scale.setInterpolationTypeAtKey(keyIndex, inType) :
                            (geometry2.scaleHeight().setInterpolationTypeAtKey(keyIndex, inType),
                                geometry2.scaleWidth().setInterpolationTypeAtKey(keyIndex, inType));
                    };
                    var setPointKeyEase = function (keyIndex, easeType, isHold) {
                        return !addToGeometry2 ? _this.setPointKeyEase(layer.scale, keyIndex, easeType, isHold) :
                            (_this.setPointKeyEase(geometry2.scaleHeight(), keyIndex, easeType, isHold),
                                _this.setPointKeyEase(geometry2.scaleWidth(), keyIndex, easeType, isHold));
                    };
                    var key = addKey(seconds);
                    var scale = noteOnCount % 2 ? -100 : 100;
                    if (!optimize || !hasDuration) {
                        setValueAtKey(key, [scale, 100]);
                        setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                    }
                    else {
                        setValueAtKey(key, [scale + ENTER_INCREMENTAL * Math.sign(scale), 100 + ENTER_INCREMENTAL]);
                        setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                        var key2 = addKey(noteOffSeconds);
                        setValueAtKey(key2, [scale, 100]);
                        setPointKeyEase(key2, EaseType$1.EASE_IN, true);
                    }
                }
                if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
                    var addKey = function (seconds) { return !addToGeometry2 ? layer.rotation.addKey(seconds) :
                        geometry2.rotation().addKey(seconds); };
                    var setValueAtKey = function (keyIndex, value) {
                        return !addToGeometry2 ? layer.rotation.setValueAtKey(keyIndex, value) :
                            geometry2.rotation().setValueAtKey(keyIndex, value);
                    };
                    var setInterpolationTypeAtKey = function (keyIndex, inType) {
                        return !addToGeometry2 ? layer.rotation.setInterpolationTypeAtKey(keyIndex, inType) :
                            geometry2.rotation().setInterpolationTypeAtKey(keyIndex, inType);
                    };
                    var setPointKeyEase = function (keyIndex, easeType, isHold) {
                        return !addToGeometry2 ? _this.setPointKeyEase(layer.rotation, keyIndex, easeType, isHold) :
                            _this.setPointKeyEase(geometry2.rotation(), keyIndex, easeType, isHold);
                    };
                    var value = effectsTab.cwRotation.value ? (noteOnCount % 4) * 90 : ((4 - noteOnCount % 4) % 4) * 90;
                    var key = addKey(seconds);
                    if (!optimize || !hasDuration) {
                        setValueAtKey(key, value);
                        setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                    }
                    else {
                        var startValue = value + ROTATION_INCREMENTAL * (effectsTab.cwRotation.value ? -1 : 1);
                        setValueAtKey(key, startValue);
                        setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                        var key2 = addKey(noteOffSeconds);
                        setValueAtKey(key2, value);
                        setPointKeyEase(key2, EaseType$1.EASE_IN, true);
                    }
                }
                if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value) {
                    if (noteOnCount === 0 && noteEvent.startTick !== 0) { // 如果第一个音符不在乐曲最开始。
                        var inPointValue = layer.timeRemap.keyValue(1);
                        var inPointTime = layer.timeRemap.keyTime(1);
                        layer.timeRemap.setValueAtTime(inPointTime + seconds - startTime, inPointValue);
                    }
                    var key = layer.timeRemap.addKey(seconds);
                    var direction = !(noteOnCount % 2);
                    layer.timeRemap.setValueAtKey(key, curStartTime);
                    layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                    if (hasDuration) {
                        var key2 = layer.timeRemap.addKey(noteOffSeconds);
                        var endTime = (effectsTab.timeRemap.value || effectsTab.pingpong.value) ?
                            curStartTime + layerLength : noteOffSeconds - seconds + curStartTime;
                        var reversed = effectsTab.pingpong.value && !direction;
                        if (reversed)
                            layer.timeRemap.setValueAtKey(key, endTime);
                        if (endTime < layer.source.duration)
                            layer.timeRemap.setValueAtKey(key2, !reversed ? endTime : curStartTime);
                        else {
                            layer.timeRemap.removeKey(key2);
                            key2 = layer.timeRemap.addKey(seconds + sourceLength - curStartTime);
                            layer.timeRemap.setValueAtKey(key2, sourceLength);
                        }
                        layer.timeRemap.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                }
                if (effectsTab.negative.value) {
                    var key = invertProp().addKey(seconds);
                    invertProp().setValueAtKey(key, noteOnCount % 2 ? 0 : 100);
                    invertProp().setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                }
                if (effectsTab.hMirror.value) {
                    var key = mirrorProp().addKey(seconds);
                    mirrorProp().setValueAtKey(key, noteOnCount % 2 ? 0 : 180);
                    mirrorProp().setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
                }
                if (effectsTab.tuning.value && audioLayer) { // TODO: 根据音符事件力度来控制音频电平。
                    var key = audioLayer.timeRemap.addKey(seconds);
                    audioLayer.timeRemap.setValueAtKey(key, curStartTime);
                    audioLayer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
                    if (hasDuration) {
                        var key2 = audioLayer.timeRemap.addKey(noteOffSeconds);
                        var duration2 = noteOffSeconds - seconds;
                        var pitch = noteEvent.pitch - basePitch; // C5 == 60
                        var stretch = Math.pow(2, (pitch / 12));
                        var endTime = duration2 * stretch + curStartTime;
                        if (endTime < layer.source.duration)
                            audioLayer.timeRemap.setValueAtKey(key2, endTime);
                        else {
                            audioLayer.timeRemap.removeKey(key2);
                            key2 = audioLayer.timeRemap.addKey(seconds + (sourceLength - curStartTime) / stretch);
                            audioLayer.timeRemap.setValueAtKey(key2, sourceLength);
                        }
                        audioLayer.timeRemap.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
                    }
                }
                if (layering && noteOnCount !== 0) {
                    if (!isTunningOnly)
                        layer = _this.splitLayer(layer, seconds);
                    if (effectsTab.tuning.value && audioLayer)
                        audioLayer = _this.splitLayer(audioLayer, seconds);
                }
                noteOnCount++;
                lastEventType = RegularEventType.NOTE_ON;
                lastEventStartTick = noteEvent.startTick;
            }
        };
        this.dealNoteEvents(track, comp, secondsPerTick, curStartTime, addNoteEvent);
    };
    Core.prototype.applyEase100Percent = function (comp) {
        app.beginUndoGroup("om midi - Apply Easing 100%");
        var easeType = this.portal.toolsTab.ease.getValue();
        var layers = comp.selectedLayers;
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            if (layer === undefined)
                continue;
            for (var _a = 0, _b = layer.selectedProperties; _a < _b.length; _a++) {
                var property = _b[_a];
                if (property === undefined)
                    continue;
                for (var _c = 0, _d = property.selectedKeys; _c < _d.length; _c++) {
                    var keyIndex = _d[_c];
                    if (keyIndex === undefined)
                        continue;
                    this.setPointKeyEase(property, keyIndex, easeType, false);
                }
            }
        }
    };
    //#region 辅助方法
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
            catch (error) { // 执行撤销之后可能会变为“对象无效”，它既不是 undefined 也不是 null，只能用 try catch 捕获。
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
                    if (item.name === NULL_SOURCE_NAME &&
                        item instanceof FootageItem &&
                        item.mainSource instanceof SolidSource) {
                        this.nullSource = item; // 找到名字相同的空对象了。
                        nullSource.remove(); // 删除刚创建的空对象。
                        continue refindNullSource; // 跳两层循环，回到第一个 if 语句。
                    }
                }
                this.nullSource = nullSource; // 没找到，创建一个新的。
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
    Core.getEffects = function (layer) {
        return layer("Effects");
    };
    /**
     * 为指定图层添加一个表达式控制 - 滑块控制的效果。
     * @param layer - 图层。
     * @param name - 滑块名称。
     * @returns 滑块控制效果序号。
     */
    Core.prototype.addSliderControl = function (layer, name) {
        var slider = Core.getEffects(layer).addProperty("ADBE Slider Control"); // 中文版竟然能正常运行？ADBE 是什么鬼？ // 后人注：属性的英文名前面加上“ADBE”之后，即可在任何本地化语言使用。
        slider.name = name;
        return slider.propertyIndex; // 向索引组添加新属性时，将从头开始重新创建索引组，从而使对属性的所有现有引用无效。
    };
    Core.prototype.setValueAtTime = function (layer, checks, check, seconds, value, inType, outType) {
        if (outType === void 0) { outType = inType; }
        var index = checks.indexOf(check);
        if (index === -1)
            return;
        // 注：根据说明文档，将创建的效果等属性的引用赋值给变量后，下一次创建新的效果时，之前的引用会变为“对象无效”。只能通过其序号进行访问。
        var slider = Core.getEffects(layer).property(index + 1).property(1);
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
    /**
     * 获取开始时间。
     * @param comp - 合成。
     * @returns 开始时间。
     */
    Core.prototype.getStartTime = function (comp) {
        var startTimePos = this.portal.startTimeCombo.getSelectedIndex();
        /* return startTimePos === 0 ? comp.displayStartTime :
            (startTimePos === 1 ? comp.time :
            (startTimePos === 2 ? comp.workAreaStart : 0)); // ExtendScript 似乎对三元运算符的优先级有偏见。 */
        // TODO: 这部分将会被修改为三元运算符。
        if (startTimePos === 0)
            return comp.displayStartTime;
        else if (startTimePos === 1)
            return comp.time;
        else if (startTimePos === 2)
            return comp.workAreaStart;
        else
            return 0;
    };
    Core.prototype.dealNoteEvents = function (track, comp, secondsPerTick, startTime, addNoteEvent) {
        if (track !== undefined)
            for (var _i = 0, track_1 = track; _i < track_1.length; _i++) {
                var noteEvent = track_1[_i];
                addNoteEvent(noteEvent);
            }
        else {
            var noteCount = 0;
            while (noteCount * secondsPerTick <= startTime + comp.duration)
                addNoteEvent(new NoteOnEvent(0, 60, 100, +!!noteCount, 1, noteCount++));
        }
    };
    /**
     * 根据界面中的用户设定获取原始音高。
     * @returns 原始音高。
     */
    Core.prototype.getBasePitch = function () {
        var tab = this.portal.applyEffectsTab;
        return tab.basePitchOctCombo.getSelectedIndex() * 12 + tab.basePitchKeyCombo.getSelectedIndex();
    };
    /**
     * 拆分图层。
     * @param layer - 图层。
     * @param time - 拆分时间点。
     * @returns 拆分后的新图层。
     */
    Core.prototype.splitLayer = function (layer, time) {
        var outPoint = layer.outPoint; // 备份原出点位置。
        var newLayer = layer.duplicate();
        layer.outPoint = time;
        newLayer.inPoint = time;
        newLayer.outPoint = outPoint;
        return newLayer;
    };
    /**
     * 为关键帧设置 100% 的缓动曲线。
     * @param property - 属性。
     * @param keyIndex - 关键帧序号。
     * @param easeType - 缓动类型。
     * @param isHold - 在不缓动的另一侧是否为定格类型？否则为线性。
     */
    Core.prototype.setPointKeyEase = function (property, keyIndex, easeType, isHold) {
        var easeLength = property.keyInTemporalEase(keyIndex).length;
        var ease = [];
        for (var i = 0; i < easeLength; i++)
            ease.push(new KeyframeEase(0, 100));
        if (ease.length !== 0)
            property.setTemporalEaseAtKey(keyIndex, ease);
        var anotherSide = isHold ? KeyframeInterpolationType.HOLD : KeyframeInterpolationType.LINEAR;
        if (easeType === EaseType$1.EASE_IN)
            property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.BEZIER, anotherSide);
        else if (easeType === EaseType$1.EASE_OUT)
            property.setInterpolationTypeAtKey(keyIndex, anotherSide, KeyframeInterpolationType.BEZIER);
    };
    //#endregion
    /**
     * 获取一个效果中的变换。如果有现成的就不用再次创建了。
     * @param layer - 图层。
     * @returns 变换效果。
     */
    Core.prototype.getGeometry2Effect = function (layer) {
        var GEOMETRY2_MATCH_NAME = "ADBE Geometry2";
        var effects = Core.getEffects(layer);
        for (var i = 1; i <= effects.numProperties; i++) {
            var property_1 = effects.property(i);
            if (property_1.name === TRANSFORM_NAME && property_1.matchName === GEOMETRY2_MATCH_NAME)
                return property_1;
        }
        var property = effects.addProperty(GEOMETRY2_MATCH_NAME);
        property.name = TRANSFORM_NAME;
        return property;
    };
    return Core;
}());

var SETTINGS_ICON = "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAEMklEQVRIib1WTUgjWRCudeemiK4N4iy6GjYHESHYZC8yvqcEVvxBUEQvUcQQzOYayDALe3IGc1ToGQysoBdJBvUQVi9BXoSAkDQEg+QQiBsRvXQiO8bAHpYsX6c7ZESduewWNP3yut6rqq/qq8o3jDH6Smk11G6/9kAsFqMXWAghnlTinPuIyCNJkgW/NU2DgY9E9EEIkXrmXHWBCCqVyqMPY0z2+XwVTdMqptzf31disViFMbb51DnjrH7/iy9E6Z6cnNQXGxsb+ttms9HQ0BBZrVY35zwghMg9d0HNAOe8GVAQEaCICiEAg9zT00Pn5+e0v78fxH46nQ7DQH9/P2WzWZlzDsjcRo4+CiHURw0Q0ZrX6/W0t7dTKpWCd6okSXJbWxudnp7iew5GOee5QqFgsVqt2PNLkhSem5ujpqYmOj4+9nPOXUKI32u3AivG2NutrS0d5cvLy9ob2OM9MzMDzFsNbP3hcLimg5zgMXUZY0nG2A9mDlCmrZIkFXd2dvSyCgQCqt1ul0dGRqhUKlEoFELluIhIMmCIEtH09PS0B1GYOpC6OwJE9BprGPB7vd618fFxWlhYwGXdxmWzRs03S5L0xoRBVVWKRqMwgpzIhg7Wfgg8Hxsbw953MICQw8lkUg/R5XIhxLd1pfYecACCeslkMiZsw4aeDWV7eHioa6G0UeJmDoahbOJpfPSZHICg7mEceuvr67oenIJzjLFmXA4dCByCY2YOvu3u7v6zXC5fHRwcfD8wMPByYmKCwuHwj8B7ZWVFBiwejydXLBZHyuXym0wm809LS8srh8NB8Xi8r1gs/uX1elE9wB75+AD8iejvfD5PDVRtFSirQDweJ5Sl0RZ0DpTLZajcoi0IIYBt6ubmRvcOXIAjcKJQKCA3qhDiFyHEp894wDlfBskGBwd1RU3TwE714uJC7uvr0y/hnNuIKA8yd3R06IfT6bRuHJXU2dlJDocDxHtvRPDJhGhYkqS9zc3Nl11dXbS6ukrX19fviGivVCq5p6amyGKxtF5dXa00NDT4R0dHX83Pz9PZ2Rnt7u6C7b8lEok2i8UiO51OamxstCcSiRYi+gMQ/edVBIjUXC4329vbS7e3eqsPcs4dRIQnryjKu1Ao9BQPfuac/2Ss9cPIWSKRwFo1DQRDoZBOtOXlZVTCHrCUZfkzJiuK8pDJ4Tomr5ltRydX1eD/04vMifYr5xzl5gEM29vbesmhm6K/AB5FUdCS0WPc6FNHR0d634IOvqMLRyIRMiZd3pxo9e36taIoeRMGIUSUc54sFAoyDmNOcM5n7Xa7BVzJZrPYC2iaFjWMgzvBJ+eBQY7Ag4FU48Li4qL77u7ObcwBkwMgFhL68NyjA+cxCUYiETcYvbS0VPt+cnKCCODts+PyiwYQLiaU0+nEv4pqd6z+s0CVoOc8L0T0L32CI0/szYESAAAAAElFTkSuQmCC";

var Base64Image = /** @class */ (function (_super) {
    __extends(Base64Image, _super);
    function Base64Image(base64, imageName) {
        if (imageName === void 0) { imageName = "tmp" + new Date().valueOf() + ".png"; }
        var _this = _super.call(this, imageName) || this;
        if (_this && _this.open("w")) {
            _this.encoding = "binary";
            _this.write(Base64Image.base64Decode(base64));
            _this.close();
            // this.remove();
        }
        else
            throw new CannotCreateFileError();
        return _this;
    }
    Base64Image.base64Decode = function (s) {
        var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var cache = {
            RE_NON_ALPHA: new RegExp("[^" + ALPHA + "]"),
            // 移除转义号后会不能正常识别。
            // eslint-disable-next-line no-useless-escape
            RE_BAD_EQUALS: /\=([^=]|\=\=)/,
        };
        var n = s.length >>> 0, a = [];
        if ((n % 4) || cache.RE_NON_ALPHA.test(s) || cache.RE_BAD_EQUALS.test(s)) {
            throw Error("Invalid Base64 data");
        }
        var c = 0, i0, i1, i2, i3, b, b0, b1, b2;
        while (c < n) {
            i0 = ALPHA.indexOf(s[c++]);
            i1 = ALPHA.indexOf(s[c++]);
            i2 = ALPHA.indexOf(s[c++]);
            i3 = ALPHA.indexOf(s[c++]);
            b = (i0 << 18) + (i1 << 12) + ((i2 & 63) << 6) + (i3 & 63);
            b0 = (b & (255 << 16)) >> 16;
            b1 = (i2 == 64) ? -1 : (b & (255 << 8)) >> 8;
            b2 = (i3 == 64) ? -1 : (b & 255);
            a[a.length] = String.fromCharCode(b0);
            if (0 <= b1)
                a[a.length] = String.fromCharCode(b1);
            if (0 <= b2)
                a[a.length] = String.fromCharCode(b2);
        }
        // Cleanup and return
        s = a.join("");
        a.length = 0;
        return s;
    };
    Base64Image.settingIcon = function () { return new Base64Image(SETTINGS_ICON, "settings_icon.png"); };
    return Base64Image;
}(TempFile));

var LARGE_NUMBER = 1e4; // 这个大数设置大了会跑不了。
var Portal = /** @class */ (function () {
    //#endregion
    function Portal(window) {
        var _a, _b, _c, _d;
        var _this = this;
        this.selectedTracks = [];
        this.window = window;
        this.group = addControl(this.window, "group", { orientation: "column", alignChildren: "fill", alignment: ["fill", "fill"], spacing: 5 });
        var MidiButtonHeight = 22;
        var FILL_CENTER = ["fill", "center"];
        (_a = addGroup(this.group, "", "button", { text: "...", size: [15, MidiButtonHeight] }), this.selectMidiGroup = _a.group, this.selectMidiLbl = _a.label, this.selectMidiBtn = _a.control);
        this.selectMidiName = addControl(this.selectMidiGroup, "statictext", { alignment: FILL_CENTER });
        (_b = addGroup(this.group, "", "button", {
            text: "",
            alignment: FILL_CENTER,
            maximumSize: [LARGE_NUMBER, MidiButtonHeight],
            enabled: false,
        }), this.selectTrackGroup = _b.group, this.selectTrackLbl = _b.label, this.selectTrackBtn = _b.control);
        (_c = addGroup(this.group, "", "edittext", { text: "120", alignment: FILL_CENTER, enabled: false }), this.selectBpmGroup = _c.group, this.selectBpmLbl = _c.label, this.selectBpmTxt = _c.control);
        (_d = addGroup(this.group, "", "dropdownlist", { alignment: FILL_CENTER }), this.startTimeGroup = _d.group, this.startTimeLbl = _d.label, this.startTimeCombo = _d.control);
        this.tabs = addControl(this.group, "tabbedpanel", { alignment: ["fill", "fill"] });
        this.buttonGroup = addControl(this.group, "group", { orientation: "row", alignment: ["fill", "bottom"] });
        this.applyBtn = addControl(this.buttonGroup, "button", { alignment: "left" });
        var settingIcon = Base64Image.settingIcon();
        this.settingBtn = addControl(this.buttonGroup, "iconbutton", { alignment: ["right", "center"], image: settingIcon }, { style: "toolbutton" });
        settingIcon.remove(); // 把缓存图标删了。
        this.nullObjTab = new NullObjTab(this);
        this.applyEffectsTab = new ApplyEffectsTab(this);
        this.toolsTab = new ToolsTab(this);
        this.translate();
        this.core = new Core(this);
        setNumberEditText(this.selectBpmTxt, NumberType.POSITIVE_DECIMAL, 120);
        this.selectMidiBtn.onClick = function () {
            var _a;
            var file = File.openDialog(localize(uiStr.select_a_midi_file), localize(uiStr.midi_files) + ":*.mid;*.midi," + localize(uiStr.all_files) + ":*.*");
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
                throw new MyError(error);
            }
        };
        this.applyBtn.onClick = function () { return _this.core.apply(); };
        this.settingBtn.onClick = function () {
            var _a;
            new SettingsDialog(_this).showDialog();
            if ((_a = _this.midi) === null || _a === void 0 ? void 0 : _a.isPureQuarter)
                _this.selectTrackBtn.enabled = false;
            _this.translate();
        };
        this.selectTrackBtn.onClick = function () {
            new MidiTrackSelector(_this).showDialog();
        };
        this.tabs.onChange = function () {
            var tab = _this.getSelectedTab();
            if (tab === _this.applyEffectsTab)
                _this.startTimeCombo.selection = Setting.getApplyEffectsStartTime();
            else
                _this.startTimeCombo.selection = Setting.getNullObjectStartTime();
        };
        this.tabs.onChange();
        this.startTimeCombo.onChange = function () {
            var tab = _this.getSelectedTab(), value = _this.startTimeCombo.getSelectedIndex();
            if (tab === _this.applyEffectsTab)
                Setting.setApplyEffectsStartTime(value);
            else
                Setting.setNullObjectStartTime(value);
        };
    }
    Portal.build = function (thisObj, user) {
        $.strict = true;
        var window = thisObj instanceof Panel ? thisObj :
            new Window("palette", user.scriptName + " v" + user.version, undefined, {
                resizeable: true,
            });
        if (window === null)
            throw new CannotFindWindowError();
        var portal = new Portal(window);
        window.onShow = window.onResizing = window.onResize = function () {
            window.layout.resize();
            portal.resizeScrollGroups();
        };
        if (window instanceof Window) {
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
        if (this.tabs.selection === null)
            return null;
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
    Portal.prototype.translate = function () {
        this.applyBtn.text = localize(uiStr.apply);
        this.nullObjTab.translate();
        this.applyEffectsTab.translate();
        this.toolsTab.translate();
        if (!this.midi || !this.selectedTracks.length)
            this.selectMidiName.text = localize(uiStr.no_midi_file_selected);
        this.selectMidiLbl.text = localize(uiStr.select_midi_file);
        this.selectTrackLbl.text = localize(uiStr.select_midi_track);
        this.selectBpmLbl.text = localize(uiStr.set_midi_bpm);
        this.startTimeLbl.text = localize(uiStr.start_time);
        addItems(this.startTimeCombo, localize(uiStr.display_start_time), localize(uiStr.current_time), localize(uiStr.work_area), "0");
    };
    Portal.prototype.resizeScrollGroups = function () {
        var baseTabs = [this.nullObjTab, this.applyEffectsTab];
        for (var _i = 0, baseTabs_1 = baseTabs; _i < baseTabs_1.length; _i++) {
            var tab = baseTabs_1[_i];
            tab.group.onResize();
        }
    };
    return Portal;
}());

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
    Math.sign = function (x) {
        if (x > 0)
            return 1; // TODO: 这部分将会被修改为三元运算符。
        else if (x < 0)
            return -1;
        else
            return 0;
    };
    /* //@ts-ignore
    Object.hasOwn = function <T extends object, K extends string>(obj: T, prop: K): prop is keyof T {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    } */
}

if (BridgeTalk.appName !== "aftereffects")
    throw new NotAfterEffectsError();
else {
    initPrototypes();
    Portal.build(thisObj, User);
}

})(this);
