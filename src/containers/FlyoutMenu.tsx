import React from "react";
import MidiConfigurator from "../components/MidiConfigurator";
import classNames from "../modules/classNames";
import getPath from "../modules/getPath";
import { ChildrenProps } from "../modules/props";
import "./FlyoutMenu.scss";

interface MenuProps extends ChildrenProps {
	shown?: boolean;
	parent: MidiConfigurator;
}

export class FlyoutMenu extends React.Component<MenuProps> {
	menuRef;
	
	constructor(props: MenuProps) {
		super(props);
		props.parent.startTimeMenu = this;
		this.menuRef = React.createRef<HTMLElement>();
	}
	
	hideMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!this.menuRef.current || !getPath(e.target).includes(this.menuRef.current))
			this.props.parent.onStartTimeClick(false);
	};
	
	componentDidUpdate() {
		const menu = this.menuRef.current, circle = menu?.parentElement;
		if (!menu || !circle) return;
		if (this.props.shown) {
			const rect = menu.getClientRects()[0];
			const radius = Math.sqrt(rect.width ** 2 + rect.height ** 2);
			const setCircleStyle = (styles: Partial<CSSStyleDeclaration>) => Object.assign(circle.style, styles);
			setCircleStyle({
				width: radius + "px",
				height: radius + "px",
				marginRight: -(radius - rect.width) / 2 + "px",
				marginTop: -(radius - rect.height) / 2 + "px",
			});
		} else circle.removeAttribute("style");
	}
	
	render() {
		return (
			<>
				{this.props.shown ? <div className="menu-mask" onClick={this.hideMenu}></div> : undefined}
				<div className="circle-mask" onClick={this.hideMenu}>
					<menu type="context" ref={this.menuRef} className={classNames({
						flyoutMenu: true,
						hide: !this.props.shown,
					})}>
						{this.props.children}
					</menu>
				</div>
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
			<div className="flyout-menu-item button-like ripple-button" onClick={this.props.onClick}>
				<i className={classNames({
					checkBox: this.props.type !== "normal",
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
