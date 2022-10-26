import React, { HTMLProps } from "react";
import classNames from "../modules/classNames";
import MidiConfigurator from "./MidiConfigurator";
import styles from "./TabBar.module.scss";

type TabKey = "nullObj" | "applyEffects" | "tools";

interface Props {
	parent: MidiConfigurator;
}

interface State {
	currentTab: TabKey;
}

export default class TabBar extends React.Component<Props, State> {
	indicatorRef;
	
	constructor(props: Props) {
		super(props);
		props.parent.tabBar = this;
		this.state = {
			currentTab: "nullObj",
		};
		this.indicatorRef = React.createRef<HTMLDivElement>();
	}
	
	setActiveTab = (tab: TabKey) => {
		this.setState({
			currentTab: tab,
		}, () => {
			const indicator = this.indicatorRef.current;
			if (!indicator) return;
			const activeTab = [...(indicator.previousSibling as Element).children].find(tab => tab.classList.contains("active"));
			if (!activeTab) return;
			const left = activeTab.getClientRects()[0].left;
			indicator.style.left = left + "px";
		});
	};
	
	render() {
		const isCurrentTab = (tab: TabKey) => this.state.currentTab === tab ? "active" : "";
		return (
			<>
				<ul className={styles.tabBar}>
					<Li className={isCurrentTab("nullObj")} onClick={() => this.setActiveTab("nullObj")}><i>hourglass_empty</i>空对象</Li>
					<Li className={isCurrentTab("applyEffects")} onClick={() => this.setActiveTab("applyEffects")}><i>blur_on</i>应用效果</Li>
					<Li className={isCurrentTab("tools")} onClick={() => this.setActiveTab("tools")}><i>widgets</i>工具</Li>
				</ul>
				<div className={styles.indicator} ref={this.indicatorRef}></div>
			</>
		);
	}
}

function Li(props: HTMLProps<HTMLLIElement>) {
	return <li {...props} className={classNames([props.className, "rippleButton", "ripple-lighter", "buttonLike"])} tabIndex={0}>{props.children}</li>;
}
