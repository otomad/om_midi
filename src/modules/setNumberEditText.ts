import { normalizeNumber } from "./normalizeNumber";

type NumberType = { min?: number, max?: number, minNeq?: boolean, maxNeq?: boolean, type: "int" | "decimal" };

export default function setNumberEditText(editText: EditText, type: NumberType, defaultValue?: number | string): void {
	editText.onChange = () => {
		let text = editText.text;
		let regex = /\d+/g;
		if (type.type === "decimal") {
			regex = /-?\d+(\.\d+)?/g;
			if (type.min !== undefined && type.min >= 0) regex = /\d+(\.\d+)?/g;
		}
		const matches = text.match(regex);
		if (matches) {
			text = matches[0].replace(/^0+(?!\.)/g, "");
			text ||= "0";
			let num: string | number = type.type === "int" ? parseInt(text, 10) : parseFloat(text);
			if (isNaN(num)) num = defaultValue as number ?? 0;
			if (type.max !== undefined && (type.maxNeq && num === type.max || num > type.max))
				num = defaultValue as number ?? type.max;
			if (type.min !== undefined && (type.minNeq && num === type.min || num < type.min))
				num = defaultValue as number ?? type.min;
			// 谨防写成 type.min && num < type.min。如果 type.min 刚好等于 0 的话会判定为假。
			text = String(num);
			if (text.indexOf("e") !== -1) text = String(defaultValue ?? "");
		} else text = String(defaultValue ?? "");
		editText.text = text;
	};
}
