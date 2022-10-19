// 兼容版 Object.assign。

import hasOwn from "./hasOwn";

/**
 * `Object.assign()` 方法将所有可枚举（`Object.propertyIsEnumerable()` 返回 true）的自有（`Object.hasOwnProperty()`
 * 返回 true）属性从一个或多个源对象复制到目标对象，返回修改后的对象。
 * @param target - 目标对象，接收源对象属性的对象，也是修改后的返回值。
 * @param source - 源对象，包含将被合并的属性。
 * @returns 目标对象。
 */
export default function assign<T>(target: T, source: object) {
	for (const key in source) {
		try {
			if (hasOwn(source, key))
				target[key] = source[key];
		} catch (error) { }
	}
	return target;
}
