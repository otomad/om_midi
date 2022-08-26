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
