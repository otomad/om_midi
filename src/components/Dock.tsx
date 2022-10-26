import React from "react";
import styles from "./Dock.module.scss";
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
				<button id={styles.applyBtn} className="primary rippleButton focusAlways"><i>done</i><span>应用</span></button>
				<button id={styles.settingsBtn} className="rippleButton focusAlways"><i>settings</i></button>
			</footer>
		);
	}
}
