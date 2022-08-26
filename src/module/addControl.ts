//#region 类型
type ControlTypeName = "button" | "checkbox" | "dropdownlist" | "edittext" | "flashplayer" | "group" | "iconbutton" | "image" | "listbox" | "panel" | "progressbar" | "radiobutton" | "scrollbar" | "slider" | "statictext" | "tab" | "tabbedpanel" | "treeview";

export type ContainerType = Window | Panel | Group | TabbedPanel | Tab;

type ControlType<C extends ControlTypeName> =
	C extends "button" ? Button :
	C extends "checkbox" ? Checkbox :
	C extends "dropdownlist" ? DropDownList :
	C extends "edittext" ? EditText :
	C extends "flashplayer" ? FlashPlayer :
	C extends "group" ? Group :
	C extends "iconbutton" ? IconButton :
	C extends "image" ? Image :
	C extends "listbox" ? ListBox :
	C extends "panel" ? Panel :
	C extends "progressbar" ? Progressbar :
	C extends "radiobutton" ? RadioButton :
	C extends "scrollbar" ? Scrollbar :
	C extends "slider" ? Slider :
	C extends "statictext" ? StaticText :
	C extends "tab" ? Tab :
	C extends "tabbedpanel" ? TabbedPanel :
	C extends "treeview" ? TreeView : never;
	
type PropertiesType<C extends ControlTypeName> =
	C extends "dropdownlist" ? _AddControlPropertiesDropDownList :
	C extends "edittext" ? _AddControlPropertiesEditText :
	C extends "iconbutton" ? _AddControlPropertiesIconButton :
	C extends "listbox" ? _AddControlPropertiesListBox :
	C extends "panel" ? _AddControlPropertiesPanel :
	C extends "statictext" ? _AddControlPropertiesStaticText :
	C extends "treeview" ? _AddControlPropertiesTreeView : _AddControlProperties;
	
type NullableControlType<C extends ControlTypeName | undefined> =
	C extends ControlTypeName ? ControlType<C> :
	C extends undefined ? undefined : never;
//#endregion

/**
 * 添加控件，并同时添加参数。
 * @param parent - 父容器。
 * @param type - 控件类型。
 * @param params - 控件参数。
 * @param properties - 控件属性。
 * @returns 添加的控件。
 */
export default function addControl<C extends ControlTypeName>(parent: ContainerType, type: C, params?: Partial<ControlType<C>>, properties?: PropertiesType<C>): ControlType<C> {
	let _control: _Control;
	if (type == "group")
		_control = parent.add(type, undefined, properties);
	else if (type == "progressbar")
		_control = parent.add(type, undefined, undefined, undefined, properties);
	else if (type == "scrollbar" || type == "slider")
		_control = parent.add(type as any, undefined, undefined, undefined, undefined, properties);
		// 技术难点待解决，联合类型无法被收敛到此重载函数。暂时无解用 any 临时解决。
	else
		_control = parent.add(type as any, undefined, undefined, properties);
		// 技术难点待解决，未知原因，疑同上。
	const control = _control as ControlType<C>;
	if (params != undefined)
		for (const key in params)
			if (Object.prototype.hasOwnProperty.call(params, key))
				(control as any)[key] = (params as any)[key];
	return control;
}

export function addItems(dropDownList: DropDownList, ...items: string[]): DropDownList {
	for (const item of items)
		dropDownList.add("item", item);
	dropDownList.selection = 0;
	return dropDownList;
}

interface IRegularGroup<C extends ControlTypeName> {
	group: Group,
	label: StaticText,
	control: NullableControlType<C>,
}
export function addGroup<C extends ControlTypeName>(parent: ContainerType, name: string, type?: C, params?: Partial<ControlType<C>>, properties?: PropertiesType<C>): IRegularGroup<C> {
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
