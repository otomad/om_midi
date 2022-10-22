(function (React, ReactDOM) {
    'use strict';

    class Dock extends React.Component {
        render() {
            return (React.createElement("footer", null,
                React.createElement("button", { id: "apply-btn", className: "ripple-button" },
                    React.createElement("i", null, "done"),
                    React.createElement("span", null, "\u5E94\u7528")),
                React.createElement("button", { id: "settings-btn", className: "ripple-button" },
                    React.createElement("i", null, "settings"))));
        }
    }

    class MidiConfigurator extends React.Component {
        bpmTextRef;
        bpmShadowRef;
        constructor(props = {}) {
            super(props);
            this.state = {
                bpmText: 120,
            };
            this.bpmTextRef = React.createRef();
            this.bpmShadowRef = React.createRef();
        }
        handleChange = (event) => {
            this.setState({
                bpmText: event.target.value,
                // bpmTextWidth: this.bpmShadowRef.current?.getClientRects()[0].width,
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
        render() {
            return (React.createElement("header", null,
                React.createElement("div", { className: "midi-table" },
                    React.createElement("section", { className: "option ripple-button", id: "browse-midi" },
                        React.createElement("label", null,
                            React.createElement("i", null, "file_open"),
                            "MIDI \u6587\u4EF6"),
                        React.createElement("span", { id: "midi-name" }, "\u672A\u9009\u62E9 MIDI \u6587\u4EF6")),
                    React.createElement("section", { className: "option ripple-button" },
                        React.createElement("label", null,
                            React.createElement("i", null, "audiotrack"),
                            "\u9009\u62E9\u8F68\u9053"),
                        React.createElement("span", null)),
                    React.createElement("section", { className: "ripple-button", id: "midi-bpm-section", onClick: () => this.focusBpmText(true) },
                        React.createElement("label", { htmlFor: "midi-bpm-text" },
                            React.createElement("i", null, "speed"),
                            "\u8BBE\u5B9A BPM"),
                        React.createElement("span", { className: "midi-bpm-shadow", ref: this.bpmShadowRef },
                            this.state.bpmText,
                            React.createElement("input", { type: "text", id: "midi-bpm-text", value: this.state.bpmText, onChange: this.handleChange, ref: this.bpmTextRef }))),
                    React.createElement("section", { className: "option ripple-button" },
                        React.createElement("label", null,
                            React.createElement("i", null, "start"),
                            "\u5F00\u59CB\u65F6\u95F4"),
                        React.createElement("span", null, "\u663E\u793A\u5F00\u59CB\u65F6\u95F4")))));
        }
    }

    class Root extends React.Component {
        render() {
            return (React.createElement(React.Fragment, null,
                React.createElement(MidiConfigurator, null),
                React.createElement("main", null),
                React.createElement(Dock, null)));
        }
    }

    function ripple(bindClass = "ripple-button") {
        function findClass(e, listener) {
            const element = e.path.filter(e => "classList" in e ? e.classList.contains(bindClass) : undefined).at(-1);
            if (element instanceof HTMLElement)
                listener(element);
        }
        const CIRCLE_CLASS = "ripple-circle";
        document.addEventListener("mousedown", e => findClass(e, element => {
            const rect = element.getClientRects()[0];
            if (!rect)
                return;
            const circleRadius = getMaxRadius(rect, e);
            let pointerX = e.clientX - rect.x, pointerY = e.clientY - rect.y;
            pointerX -= circleRadius;
            pointerY -= circleRadius;
            const circle = document.createElement("div");
            circle.classList.add(CIRCLE_CLASS);
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
                iterations: 1,
                easing: "cubic-bezier(0, 0, 0, 1)",
            });
        }));
        document.addEventListener("mouseup", () => {
            const FADE_TIME = 250;
            const IS_FADING_CLASS = "is-fading";
            for (const circle of document.getElementsByClassName(CIRCLE_CLASS)) {
                if (circle.classList.contains(IS_FADING_CLASS))
                    return;
                circle.classList.add(IS_FADING_CLASS);
                circle.animate([
                    { opacity: 1 },
                    { opacity: 0 },
                ], {
                    duration: FADE_TIME,
                    iterations: 1,
                    easing: "ease-out",
                });
                setTimeout(circle => {
                    circle.remove();
                }, FADE_TIME, circle);
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

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(Root));
    ripple();

})(React, ReactDOM);
