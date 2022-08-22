// 尤其关注一下全局函数 isValid() 和 has() 的区别。

export default function has(value: any) {
	try {
		return typeof value !== "undefined" && value !== null;
	} catch (error) {
		return false;
	}
}
