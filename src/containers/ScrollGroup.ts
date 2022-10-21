import addControl from "../modules/addControl";

const SCROLLBAR_WIDTH = 13;

export default class ScrollGroup {
	readonly parent: ContainerType;
	readonly panel: Group;
	readonly content: Group;
	readonly scrollbar: Scrollbar;
	private scrollY: number = 0;
	readonly children: _Control[];
	private readonly margins;
	
	constructor(parent: ContainerType, contentParams: Partial<Group> = {}) {
		this.parent = parent;
		this.panel = addControl(parent, "group", { orientation: "stack", alignment: ["fill", "fill"], spacing: 0 });
		this.content = addControl(this.panel, "group", { orientation: "column", alignment: ["fill", "top"], alignChildren: "fill", ...contentParams });
		this.children = this.content.children;
		({ margins: this.margins } = contentParams);
		this.scrollbar = addControl(this.panel, "scrollbar", { alignment: "right" });
		this.scrollbar.onChanging = () => this.onScroll(); // 居然没有 bind。
	}
	
	add<C extends ControlTypeName>(type: C, params?: ParamsType<C>, properties?: PropertiesType<C>) {
		return addControl(this.content, type, params, properties);
	}
	
	onResize() {
		const [paddingLeft, paddingTop] = this.getContentPadding();
		const bounds = this.parent.bounds;
		this.panel.bounds = { ...bounds, x: 0, y: 0 };
		let hideScrollbar = false;
		const heights = this.getViewHeight();
		if (heights.viewHeight >= heights.height) {
			this.scrollY = paddingTop;
			hideScrollbar = true;
		} else if (heights.viewHeight > heights.height + this.scrollY)
			this.scrollY = heights.viewHeight - heights.height;
		this.content.alignment = ["left", "top"];
		this.content.bounds = { x: paddingLeft, y: this.scrollY, width: bounds.width - SCROLLBAR_WIDTH * (+!hideScrollbar) - paddingLeft, height: this.getContentHeight() };
		this.scrollbar.bounds = { x: hideScrollbar ? bounds.width : bounds.width - SCROLLBAR_WIDTH, y: 0, width: SCROLLBAR_WIDTH, height: bounds.height };
		this.scrollbar.value = (this.scrollY - paddingTop) / (-heights.y) * (this.scrollbar.maxvalue - this.scrollbar.minvalue) + this.scrollbar.minvalue;
	}
	
	getContentHeight() {
		const marginTop = (this.content.margins as [number, number, number, number])[1];
		let height = marginTop;
		for (const control of this.content.children)
			height += control.size.height + this.content.spacing;
		return height;
	}
	
	protected onScroll() {
		const { y } = this.getViewHeight();
		if (y <= 0) return;
		const paddingTop = this.getContentPadding()[1];
		const scrollPercent = (this.scrollbar.value - this.scrollbar.minvalue) / (this.scrollbar.maxvalue - this.scrollbar.minvalue);
		this.content.location.y = this.scrollY = -y * scrollPercent + paddingTop;
	}
	
	private getViewHeight() {
		const height = this.content.size.height;
		const viewHeight = this.panel.size.height;
		const y = height - viewHeight;
		return { height, viewHeight, y };
	}
	
	/** @deprecated */
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
	
	private getContentPadding(): [number, number] {
		if (this.margins instanceof Array)
			return [this.margins[0], this.margins[1]];
		else if (typeof this.margins === "number")
			return [this.margins, this.margins];
		else return [0, 0];
	}
}
