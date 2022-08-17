type controlTypeKey = "button" | "checkbox" | "dropdownlist" | "edittext" | "flashplayer" | "group" | "iconbutton" | "image" | "listbox" | "panel" | "progressbar" | "radiobutton" | "scrollbar" | "slider" | "statictext" | "tab" | "tabbedpanel" | "treeview";

type containerType = Window | Panel | Group | TabbedPanel;

export default function addControl<C extends _Control>(parent: containerType, type: controlTypeKey, params?: Partial<C>): C {
	const control = parent.add(type) as unknown as C;
	if (params != undefined)
		for (const key in params)
			if (Object.prototype.hasOwnProperty.call(params, key))
				(control as any)[key] = (params as any)[key];
	return control;
}
