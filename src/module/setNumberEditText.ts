export enum NumberType {
	POSITIVE_INT,
	POSITIVE_DECIMAL,
}

export default function setNumberEditText(editText: EditText, type: NumberType, defaultValue: number): void {
	editText.onChange = () => {
		let text = editText.text;
		const matches = text.match(NumberType.POSITIVE_INT ? /\d+/g : /\d+(\.\d+)?/g);
		if (matches) {
			text = matches[0].replace(/^0+(?!\.)/g, "");
			const num = type == NumberType.POSITIVE_INT ? parseInt(text, 10) : parseFloat(text);
			if (num <= 0 || isNaN(num)) text = String(defaultValue);
		} else text = String(defaultValue);
		editText.text = text;
	};
}
