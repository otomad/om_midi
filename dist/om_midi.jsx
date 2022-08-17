(function (thisObj) {
    var User = {
        scriptName: "testScript",
        version: "3.0.12",
    };
    function buildUI() {
        var res = "Group {\n\t\t\t\torientation: 'column',\n\t\t\t\ttext1: StaticText { text: 'Name:' },\n\t\t\t\ttext2: EditText { text: 'John', characters: 30, active: true },\n\t\t\t\tmyButtonGroup: Group {\n\t\t\t\t\talignment: 'right',\n\t\t\t\t\torientation: 'row',\n\t\t\t\t\tbtn1: Button { text: 'OK', helptip: '\u7B2C\u4E00\u4E2A\u6309\u94AE\uFF01' },\n\t\t\t\t\tbtn2: Button { text: 'Cancel', helptip: '\u7B2C\u4E8C\u4E2A\u6309\u94AE\uFF01' }\n\t\t\t\t},\n\t\t\t}";
        var window = thisObj instanceof Panel ? thisObj :
            new Window("palette", User.scriptName + " V" + User.version, undefined, {
                resizeable: true,
            });
        if (window === null)
            return;
        window.add(res);
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
    buildUI();
})(this);
