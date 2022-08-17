(function (thisObj: Panel) {
	const User = {
		scriptName: "testScript",
		version: "3.0.12",
	};

	function buildUI() {
		const res = `Group {
				orientation: 'column',
				text1: StaticText { text: 'Name:' },
				text2: EditText { text: 'John', characters: 30, active: true },
				myButtonGroup: Group {
					alignment: 'right',
					orientation: 'row',
					btn1: Button { text: 'OK', helptip: '第一个按钮！' },
					btn2: Button { text: 'Cancel', helptip: '第二个按钮！' }
				},
			}`;
		const window = thisObj instanceof Panel ? thisObj :
			new Window("palette", User.scriptName + " V" + User.version, undefined, {
				resizeable: true,
			});
		if (window === null) return;
		window.add(res);
		if (window instanceof Window) {
			window.onResizing = window.onResize = () => window.layout.resize();
			window.center();
			window.show();
		} else {
			window.layout.layout(true);
			window.layout.resize();
		}
	}

	buildUI();
})(<Panel><object>this);
