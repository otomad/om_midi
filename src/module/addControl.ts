type controlTypeKey = "button" | "checkbox" | "dropdownlist" | "edittext" | "flashplayer" | "group" | "iconbutton" | "image" | "listbox" | "panel" | "progressbar" | "radiobutton" | "scrollbar" | "slider" | "statictext" | "tab" | "tabbedpanel" | "treeview";

type containerType = Window | Panel | Group | TabbedPanel;

function addControl(parent: containerType, type: "button", params?: Partial<Button>, properties?: _AddControlProperties): Button;
function addControl(parent: containerType, type: "checkbox", params?: Partial<Checkbox>, properties?: _AddControlProperties): Checkbox;
function addControl(parent: containerType, type: "dropdownlist", params?: Partial<DropDownList>, properties?: _AddControlPropertiesDropDownList): DropDownList;
function addControl(parent: containerType, type: "edittext", params?: Partial<EditText>, properties?: _AddControlPropertiesEditText): EditText;
function addControl(parent: containerType, type: "flashplayer", params?: Partial<FlashPlayer>, properties?: _AddControlProperties): FlashPlayer;
function addControl(parent: containerType, type: "group", params?: Partial<Group>, properties?: _AddControlProperties): Group;
function addControl(parent: containerType, type: "iconbutton", params?: Partial<IconButton>, properties?: _AddControlPropertiesIconButton): IconButton;
function addControl(parent: containerType, type: "image", params?: Partial<Image>, properties?: _AddControlProperties): Image;
function addControl(parent: containerType, type: "listbox", params?: Partial<ListBox>, properties?: _AddControlPropertiesListBox): ListBox;
function addControl(parent: containerType, type: "panel", params?: Partial<Panel>, properties?: _AddControlPropertiesPanel): Panel;
function addControl(parent: containerType, type: "progressbar", params?: Partial<Progressbar>, properties?: _AddControlProperties): Progressbar;
function addControl(parent: containerType, type: "radiobutton", params?: Partial<RadioButton>, properties?: _AddControlProperties): RadioButton;
function addControl(parent: containerType, type: "scrollbar", params?: Partial<Scrollbar>, properties?: _AddControlProperties): Scrollbar;
function addControl(parent: containerType, type: "slider", params?: Partial<Slider>, properties?: _AddControlProperties): Slider;
function addControl(parent: containerType, type: "statictext", params?: Partial<StaticText>, properties?: _AddControlPropertiesStaticText): StaticText;
function addControl(parent: containerType, type: "tab", params?: Partial<Tab>, properties?: _AddControlProperties): Tab;
function addControl(parent: containerType, type: "tabbedpanel", params?: Partial<TabbedPanel>, properties?: _AddControlProperties): TabbedPanel;
function addControl(parent: containerType, type: "treeview", params?: Partial<TreeView>, properties?: _AddControlPropertiesTreeView): TreeView;
function addControl<C extends _Control>(parent: containerType, type: controlTypeKey, params?: Partial<C>, properties?: _AddControlProperties): C {
	const control = parent.add(type as any, undefined, undefined, properties) as unknown as C;
	if (params != undefined)
		for (const key in params)
			if (Object.prototype.hasOwnProperty.call(params, key))
				(control as any)[key] = (params as any)[key];
	return control;
}

export default addControl;
