// 此声明文件用于扩展内置对象使其使用更加方便。

type ControlTypeName = keyof ControlTypes;

type ContainerType = Window | Panel | Group | TabbedPanel | Tab;

type ControlTypes = {
	button: Button,
	checkbox: Checkbox,
	dropdownlist: DropDownList,
	edittext: EditText,
	flashplayer: FlashPlayer,
	group: Group,
	iconbutton: IconButton,
	image: Image,
	listbox: ListBox,
	panel: Panel,
	progressbar: Progressbar,
	radiobutton: RadioButton,
	scrollbar: Scrollbar,
	slider: Slider,
	statictext: StaticText,
	tab: Tab,
	tabbedpanel: TabbedPanel,
	treeview: TreeView,
}

type _SpecialPropertiesTypes = {
	dropdownlist: _AddControlPropertiesDropDownList,
	edittext: _AddControlPropertiesEditText,
	iconbutton: _AddControlPropertiesIconButton,
	listbox: _AddControlPropertiesListBox,
	panel: _AddControlPropertiesPanel,
	statictext: _AddControlPropertiesStaticText,
	treeview: _AddControlPropertiesTreeView,
}

type PropertiesTypes = _SpecialPropertiesTypes & {
	[controlTypeName in Exclude<keyof ControlTypes, keyof _SpecialPropertiesTypes>]: _AddControlProperties;
}

type ControlType<C extends ControlTypeName> = ControlTypes[C];
type PropertiesType<C extends ControlTypeName> = PropertiesTypes[C];

type NullableControlType<C extends ControlTypeName | undefined> =
	C extends ControlTypeName ? ControlType<C> :
	C extends undefined ? undefined : never;

type Override<P, S> = Omit<P, keyof S> & S;

type ParamsType<C extends ControlTypeName> = Partial<Override<ControlType<C>, _ControlSetters>>;

interface _AddControl {
	<S extends "scrollbar" | "slider">(
		type: S,
		bounds?: _Bounds,
		value?: number,
		min?: number,
		max?: number,
		properties?: _AddControlProperties,
	): ControlType<S>;
	
	<S extends Exclude<ControlTypeName, "group" | "progressbar" | "scrollbar" | "slider">>(
		type: S,
		bounds?: _Bounds,
		text?: unknown,
		properties?: _AddControlPropertiesStaticText,
	): ControlType<S>;
}
