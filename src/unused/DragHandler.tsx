import React from "react";
import classNames from "../modules/classNames";
import "./DragHandler.scss";
import Root from "./Root";

interface Props {
	parent: Root;
}

type Visible = "shown" | "changing" | "hidden";

interface State {
	visible: Visible;
}

export default class DragHandler extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		Root.r.dragHandler = this;
		this.state = {
			visible: "hidden",
		};
	}
	
	setVisible = (visible: boolean) => {
		const curVisible = this.state.visible;
		if (curVisible === "changing" || curVisible === "hidden" && !visible || curVisible === "shown" && visible) return;
		this.setState({ visible: "changing" }, () =>
			setTimeout(() => this.setState({ visible: visible ? "shown" : "hidden" }), visible ? 10 : 250));
	};
	
	render() {
		if (this.state.visible === "hidden") return undefined;
		return (
			<div className={classNames({
				dragHandler: true,
				fading: this.state.visible === "changing",
			})}>
				<span>拖动到这里</span>
			</div>
		);
	}
}

document.addEventListener("dragover", function (e) {
	e.preventDefault();
	if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
	document.body.style.cursor = "no-drop";
	Root.r.dragHandler?.setVisible(true);
	console.log("dragover", e);
});

document.addEventListener("dragleave", function (e) {
	e.preventDefault();
	document.body.style.removeProperty("cursor");
	Root.r.dragHandler?.setVisible(false);
	console.log("dragleave", e);
});

document.addEventListener("drop", function (e) {
	e.preventDefault();
	if (e.dataTransfer) console.log(e.dataTransfer.files[0]);
	document.body.style.removeProperty("cursor");
	Root.r.dragHandler?.setVisible(false);
	console.log("drop", e);
});

// HTML 拖放不能获取文件路径。落魄了，家人们。
