import addControl from "../module/addControl";
import Portal from "./Portal";

export const SPACING = 2;
export const tabGroupParams: Partial<Group> = {
	orientation: "column",
	alignment: "left",
	alignChildren: "left",
	spacing: SPACING,
	margins: [10, 5, 10, 0],
};

export default abstract class BaseTab {
	//#region 组件对象
	parent: Portal;
	tab: Tab;
	group: Group;
	//#endregion
	
	constructor(parent: Portal, text: string, groupParams: Partial<Group> = tabGroupParams) {
		this.parent = parent;
		this.tab = addControl(this.parent.tabs, "tab", { text });
		this.group = addControl(this.tab, "group", groupParams);
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
	
	addCheckbox(text: string): Checkbox {
		return addControl(this.group, "checkbox", { text });
	}
}
