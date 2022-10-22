import React, { HTMLProps } from "react";
import "./MidiConfigurator.scss";
import classNames from "../modules/classNames";
import CSHelper from "../modules/CSHelper";
import TabBar from "./TabBar";
import { FlyoutMenu, FlyoutMenuItem } from "../containers/FlyoutMenu";
import Root from "./Root";
import getPath from "../modules/getPath";

const startTime = {
	displayStart: "显示开始时间",
	current: "当前时间",
	workArea: "工作区域",
	zero: "0",
};

type StartTimeTag = keyof typeof startTime;

interface Props {
	parent: Root;
}

interface State {
	bpmText: string | number;
	midiName: string;
	isStartTimeMenuShown: boolean;
	startTime: StartTimeTag;
}

export default class MidiConfigurator extends React.Component<Props, State> {
	bpmTextRef;
	
	//#region 组件
	tabBar?: TabBar;
	startTimeMenu?: FlyoutMenu;
	//#endregion
	
	constructor(props: Props) {
		super(props);
		Root.r.midiConfigurator = this;
		this.state = {
			bpmText: 120,
			midiName: "未选择 MIDI 文件",
			isStartTimeMenuShown: false,
			startTime: "displayStart",
		};
		this.bpmTextRef = React.createRef<HTMLInputElement>();
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
	
	openMidi = async () => {
		const midiName = await CSHelper.openMidi();
		if (midiName)
			this.setState({ midiName });
	};
	
	onStartTimeClick = (shown = true, event?: React.MouseEvent<HTMLElement, MouseEvent>) => {
		this.setState({ isStartTimeMenuShown: shown });
	};
	
	setStartTime = (tag: StartTimeTag) => {
		this.setState({ isStartTimeMenuShown: false, startTime: tag });
	};
	
	render() {
		const StartTimeMenuItem = this.StartTimeMenuItem;
		const startTimeMenuItems = (Object.keys(startTime) as StartTimeTag[]).map(tag =>
			<StartTimeMenuItem tag={tag} key={"startTime-" + tag} />);
		return (
			<header>
				<div className="midi-table">
					<Section className="option" id="browse-midi" focusable onClick={this.openMidi}>
						<label><i>file_open</i>MIDI 文件</label>
						<span id="midi-name">{this.state.midiName}</span>
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
						<span className="midi-bpm-shadow">{this.state.bpmText}</span>
					</Section>
					<Section className="option" id="start-time-section" focusable onClick={e => this.onStartTimeClick(true, e)}>
						<label><i>start</i>开始时间</label>
						<span>{startTime[this.state.startTime]}</span>
					</Section>
					<FlyoutMenu shown={this.state.isStartTimeMenuShown} parent={this}>
						{startTimeMenuItems}
					</FlyoutMenu>
				</div>
				<TabBar parent={this} />
			</header>
		);
	}
	
	StartTimeMenuItem = (props: {
		tag: StartTimeTag,
	}) => (
		<FlyoutMenuItem type="radiobutton" isChecked={this.state.startTime === props.tag} onClick={() => this.setStartTime(props.tag)}>
			{startTime[props.tag]}
		</FlyoutMenuItem>
	);
}

function Section(props: HTMLProps<HTMLElement> & {
	focusable?: boolean
}) {
	const { focusable, ...htmlProps } = props;
	return (
		<section {...htmlProps} className={classNames([htmlProps.className, "ripple-button", "button-like"])} tabIndex={focusable ? 0 : -1}>
			{props.children}
		</section>
	);
}

/* function hideMenu(e: MouseEvent) {
	if (e.path.filter(e => e instanceof HTMLElement && e.classList.contains("flyout-menu")).length === 0) {
		Root.r.midiConfigurator?.onStartTimeClick(false);
	}
} */
