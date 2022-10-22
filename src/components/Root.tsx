import React from "react";
import Dock from "./Dock";
import MidiConfigurator from "./MidiConfigurator";

export default class Root extends React.Component {
	render() {
		return (
			<>
				<MidiConfigurator />
				<main />
				<Dock />
			</>
		);
	}
}
