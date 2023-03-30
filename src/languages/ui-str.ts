import English from "./English";
import Japanese from "./Japanese";
import SChinese from "./SChinese";
import Vietnamese from "./Vietnamese";
import Korean from "./Korean";
import hasOwn from "../modules/hasOwn";

type LangTag = "zh" | "en" | "ja" | "vi" | "ko";

export type ZString = {
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
			vi: Vietnamese[key],
			ko: Korean[key],
		};
	}
}

export const DIALOG_SIGN = "...";

export const DYNAMIC_BPM_SIGN = "~";

export default uiStr;
