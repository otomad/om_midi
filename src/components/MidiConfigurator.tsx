import React, { HTMLProps } from "react";
import styles from "./MidiConfigurator.module.scss";
import classNames from "../modules/classNames";
import CSHelper from "../modules/CSHelper";
import TabBar from "./TabBar";
import { FlyoutMenu, FlyoutMenuItem } from "../containers/FlyoutMenu";
import Root from "./Root";

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
	defaultBpmText: string | number;
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
			bpmText: "",
			defaultBpmText: 120,
			midiName: "未选择 MIDI 文件",
			isStartTimeMenuShown: false,
			startTime: "displayStart",
		};
		this.bpmTextRef = React.createRef<HTMLInputElement>();
	}
	
	handleChange = (event: { target: { value: string; }; }) => {
		const value = event.target.value; // parseFloat(event.target.value);
		this.setState({
			bpmText: value,
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
				<div className={styles.midiTable}>
					<Section className={styles.option} focusable onClick={this.openMidi}>
						<label><i>file_open</i>MIDI 文件</label>
						<span>{this.state.midiName}</span>
					</Section>
					<Section className={styles.option} focusable>
						<label><i>audiotrack</i>选择轨道</label>
						<span></span>
					</Section>
					<Section id={styles.midiBpmSection} onClick={() => this.focusBpmText(true)}>
						<label htmlFor={styles.midiBpmText}><i>speed</i>设定 BPM</label>
						<input
							type="text"
							id={styles.midiBpmText}
							value={this.state.bpmText}
							placeholder={String(this.state.defaultBpmText)}
							onChange={this.handleChange}
							ref={this.bpmTextRef} />
						<span className={styles.midiBpmShadow}>{this.state.bpmText !== "" ? this.state.bpmText : this.state.defaultBpmText}</span>
					</Section>
					<Section className={styles.option} focusable onClick={e => this.onStartTimeClick(true, e)}>
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
		<section {...htmlProps} className={classNames([htmlProps.className, "rippleButton", "buttonLike"])} tabIndex={focusable ? 0 : -1}>
			{props.children}
		</section>
	);
}
