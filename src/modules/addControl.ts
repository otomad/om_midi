/// <reference path="addControl.d.ts" />

import assign from "./assign";

/**
 * 添加控件，并同时添加参数。
 * @param parent - 父容器。
 * @param type - 控件类型。
 * @param params - 控件参数。
 * @param properties - 控件属性。
 * @returns 添加的控件。
 */
export default function addControl<C extends ControlTypeName>(parent: ContainerType, type: C, params?: ParamsType<C>, properties?: PropertiesType<C>): ControlType<C> {
	let _control: _Control;
	if (type == "group")
		_control = parent.add(type, undefined, properties);
	else if (type == "progressbar")
		_control = parent.add(type, undefined, undefined, undefined, properties);
	else if (type == "scrollbar" || type == "slider")
		_control = parent.add(type, undefined, undefined, undefined, undefined, properties);
	else
		_control = parent.add(type, undefined, undefined, properties);
	const control = _control as ControlType<C>;
	if (params != undefined)
		assign(control, params);
	return control;
}

export function addItems(dropDownList: DropDownList, ...items: string[]): DropDownList {
	const selection = dropDownList.items.length ? dropDownList.getSelectedIndex() : 0;
	dropDownList.removeAll();
	for (const item of items)
		dropDownList.add("item", item);
	dropDownList.selection = selection;
	return dropDownList;
}

interface IRegularGroup<C extends ControlTypeName> {
	group: Group,
	label: StaticText,
	control: NullableControlType<C>,
}
export function addGroup<C extends ControlTypeName>(parent: ContainerType, name: string, type?: C, params?: ParamsType<C>, properties?: PropertiesType<C>): IRegularGroup<C> {
	//#region functions
	const addGroup = () => addControl(parent, "group", { orientation: "row", spacing: 7, alignment: "fill", alignChildren: "fill" });
	const setLabelMinWidth = (label: StaticText) => {
		const LABEL_MIN_WIDTH = 60;
		label.minimumSize = [LABEL_MIN_WIDTH, Number.MAX_VALUE];
	};
	const addLabel = (parent: Group, text: string) => {
		const label = addControl(parent, "statictext", { text });
		setLabelMinWidth(label);
		return label;
	};
	//#endregion
	
	const group = addGroup();
	const label = addLabel(group, name);
	let control = undefined;
	
	if (type) control = addControl(group, type, params, properties);
	
	const result: IRegularGroup<C> = { group, label, control: control as NullableControlType<C> };
	return result;
}
