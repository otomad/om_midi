type NumberType = { min?: number, max?: number, type: "int" | "decimal" };

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
			if (isNaN(num)) num = defaultValue ?? 0;
			if (type.max !== undefined && num > type.max) num = defaultValue ?? type.max;
			if (type.min !== undefined && num < type.min) num = defaultValue ?? type.min;
			// 谨防写成 type.min && num < type.min。如果 type.min 刚好等于 0 的话会判定为假。
			text = String(num);
		} else text = String(defaultValue);
		editText.text = text;
	};
}
