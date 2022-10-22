import React from "react";
import Dock from "./Dock";
import MidiConfigurator from "./MidiConfigurator";

export default class Root extends React.Component {
	static r: Root;
	
	//#region 组件
	midiConfigurator?: MidiConfigurator;
	dock?: Dock;
	//#endregion
	
	constructor(props: {}) {
		super(props);
		Root.r = this;
	}
	
	render() {
		return (
			<>
				<MidiConfigurator parent={this} />
				<main />
				<Dock parent={this} />
			</>
		);
	}
}
