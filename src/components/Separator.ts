import { ContainerType } from "../module/addControl";

export default class Separator {
	control: Panel;
	
	constructor(parent: ContainerType) {
		this.control = parent.add("panel");
		this.control.alignment = ["fill", "top"];
	}
}
