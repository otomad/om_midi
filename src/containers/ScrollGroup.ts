import addControl, { ContainerType, ControlType, ControlTypeName, PropertiesType } from "../modules/addControl";

const SCROLLBAR_WIDTH = 13;

export default class ScrollGroup {
	readonly parent: ContainerType;
	readonly panel: Group;
	readonly content: Group;
	readonly scrollbar: Scrollbar;
	private scrollY: number = 0;
	
	constructor(parent: ContainerType) {
		this.parent = parent;
		this.panel = addControl(parent, "group", { orientation: "row", alignment: ["fill", "fill"] });
		this.content = addControl(this.panel, "group", { orientation: "column", alignment: ["left", "top"], alignChildren: "fill" });
		this.scrollbar = addControl(this.panel, "scrollbar", { alignment: "right" });
		this.scrollbar.onChanging = () => this.onScroll(); // 居然没有 bind。
	}
	
	add<C extends ControlTypeName>(type: C, params?: Partial<ControlType<C>>, properties?: PropertiesType<C>) {
		addControl(this.content, type, params, properties);
	}
	
	onResize() {
		const bounds = this.parent.bounds;
		this.panel.bounds = { ...bounds, x: 0, y: 0 };
		let hideScrollbar = false;
		const heights = this.getViewHeight();
		if (heights.viewHeight >= heights.height) {
			this.scrollY = 0;
			hideScrollbar = true;
		} else if (heights.viewHeight > heights.height + this.scrollY)
			this.scrollY = heights.viewHeight - heights.height;
		this.content.bounds = { x: 0, y: this.scrollY, width: bounds.width - SCROLLBAR_WIDTH * (+!hideScrollbar), height: this.getContentHeight() };
		this.scrollbar.bounds = { x: hideScrollbar ? bounds.width : bounds.width - SCROLLBAR_WIDTH, y: 0, width: SCROLLBAR_WIDTH, height: bounds.height };
		this.scrollbar.value = this.scrollY / (-heights.y) * (this.scrollbar.maxvalue - this.scrollbar.minvalue) + this.scrollbar.minvalue;
	}
	
	getContentHeight() {
		const marginTop = (this.content.margins as [number, number, number, number])[1];
		let height = marginTop;
		for (const control of this.content.children)
			height += getHeight(control) + this.content.spacing;
		return height;
	}
	
	protected onScroll() {
		const { y } = this.getViewHeight();
		if (y <= 0) return;
		this.content.location.y = this.scrollY = -y * (this.scrollbar.value - this.scrollbar.minvalue) / (this.scrollbar.maxvalue - this.scrollbar.minvalue);
	}
	
	private getViewHeight() {
		const height = getHeight(this.content);
		const viewHeight = getHeight(this.panel);
		const y = height - viewHeight;
		return { height, viewHeight, y };
	}
	
	static test() {
		const window = new Window("window", "Scroll Test", undefined, { resizeable: true });
		const group = addControl(window, "group", { alignment: ["fill", "fill"] });
		const scroll = new ScrollGroup(group);
		const num = 20;
		for (let i = 1; i <= num; i++)
			scroll.add("checkbox", { text: `Item ${i}` });
		window.onShow = window.onResizing = window.onResize = () => {
			window.layout.resize();
			scroll.onResize();
		};
		window.center();
		window.show();
	}
}

function getHeight(control: _Control) {
	return (control.size as Dimension).height; // 已知暂时无法解决特性之一，具体详见：https://github.com/microsoft/TypeScript/issues/51229
}
