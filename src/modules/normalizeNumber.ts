/**
 * 标准化数字。拒绝傻逼科学计数法。
 * @param num - 数字。
 * @returns 标准化的数字。
 */
export function normalizeNumber(num: number | bigint | string) {
	let s = String(num);
	const regexp = (num: string) => num.trim().toLowerCase().replace(/\+/g, "").replace(/(?<=e|-|^)0*|(?<=\.[^e]*)0*(?=e|$)/g, "").replace(/(?<=-|^)\./, "0.").replace(/\.(?=e|$)/g, "");
	s = regexp(s);
	if (s.indexOf("e") !== -1) {
		let [base, exp_str] = s.split("e");
		const exp = +exp_str;
		const move = (float_: string, direct: number) => {
			float_ += "";
			let dot = float_.indexOf(".");
			if (dot === -1) dot = float_.length;
			dot = (direct > 0 ? dot + 1 : dot - 1);
			float_ = float_.replace(".", "");
			if (dot === float_.length) void 0;
			else if (dot > float_.length) float_ += "0";
			else if (dot === 0) float_ = "0." + float_;
			else float_ = float_.slice(0, dot) + "." + float_.slice(dot);
			return float_;
		};
		for (let i = 0; i < Math.abs(exp); i++) base = move(base, exp);
		s = regexp(base);
	}
	if (s === "-" || s === "") s = "0";
	return s;
}
