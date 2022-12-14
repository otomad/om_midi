/// <reference path="prototypes.d.ts" />

/**
 * 初始化为 ExtendScript 的扩展方法。
 */
export default function initPrototypes(): void {

	String.prototype.trim = function (): string {
		return this.replace(/^\s+|\s+$/g, "");
	};

	Array.prototype.indexOf = function <T>(item: T): number {
		for (let i = 0; i < this.length; i++)
			if (this[i] === item)
				return i;
		return -1;
	};

	Array.prototype.includes = function <T>(item: T): boolean {
		return this.indexOf(item) !== -1;
	};
	
	Array.prototype.forEach = function <T>(callbackfn: (value: T, index: number, array: T[]) => void): void {
		for (let i = 0; i < this.length; i++) {
			const element = this[i];
			callbackfn(element, i, this);
		}
	};

	DropDownList.prototype.getSelectedIndex = function (): number {
		for (let i = 0; i < this.items.length; i++)
			if (this.items[i].selected)
				return i;
		return -1;
	};
	
	Math.sign = function (x: number) {
		if (x > 0) return 1; // TODO: 这部分将会被修改为三元运算符。
		else if (x < 0) return -1;
		else return 0;
	};
	
	/* //@ts-ignore
	Object.hasOwn = function <T extends object, K extends string>(obj: T, prop: K): prop is keyof T {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	} */
}
