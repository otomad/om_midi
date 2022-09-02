import English from "./English";
import Japanese from "./Japanese";
import SChinese from "./SChinese";

type LangTag = "zh" | "en" | "ja";

type ZString = {
	[tag in LangTag]: string
};

type Localizes = {
	[keys in keyof typeof SChinese]: ZString
};

const uiStr = {} as Localizes;
for (const _key in SChinese) {
	if (Object.prototype.hasOwnProperty.call(SChinese, _key)) {
		const key = _key as keyof typeof SChinese;
		uiStr[key] = {
			zh: SChinese[key],
			en: English[key],
			ja: Japanese[key],
		};
	}
}


export default uiStr;
