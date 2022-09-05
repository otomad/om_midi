interface String {
	/**
	 * 删除字符串头尾的空白字符。
	 * @returns 删除头尾空白字符后的字符串。
	 */
	trim(): string;
}

interface Array<T> {
	/**
	 * 检查数组内某个对象的索引值。
	 * 如果找不到，返回 -1。
	 * @param item - 要查找的对象。
	 * @returns 该对象的索引值。
	 */
	indexOf(item: T): number;

	/**
	 * 检查数组内是否包含某个对象。
	 * @param item - 要查找的对象。
	 * @returns 是否包含该对象。
	 */
	includes(item: T): boolean;
}

interface DropDownList {
	/**
	 * 返回给定的下拉菜单的选中项序号。<br />
	 * 下拉菜单自身的属性 selection 只能返回选中项内容。<br />
	 * 如果未选中项，则返回 -1。
	 * @returns 下拉菜单的选中项序号。
	 */
	getSelectedIndex(): number;
}

interface Math {
	/**
	 * 输入一个数字，若为正数则返回 1，若为负数则返回 -1，若为 0 则返回 0。
	 * 注意：对于正负 0 均返回 0。
	 * @param x - 数字。
	 * @returns 数字的正负性。
	 */
	sign(x: number): number;
}

interface Object {
	/**
	 * 检查对象是否包含某一属性参数。
	 * @param obj - 要测试的 JavaScript 对象实例。
	 * @param prop - 要测试的属性的字符串名称。
	 * @returns 指定的对象已直接定义了指定的属性？
	 */
	//@ts-ignore
	hasOwn<T extends object, K extends string>(obj: T, prop: K): prop is keyof T;
}
