import { ContainerType } from "../modules/addControl";

export default class Separator {
	control: Panel;
	
	constructor(parent: ContainerType, orientation: "vertical" | "horizontal") {
		this.control = parent.add("panel");
		this.control.alignment = orientation === "horizontal" ? ["fill", "top"] : ["center", "fill"];
	}
}
