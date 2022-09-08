import addControl, { ContainerType, ControlType, ControlTypeName, PropertiesType } from "../modules/addControl";

export default class FlowGroup {
	readonly parent: ContainerType;
	readonly outerGroup: Group;
	readonly columns: number;
	
	constructor(parent: ContainerType, columns: number, alignment: _AlignmentName | [_AlignmentName, _AlignmentName] = "fill") {
		this.parent = parent;
		this.outerGroup = addControl(this.parent, "group", { orientation: "column", alignment, alignChildren: "fill" });
		this.columns = columns;
	}
	
	add<C extends ControlTypeName>(type: C, params?: Partial<ControlType<C>>, properties?: PropertiesType<C>) {
		let rows = this.outerGroup.children as Group[];
		if (rows.length === 0 || rows[rows.length - 1].children.length >= this.columns)
			this.addRow();
		rows = this.outerGroup.children as Group[];
		const lastRow = rows[rows.length - 1];
		return addControl(lastRow, type, params, properties);
	}
	
	private addRow() {
		addControl(this.outerGroup, "group", { orientation: "row", alignment: "fill", alignChildren: "left" });
	}
}
