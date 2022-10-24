/**
 * 如果 value 在 min 和 max 范围之间，则使用 value 作为函数返回值；
 * 如果 value 大于 max ，则使用 max 作为返回值；
 * 如果 value 小于 min ，则使用 min 作为返回值。
 * @param min - 最小值。
 * @param value - 首选值。
 * @param max - 最大值。
 * @returns 约束范围内的值。
 */
export default function clamp(min: number, value: number, max: number) {
	return Math.max(min, Math.min(max, value));
}
