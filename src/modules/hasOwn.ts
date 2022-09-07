export default
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
function hasOwn<T extends object, K extends string>(obj: T, prop: K): prop is keyof T {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

// 破烂玩意ㄦ，改写 Object.prototype.hasOwnProperty 则 TypeScript 不支持；改写 Object.hasOwn 则 ExtendScript 不支持。
