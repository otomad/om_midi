import React from "react";
import "./MidiConfigurator.scss";
import classNames from "../modules/classNames";

type State = {
	bpmText: string | number;
	// bpmTextWidth?: number;
}

export default class MidiConfigurator extends React.Component<{}, State> {
	bpmTextRef: React.RefObject<HTMLInputElement>;
	bpmShadowRef: React.RefObject<HTMLSpanElement>;
	
	constructor(props = {}) {
		super(props);
		this.state = {
			bpmText: 120,
		};
		this.bpmTextRef = React.createRef<HTMLInputElement>();
		this.bpmShadowRef = React.createRef<HTMLSpanElement>();
	}
	
	handleChange = (event: { target: { value: string; }; }) => {
		this.setState({
			bpmText: event.target.value,
			// bpmTextWidth: this.bpmShadowRef.current?.getClientRects()[0].width,
		});
	};
	
	focusBpmText = (isFocus: boolean = true) => {
		const input = this.bpmTextRef.current;
		if (!input) return;
		else if (isFocus) input.focus();
		else input.blur();
	};
	
	render() {
		return (
			<header>
				<div className="midi-table">
					<section className="option ripple-button" id="browse-midi">
						<label><i>file_open</i>MIDI 文件</label>
						<span id="midi-name">未选择 MIDI 文件</span>
					</section>
					<section className="option ripple-button">
						<label><i>audiotrack</i>选择轨道</label>
						<span></span>
					</section>
					<section className="ripple-button" id="midi-bpm-section" onClick={() => this.focusBpmText(true)}>
						<label htmlFor="midi-bpm-text"><i>speed</i>设定 BPM</label>
						<span className="midi-bpm-shadow" ref={this.bpmShadowRef}>
							{this.state.bpmText}
							<input
								type="text"
								id="midi-bpm-text"
								value={this.state.bpmText}
								onChange={this.handleChange}
								ref={this.bpmTextRef} />
						</span>
					</section>
					<section className="option ripple-button">
						<label><i>start</i>开始时间</label>
						<span>显示开始时间</span>
					</section>
				</div>
			</header>
		);
	}
}
