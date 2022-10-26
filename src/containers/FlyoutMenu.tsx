import React from "react";
import { CSSTransition } from "react-transition-group";
import MidiConfigurator from "../components/MidiConfigurator";
import classNames, { camelToHyphenCase } from "../modules/classNames";
import getPath from "../modules/getPath";
import { ChildrenProps } from "../modules/props";
import styles from "./FlyoutMenu.module.scss";

type CircleStyle = {
	width: string, height: string, marginRight: string, marginTop: string,
}

interface MenuProps extends ChildrenProps {
	shown?: boolean;
	parent: MidiConfigurator;
}

// interface MenuState {
// 	changeState: boolean;
// 	circleStyle?: CircleStyle;
// }

export class FlyoutMenu extends React.Component<MenuProps> {
	menuRef;
	circleRef;
	
	constructor(props: MenuProps) {
		super(props);
		props.parent.startTimeMenu = this;
		this.menuRef = React.createRef<HTMLElement>();
		this.circleRef = React.createRef<HTMLDivElement>();
	}
	
	hideMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!this.menuRef.current || !getPath(e.target).includes(this.menuRef.current))
			this.props.parent.onStartTimeClick(false);
	};
	
	/* componentWillUpdate() {
		if (this.state.changeState) return;
		this.setState({ changeState: true });
	} */
	
	componentDidUpdate() {
		const menu = this.menuRef.current, circle = this.circleRef.current;
		if (!menu || !circle) return;
		// let circleStyle: CircleStyle | undefined;
		if (this.props.shown) {
			const rect = menu.getClientRects()[0];
			const radius = Math.sqrt(rect.width ** 2 + rect.height ** 2);
			setCustomProperties(circle, {
				width: radius + "px",
				height: radius + "px",
				marginRight: -(radius - rect.width) / 2 + "px",
				marginTop: -(radius - rect.height) / 2 + "px",
			});
		}
		// this.setState({ changeState: false, circleStyle });
	}
	
	render() {
		return (
			<>
				{this.props.shown ? <div className={styles.menuMask} onClick={this.hideMenu}></div> : undefined}
				<CSSTransition
					in={this.props.shown}
					timeout={250}
					unmountOnExit={true}
					classNames={{
						enterActive: styles.circleMaskEnter,
						enterDone: styles.circleMaskEnter,
					}}>
					<div className={styles.circleMask} onClick={this.hideMenu} ref={this.circleRef}>
						<menu type="context" ref={this.menuRef} className={classNames({
							[styles.flyoutMenu]: true,
							hide: !this.props.shown,
						})}>
							{this.props.children}
						</menu>
					</div>
				</CSSTransition>
			</>
		);
	}
}

type MenuItemType = "normal" | "checkbox" | "radiobutton";

interface MenuItemProps extends ChildrenProps {
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	type?: MenuItemType;
	isChecked?: boolean;
}

export class FlyoutMenuItem extends React.Component<MenuItemProps> {
	render() {
		return (
			<div className={classNames(styles.flyoutMenuItem, "buttonLike", "rippleButton")} onClick={this.props.onClick}>
				<i className={classNames({
					[styles.checkBox]: this.props.type !== "normal",
				})}>{
						this.props.type === "checkbox" ?
							(this.props.isChecked ? "check_box" : "check_box_outline_blank") :
							(this.props.isChecked ? "radio_button_checked" : "radio_button_unchecked")
					}
				</i>
				{this.props.children}
			</div>
		);
	}
}

function setCustomProperties(element: HTMLElement, styles: object) {
	for (const [property, value] of Object.entries(styles))
		element.style.setProperty("--" + camelToHyphenCase(property), value);
}
