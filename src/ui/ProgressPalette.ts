import str from "../languages/strings";

export default class ProgressPalette {
	private running = true;
	
	private palette: Window;
	private title1: StaticText;
	private title2: StaticText;
	private progressBar: Progressbar;
	private cancelBtn: Button;
	
	constructor(title1?: string, title2?: string) {
		this.palette = new Window("palette");
		this.palette.orientation = "column";
		this.palette.alignChildren = "left";
		
		this.title1 = this.palette.add("statictext", undefined, title1);
		this.title2 = this.palette.add("statictext", undefined, title2);
		
		this.progressBar = this.palette.add("progressbar");
		this.cancelBtn = this.palette.add("button", undefined, localize(str.cancel));
		this.cancelBtn.alignment = "right";
		this.palette.cancelElement = this.cancelBtn;
	}
	
	isRunning() { return this.running; }
	isCanceled() { return !this.running; }
	setValue(value: number) {
		this.progressBar.value = value * 100;
		// this.palette.update(); // 有这玩意ㄦ吗？
	}
	setTitle1(title1: string) { this.title1.text = title1; }
	setTitle2(title2: string) { this.title2.text = title2; }
	close() { this.palette.close(); }
	show() { this.palette.show(); }
}
