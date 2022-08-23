export default class BinContentReader {
	data: string;
	pointer: number = 0;
	
	/**
	 * 二进制文件内容读取。
	 * @param data - 解析为二进制数据的字符串。
	 */
	constructor(data: string) {
		this.data = data;
	}
	
	/**
	 * 数据长度 / 字节大小。
	 */
	length(): number { // 没法用 getter 属性
		return this.data.length;
	}
	
	/**
	 * 将指针移动指定的字节数。
	 * @param bytes - 移动字节数。
	 */
	protected movePointer(bytes: number): number {
		this.pointer += bytes;
		if (this.pointer < 0 || this.pointer >= this.length()) {
			// 此时应该读取错误了，但是暂时忽略不计。
		}
		return this.pointer;
	}
	
	/**
	 * 获得指定偏移量上或指针所处的字节值。
	 * @param offset - 指定偏移量上的字节值。可选，留空表示当前指针所处字节值。
	 * @returns 指定偏移量上或指针所处的字节值。
	 */
	protected getByte(offset?: number): number {
		offset ??= this.pointer;
		if (offset >= this.length()) return -1;
		return this.data.charCodeAt(offset);
	}
	
	/**
	 * 读取指定字节数的值。
	 * @param bytes - 读取指定的字节数。默认为 1 个字节。
	 * @returns - 指定字节数的值。
	 */
	protected readByte(bytes: number = 1): number {
		bytes = Math.min(bytes, this.length() - this.pointer); // 避免数据溢出。
		if (bytes < 1) return -1; // 文件读完了。
		let value = 0;
		for (let i = 0; i < bytes; i++) {
			value <<= 8;
			value += this.getByte();
			write(this.getByte().toString(16) + " ");
			write(String.fromCharCode(this.getByte()) + "\n");
			this.pointer++;
		}
		return value;
	}
	
	/**
	 * 从指定的偏移量开始读取指定字节数的值。
	 * @param offset - 从指定的偏移量开始读取。
	 * @param bytes - 读取指定的字节数。默认为 1 个字节。
	 * @returns - 指定字节数的值。
	 */
	protected readByteFrom(offset: number, bytes: number = 1): number {
		bytes = Math.min(bytes, this.length() - offset);
		if (bytes < 1) return -1;
		let value = 0;
		for (let i = 0; i < bytes; i++) {
			value <<= 8;
			value += this.getByte(offset++);
		}
		return value;
	}
	
	/**
	 * 读取指定字节数的字符串。
	 * @param bytes - 读取指定的字节数。
	 * @returns - 指定字节数的字符串。
	 */
	protected readString(bytes: number): string {
		bytes = Math.min(bytes, this.length() - this.pointer);
		let text = "";
		if (bytes < 1) return text;
		for (let i = 0; i < bytes; i++)
			text += this.data[this.pointer++];
		return text;
	}
	
	/**
	 * 读取指定字节数的数字数组。
	 * @param bytes - 读取指定的字节数。
	 * @returns - 指定字节数的数字数组。
	 */
	protected readByteArray(bytes: number): number[] {
		bytes = Math.min(bytes, this.length() - this.pointer);
		let array: number[] = [];
		if (bytes < 1) return array;
		for (let i = 0; i < bytes; i++) {
			array.push(this.getByte());
			this.pointer++;
		}
		return array;
	}
	
	/**
	 * 是否阅读完毕？
	 */
	protected isReadOver(): boolean {
		return this.pointer >= this.length();
	}
}
