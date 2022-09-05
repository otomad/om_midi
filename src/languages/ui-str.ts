import English from "./English";
import Japanese from "./Japanese";
import SChinese from "./SChinese";
import hasOwn from "../module/hasOwn";

type LangTag = "zh" | "en" | "ja";

type ZString = {
	[tag in LangTag]: string
};

type Localizes = {
	[keys in keyof typeof SChinese]: ZString
};

const uiStr = {} as Localizes;
for (const key in SChinese) {
	if (hasOwn(SChinese, key)) {
		uiStr[key] = {
			zh: SChinese[key],
			en: English[key],
			ja: Japanese[key],
		};
	}
}

export const DIALOG_SIGN = "...";

export default uiStr;
