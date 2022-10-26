(function (React, CSInterface, reactTransitionGroup, ReactDOM) {
	'use strict';

	var styles$3 = {"applyBtn":"Dock-module_applyBtn__TLJRT","settingsBtn":"Dock-module_settingsBtn__k4dDb"};

	class Dock extends React.Component {
	    constructor(props) {
	        super(props);
	        Root.r.dock = this;
	    }
	    render() {
	        return (React.createElement("footer", null,
	            React.createElement("button", { id: styles$3.applyBtn, className: "primary rippleButton focusAlways" },
	                React.createElement("i", null, "done"),
	                React.createElement("span", null, "\u5E94\u7528")),
	            React.createElement("button", { id: styles$3.settingsBtn, className: "rippleButton focusAlways" },
	                React.createElement("i", null, "settings"))));
	    }
	}

	var styles$2 = {"midiTable":"MidiConfigurator-module_midiTable__sbkTJ","midiBpmShadow":"MidiConfigurator-module_midiBpmShadow__OwsQ8","midiBpmText":"MidiConfigurator-module_midiBpmText__HYCKM","midiBpmSection":"MidiConfigurator-module_midiBpmSection__2Zp-N","option":"MidiConfigurator-module_option__sCodc"};

	/*!
	 * Copyright (c) 2017 Jed Watson.
	 * Licensed under the MIT License (MIT), see
	 * http://jedwatson.github.io/classnames
	 */
	const camelToHyphenCase = (str) => str.replace(/([A-Z])/g, "-$1").toLowerCase();
	function classNames(...args) {
	    const classes = [], push = (name) => classes.push(classNames.toHyphenCase ? camelToHyphenCase(name) : name);
	    for (const arg of args) {
	        if (!arg)
	            continue;
	        if (typeof arg === "string" || typeof arg === "number")
	            push(String(arg));
	        else if (Array.isArray(arg) && arg.length) {
	            const inner = classNames(...arg);
	            if (inner)
	                push(inner);
	        }
	        else if (typeof arg === "object")
	            for (const [key, value] of Object.entries(arg))
	                if (value)
	                    push(key);
	    }
	    return classes.join(" ");
	}
	classNames.toHyphenCase = false;

	const cs = new CSInterface();
	const available = isRunningInAdobeCep();
	const CSHelper = {
	    async openMidi() {
	        const result = await new Promise((resolve, reject) => {
	            cs.evalScript("$.om_midi.openFile()", resolve);
	        });
	        if (!result || result === "undefined")
	            return;
	        return result;
	    },
	    updateThemeColor() {
	        if (!available)
	            return;
	        const skinInfo = cs.getHostEnvironment().appSkinInfo;
	        const backgroundColor = skinInfo.panelBackgroundColorSRGB.color;
	        const accentColor = skinInfo.systemHighlightColor;
	        const foregroundColor = getForegroundColor(backgroundColor);
	        const borderColor = getBorderColor(backgroundColor);
	        setRootCss("--background-color", backgroundColor);
	        setRootCss("--foreground-color", foregroundColor);
	        setRootCss("--border-color", borderColor);
	        setRootCss("--accent-color", accentColor);
	    },
	};
	if (available)
	    cs.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, CSHelper.updateThemeColor);
	else
	    setRootCss("--background-color", "#232323");
	function getForegroundColor(backgroundColor) {
	    return getSpecifiedColor(backgroundColor, color => 1.2 * color + 96);
	}
	function getBorderColor(backgroundColor) {
	    return getSpecifiedColor(backgroundColor, color => 1.16 * color + 5.4);
	}
	function getSpecifiedColor(originalColor, formula) {
	    return {
	        red: formula(originalColor.red),
	        green: formula(originalColor.green),
	        blue: formula(originalColor.blue),
	        alpha: originalColor.alpha,
	    };
	}
	function setRootCss(property, value) {
	    if (typeof value === "object")
	        value = `rgba(${value.red}, ${value.green}, ${value.blue}, ${value.alpha})`;
	    document.documentElement.style.setProperty(property, String(value));
	}
	/**
	 * 检测当前是在 Adobe 扩展中运行，还是在浏览器中运行。
	 * @returns 在 Adobe 扩展中运行。
	 */
	function isRunningInAdobeCep() {
	    try {
	        cs.getHostEnvironment();
	    }
	    catch (error) {
	        return false;
	    }
	    return true;
	}
	var CSHelper$1 = CSHelper;

	var styles$1 = {"tabBar":"TabBar-module_tabBar__o4svY","active":"TabBar-module_active__G53lI","indicator":"TabBar-module_indicator__K8OJf"};

	class TabBar extends React.Component {
	    indicatorRef;
	    constructor(props) {
	        super(props);
	        props.parent.tabBar = this;
	        this.state = {
	            currentTab: "nullObj",
	        };
	        this.indicatorRef = React.createRef();
	    }
	    setActiveTab = (tab) => {
	        this.setState({
	            currentTab: tab,
	        }, () => {
	            const indicator = this.indicatorRef.current;
	            if (!indicator)
	                return;
	            const activeTab = [...indicator.previousSibling.children].find(tab => tab.classList.contains("active"));
	            if (!activeTab)
	                return;
	            const left = activeTab.getClientRects()[0].left;
	            indicator.style.left = left + "px";
	        });
	    };
	    render() {
	        const isCurrentTab = (tab) => this.state.currentTab === tab ? "active" : "";
	        return (React.createElement(React.Fragment, null,
	            React.createElement("ul", { className: styles$1.tabBar },
	                React.createElement(Li, { className: isCurrentTab("nullObj"), onClick: () => this.setActiveTab("nullObj") },
	                    React.createElement("i", null, "hourglass_empty"),
	                    "\u7A7A\u5BF9\u8C61"),
	                React.createElement(Li, { className: isCurrentTab("applyEffects"), onClick: () => this.setActiveTab("applyEffects") },
	                    React.createElement("i", null, "blur_on"),
	                    "\u5E94\u7528\u6548\u679C"),
	                React.createElement(Li, { className: isCurrentTab("tools"), onClick: () => this.setActiveTab("tools") },
	                    React.createElement("i", null, "widgets"),
	                    "\u5DE5\u5177")),
	            React.createElement("div", { className: styles$1.indicator, ref: this.indicatorRef })));
	    }
	}
	function Li(props) {
	    return React.createElement("li", { ...props, className: classNames([props.className, "rippleButton", "ripple-lighter", "buttonLike"]), tabIndex: 0 }, props.children);
	}

	function getPath(target) {
	    if (!(target instanceof Element))
	        return [];
	    const path = [];
	    while (target instanceof Element) {
	        path.push(target);
	        target = target.parentElement;
	    }
	    return path;
	}

	var styles = {"flyoutMenu":"FlyoutMenu-module_flyoutMenu__6EQaK","flyoutMenuItem":"FlyoutMenu-module_flyoutMenuItem__SHTsq","checkBox":"FlyoutMenu-module_checkBox__4w01A","hide":"FlyoutMenu-module_hide__YKfNO","menuMask":"FlyoutMenu-module_menuMask__y3QOm","circleMask":"FlyoutMenu-module_circleMask__Y1FR9","circleMaskEnter":"FlyoutMenu-module_circleMaskEnter__LJhFK"};

	// interface MenuState {
	// 	changeState: boolean;
	// 	circleStyle?: CircleStyle;
	// }
	class FlyoutMenu extends React.Component {
	    menuRef;
	    circleRef;
	    constructor(props) {
	        super(props);
	        props.parent.startTimeMenu = this;
	        this.menuRef = React.createRef();
	        this.circleRef = React.createRef();
	    }
	    hideMenu = (e) => {
	        if (!this.menuRef.current || !getPath(e.target).includes(this.menuRef.current))
	            this.props.parent.onStartTimeClick(false);
	    };
	    /* componentWillUpdate() {
	        if (this.state.changeState) return;
	        this.setState({ changeState: true });
	    } */
	    componentDidUpdate() {
	        const menu = this.menuRef.current, circle = this.circleRef.current;
	        if (!menu || !circle)
	            return;
	        // let circleStyle: CircleStyle | undefined;
	        if (this.props.shown) {
	            const rect = menu.getClientRects()[0];
	            const radius = Math.sqrt(rect.width ** 2 + rect.height ** 2);
	            setCustomProperties(circle, {
	                width: radius + "px",
	                height: radius + "px",
	                marginRight: -(radius - rect.width) / 2 + "px",
	                marginTop: -(radius - rect.height) / 2 + "px",
	            });
	        }
	        // this.setState({ changeState: false, circleStyle });
	    }
	    render() {
	        return (React.createElement(React.Fragment, null,
	            this.props.shown ? React.createElement("div", { className: styles.menuMask, onClick: this.hideMenu }) : undefined,
	            React.createElement(reactTransitionGroup.CSSTransition, { in: this.props.shown, timeout: 250, unmountOnExit: true, classNames: {
	                    enterActive: styles.circleMaskEnter,
	                    enterDone: styles.circleMaskEnter,
	                } },
	                React.createElement("div", { className: styles.circleMask, onClick: this.hideMenu, ref: this.circleRef },
	                    React.createElement("menu", { type: "context", ref: this.menuRef, className: classNames({
	                            [styles.flyoutMenu]: true,
	                            hide: !this.props.shown,
	                        }) }, this.props.children)))));
	    }
	}
	class FlyoutMenuItem extends React.Component {
	    render() {
	        return (React.createElement("div", { className: classNames(styles.flyoutMenuItem, "buttonLike", "rippleButton"), onClick: this.props.onClick },
	            React.createElement("i", { className: classNames({
	                    [styles.checkBox]: this.props.type !== "normal",
	                }) }, this.props.type === "checkbox" ?
	                (this.props.isChecked ? "check_box" : "check_box_outline_blank") :
	                (this.props.isChecked ? "radio_button_checked" : "radio_button_unchecked")),
	            this.props.children));
	    }
	}
	function setCustomProperties(element, styles) {
	    for (const [property, value] of Object.entries(styles))
	        element.style.setProperty("--" + camelToHyphenCase(property), value);
	}

	const startTime = {
	    displayStart: "显示开始时间",
	    current: "当前时间",
	    workArea: "工作区域",
	    zero: "0",
	};
	class MidiConfigurator extends React.Component {
	    bpmTextRef;
	    //#region 组件
	    tabBar;
	    startTimeMenu;
	    //#endregion
	    constructor(props) {
	        super(props);
	        Root.r.midiConfigurator = this;
	        this.state = {
	            bpmText: "",
	            defaultBpmText: 120,
	            midiName: "未选择 MIDI 文件",
	            isStartTimeMenuShown: false,
	            startTime: "displayStart",
	        };
	        this.bpmTextRef = React.createRef();
	    }
	    handleChange = (event) => {
	        const value = event.target.value; // parseFloat(event.target.value);
	        this.setState({
	            bpmText: value,
	        });
	    };
	    focusBpmText = (isFocus = true) => {
	        const input = this.bpmTextRef.current;
	        if (!input)
	            return;
	        else if (isFocus)
	            input.focus();
	        else
	            input.blur();
	    };
	    openMidi = async () => {
	        const midiName = await CSHelper$1.openMidi();
	        if (midiName)
	            this.setState({ midiName });
	    };
	    onStartTimeClick = (shown = true, event) => {
	        this.setState({ isStartTimeMenuShown: shown });
	    };
	    setStartTime = (tag) => {
	        this.setState({ isStartTimeMenuShown: false, startTime: tag });
	    };
	    render() {
	        const StartTimeMenuItem = this.StartTimeMenuItem;
	        const startTimeMenuItems = Object.keys(startTime).map(tag => React.createElement(StartTimeMenuItem, { tag: tag, key: "startTime-" + tag }));
	        return (React.createElement("header", null,
	            React.createElement("div", { className: styles$2.midiTable },
	                React.createElement(Section, { className: styles$2.option, focusable: true, onClick: this.openMidi },
	                    React.createElement("label", null,
	                        React.createElement("i", null, "file_open"),
	                        "MIDI \u6587\u4EF6"),
	                    React.createElement("span", null, this.state.midiName)),
	                React.createElement(Section, { className: styles$2.option, focusable: true },
	                    React.createElement("label", null,
	                        React.createElement("i", null, "audiotrack"),
	                        "\u9009\u62E9\u8F68\u9053"),
	                    React.createElement("span", null)),
	                React.createElement(Section, { id: styles$2.midiBpmSection, onClick: () => this.focusBpmText(true) },
	                    React.createElement("label", { htmlFor: styles$2.midiBpmText },
	                        React.createElement("i", null, "speed"),
	                        "\u8BBE\u5B9A BPM"),
	                    React.createElement("input", { type: "text", id: styles$2.midiBpmText, value: this.state.bpmText, placeholder: String(this.state.defaultBpmText), onChange: this.handleChange, ref: this.bpmTextRef }),
	                    React.createElement("span", { className: styles$2.midiBpmShadow }, this.state.bpmText !== "" ? this.state.bpmText : this.state.defaultBpmText)),
	                React.createElement(Section, { className: styles$2.option, focusable: true, onClick: e => this.onStartTimeClick(true, e) },
	                    React.createElement("label", null,
	                        React.createElement("i", null, "start"),
	                        "\u5F00\u59CB\u65F6\u95F4"),
	                    React.createElement("span", null, startTime[this.state.startTime])),
	                React.createElement(FlyoutMenu, { shown: this.state.isStartTimeMenuShown, parent: this }, startTimeMenuItems)),
	            React.createElement(TabBar, { parent: this })));
	    }
	    StartTimeMenuItem = (props) => (React.createElement(FlyoutMenuItem, { type: "radiobutton", isChecked: this.state.startTime === props.tag, onClick: () => this.setStartTime(props.tag) }, startTime[props.tag]));
	}
	function Section(props) {
	    const { focusable, ...htmlProps } = props;
	    return (React.createElement("section", { ...htmlProps, className: classNames([htmlProps.className, "rippleButton", "buttonLike"]), tabIndex: focusable ? 0 : -1 }, props.children));
	}

	class Root extends React.Component {
	    static r;
	    //#region 组件
	    midiConfigurator;
	    dock;
	    //#endregion
	    constructor(props) {
	        super(props);
	        Root.r = this;
	    }
	    render() {
	        return (React.createElement(React.Fragment, null,
	            React.createElement(MidiConfigurator, { parent: this }),
	            React.createElement("main", null),
	            React.createElement(Dock, { parent: this })));
	    }
	}

	function findLast(array, predicate) {
	    const results = array.filter(predicate);
	    return results[results.length - 1];
	}
	function ripple() {
	    const bindClass = "rippleButton";
	    const circleClass = "rippleCircle";
	    function findClass(e, listener) {
	        const element = findLast(e.path, e => "classList" in e ? e.classList.contains(bindClass) : false);
	        if (element instanceof HTMLElement)
	            listener(element);
	    }
	    document.addEventListener("mousedown", e => findClass(e, element => {
	        const rect = element.getClientRects()[0];
	        if (!rect)
	            return;
	        const circleRadius = getMaxRadius(rect, e) + 1; // + 1 用于边缘问题。
	        let pointerX = e.clientX - rect.x, pointerY = e.clientY - rect.y;
	        pointerX -= circleRadius;
	        pointerY -= circleRadius;
	        const circle = document.createElement("div");
	        circle.classList.add(circleClass);
	        circle.style.width = circleRadius * 2 + "px";
	        circle.style.height = circleRadius * 2 + "px";
	        circle.style.left = pointerX + "px";
	        circle.style.top = pointerY + "px";
	        element.prepend(circle);
	        circle.animate([
	            { transform: "scale(0)" },
	            { transform: "scale(1)" },
	        ], {
	            duration: 1000,
	            easing: "cubic-bezier(0, 0, 0, 1)",
	        });
	    }));
	    document.addEventListener("mouseup", () => {
	        const FADE_TIME = 250;
	        const IS_FADING_CLASS = "is-fading";
	        for (const circle of document.getElementsByClassName(circleClass)) {
	            if (circle.classList.contains(IS_FADING_CLASS))
	                return;
	            circle.classList.add(IS_FADING_CLASS);
	            circle.animate([
	                { opacity: 1 },
	                { opacity: 0 },
	            ], {
	                duration: FADE_TIME,
	                easing: "ease-out",
	            }).finished.then(() => circle.remove());
	        }
	    });
	}
	class Point {
	    x;
	    y;
	    constructor(x, y) {
	        this.x = x;
	        this.y = y;
	    }
	    distance(point) {
	        return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
	    }
	}
	function getMaxRadius(rect, e) {
	    const pointer = new Point(e.clientX, e.clientY);
	    const leftTop = new Point(rect.left, rect.top);
	    const rightTop = new Point(rect.right, rect.top);
	    const rightBottom = new Point(rect.right, rect.bottom);
	    const leftBottom = new Point(rect.left, rect.bottom);
	    return Math.max(pointer.distance(leftTop), pointer.distance(rightTop), pointer.distance(rightBottom), pointer.distance(leftBottom));
	}

	CSHelper$1.updateThemeColor();
	const rootDom = document.getElementById("root");
	const root = ReactDOM.createRoot(rootDom);
	root.render(React.createElement(Root));
	ripple();
	document.oncontextmenu = e => e.preventDefault();

})(React, CSInterface, ReactTransitionGroup, ReactDOM);
