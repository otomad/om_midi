export enum NumberType {
	POSITIVE_INT,
	POSITIVE_DECIMAL,
	DECIMAL,
}

export default function setNumberEditText(editText: EditText, type: NumberType, defaultValue: number | string): void {
	editText.onChange = () => {
		let text = editText.text;
		// TODO: 这部分将会被修改为三元运算符。
		let regex = /\d+/g;
		if (type === NumberType.POSITIVE_DECIMAL) regex = /\d+(\.\d+)?/g;
		else if (type === NumberType.DECIMAL) regex = /-?\d+(\.\d+)?/g;
		const matches = text.match(regex);
		if (matches) {
			text = matches[0].replace(/^0+(?!\.)/g, "");
			text ||= "0";
			const num = type == NumberType.POSITIVE_INT ? parseInt(text, 10) : parseFloat(text);
			text = String((type !== NumberType.DECIMAL && num <= 0 || isNaN(num)) ? defaultValue : num);
		} else text = String(defaultValue);
		editText.text = text;
	};
}
