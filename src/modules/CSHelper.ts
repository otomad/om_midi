import CSInterface from "csinterface-ts";

const cs = new CSInterface();
const available = isRunningInAdobeCep();

const CSHelper = {
	async openMidi() {
		const result = await new Promise((resolve: (v: string) => void, reject) => {
			cs.evalScript("$.om_midi.openFile()", resolve);
		});
		if (!result || result === "undefined") return;
		return result;
	},
	
	updateThemeColor() {
		if (!available) return;
		
		const skinInfo = cs.getHostEnvironment().appSkinInfo;
		const backgroundColor = skinInfo.panelBackgroundColorSRGB.color as Color;
		const accentColor = skinInfo.systemHighlightColor as Color;
		const foregroundColor = getForegroundColor(backgroundColor);
		const borderColor = getBorderColor(backgroundColor);
		
		setRootCss("--background-color", backgroundColor);
		setRootCss("--foreground-color", foregroundColor);
		setRootCss("--border-color", borderColor);
		setRootCss("--accent-color", accentColor);
	},
};

if (available)
	cs.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, CSHelper.updateThemeColor);
else
	setRootCss("--background-color", "#232323");

type Color = {
	red: number,
	green: number,
	blue: number,
	alpha: number,
}

function getForegroundColor(backgroundColor: Color): Color {
	return getSpecifiedColor(backgroundColor, color => 1.2 * color + 96);
}

function getBorderColor(backgroundColor: Color): Color {
	return getSpecifiedColor(backgroundColor, color => 1.16 * color + 5.4);
}

function getSpecifiedColor(originalColor: Color, formula: (color: number) => number) {
	return {
		red: formula(originalColor.red),
		green: formula(originalColor.green),
		blue: formula(originalColor.blue),
		alpha: originalColor.alpha,
	};
}

function setRootCss(property: string, value: string | number | Color) {
	if (typeof value === "object")
		value = `rgba(${value.red}, ${value.green}, ${value.blue}, ${value.alpha})`;
	document.documentElement.style.setProperty(property, String(value));
}

/**
 * 检测当前是在 Adobe 扩展中运行，还是在浏览器中运行。
 * @returns 在 Adobe 扩展中运行。
 */
function isRunningInAdobeCep() {
	try {
		cs.getHostEnvironment();
	} catch (error) {
		return false;
	}
	return true;
}

export default CSHelper;
