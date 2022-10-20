import ScrollGroup from "../containers/ScrollGroup";
import addControl from "../modules/addControl";
import Portal from "./Portal";

export const SPACING = 2;
const tabScrollGroupParams: Partial<Group> = {
	spacing: SPACING,
	margins: [7, 5, 0, 0],
};
const tabGroupParams: Partial<Group> = {
	orientation: "column",
	alignment: ["fill", "top"],
	alignChildren: "fill",
	spacing: SPACING,
	margins: [10, 5, 10, 0],
};

export default abstract class BaseTab<G extends ScrollGroup | Group> {
	//#region 组件对象
	readonly parent: Portal;
	readonly tab: Tab;
	readonly group: G;
	//#endregion
	
	constructor(parent: Portal, isScrollGroup: G extends ScrollGroup ? true : false, text?: string, groupParams?: Partial<Group>) {
		this.parent = parent;
		this.tab = addControl(this.parent.tabs, "tab", { text });
		groupParams ??= isScrollGroup ? tabScrollGroupParams : tabGroupParams;
		this.group = (isScrollGroup ?
			new ScrollGroup(this.tab, groupParams) :
			addControl(this.tab, "group", groupParams)) as G;
	}
	
	/**
	 * 获取组内勾选了的复选框。
	 * @returns 勾选了的复选框。
	 */
	getCheckedChecks(): Checkbox[] {
		const checks: Checkbox[] = [];
		for (const check of this.group.children)
			if (check instanceof Checkbox && check.value)
				checks.push(check);
		return checks;
	}
	
	addCheckbox(text?: string): Checkbox {
		const params: Partial<Checkbox> = { text, alignment: ["fill", "fill"] };
		const check = this.group instanceof ScrollGroup ?
			this.group.add("checkbox", params) :
			addControl(this.group, "checkbox", params);
		return check;
	}
	
	abstract translate(): void;
}
