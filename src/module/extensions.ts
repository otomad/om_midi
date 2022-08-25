/**
 * 删除字符串头尾的空白字符。
 * 垃圾 ExtendScript 居然不自带 trim 方法。
 * @param str - 源字符串。
 * @returns 删除头尾空白字符后的字符串。
 */
export function stringTrim(str: string): string {
	return str.replace(/^\s+|\s+$/g, "");
}

/**
 * 检查数组内是否包含某个对象。
 * 垃圾 ExtendScript 居然不自带 contains / includes 方法。
 * @param array - 数组。
 * @param item - 要查找的对象。
 * @returns 是否包含该对象。
 */
export function arrayContains<T>(array: T[], item: T): boolean {
	return arrayIndexOf(array, item) !== -1;
}

/**
 * 检查数组内某个对象的索引值。
 * 如果找不到，返回 -1。
 * 垃圾 ExtendScript 居然不自带 indexOf 方法。
 * @param array - 数组。
 * @param item - 要查找的对象。
 * @returns 该对象的索引值。
 */
export function arrayIndexOf<T>(array: T[], item: T): number {
	for (let i = 0; i < array.length; i++)
		if (array[i] === item)
			return i;
	return -1;
}

/**
 * 返回给定的下拉菜单的选中项序号。<br />
 * 下拉菜单自身的属性 selection 只能返回选中项内容。<br />
 * 如果未选中项，则返回 -1。
 * @param list - 下拉菜单列表。
 * @returns 下拉菜单的选中项序号。
 */
export function getDropDownListSelectedIndex(list: DropDownList): number {
	for (let i = 0; i < list.items.length; i++)
		if (list.items[i].selected)
			return i;
	return -1;
}
