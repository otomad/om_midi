import React from "react";
import "./Dock.scss";
import "../styles/button.scss";
import Root from "./Root";

interface Props {
	parent: Root;
}

export default class Dock extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
		Root.r.dock = this;
	}
	
	render() {
		return (
			<footer>
				<button id="apply-btn" className="primary ripple-button focus-always"><i>done</i><span>应用</span></button>
				<button id="settings-btn" className="ripple-button focus-always"><i>settings</i></button>
			</footer>
		);
	}
}
