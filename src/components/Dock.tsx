import React from "react";
import "./Dock.scss";
import "./button.scss";

export default class Dock extends React.Component {
	render() {
		return (
			<footer>
				<button id="apply-btn" className="ripple-button"><i>done</i><span>应用</span></button>
				<button id="settings-btn" className="ripple-button"><i>settings</i></button>
			</footer>
		);
	}
}
