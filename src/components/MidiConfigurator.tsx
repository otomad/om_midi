import React, { HTMLProps } from "react";
import "./MidiConfigurator.scss";
import classNames from "../modules/classNames";

type State = {
	bpmText: string | number;
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
		});
	};
	
	focusBpmText = (isFocus: boolean = true) => {
		const input = this.bpmTextRef.current;
		if (!input) return;
		else if (isFocus) input.focus();
		else input.blur();
	};
	
	render() {
		const Section = (props: HTMLProps<HTMLElement> & {
			focusable?: boolean
		}) => (
			<section className={classNames([props.className, "ripple-button"])} tabIndex={props.focusable ? 0 : -1}>
				{props.children}
			</section>
		);
		
		return (
			<header>
				<div className="midi-table">
					<Section className="option" id="browse-midi" focusable>
						<label><i>file_open</i>MIDI 文件</label>
						<span id="midi-name">未选择 MIDI 文件</span>
					</Section>
					<Section className="option" focusable>
						<label><i>audiotrack</i>选择轨道</label>
						<span></span>
					</Section>
					<Section id="midi-bpm-section" onClick={() => this.focusBpmText(true)}>
						<label htmlFor="midi-bpm-text"><i>speed</i>设定 BPM</label>
						<input
							type="text"
							id="midi-bpm-text"
							value={this.state.bpmText}
							onChange={this.handleChange}
							ref={this.bpmTextRef} />
						<span className="midi-bpm-shadow" ref={this.bpmShadowRef}>{this.state.bpmText}</span>
					</Section>
					<Section className="option" focusable>
						<label><i>start</i>开始时间</label>
						<span>显示开始时间</span>
					</Section>
				</div>
			</header>
		);
	}
}
