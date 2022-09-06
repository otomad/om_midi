import IFileReader from "./IFileReader";

export default class BinContentReader extends IFileReader {
	data: string;
	pointer: number = 0;
	
	/**
	 * 二进制文件内容读取。
	 * @param data - 解析为二进制数据的字符串。
	 */
	constructor(data: string) {
		super();
		this.data = data;
	}
	
	getPointer(): number {
		return this.pointer;
	}
	
	length(): number { // 没法用 getter 属性
		return this.data.length;
	}
	
	movePointer(bytes: number): number {
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
	
	readByte(bytes: number = 1): number {
		bytes = Math.min(bytes, this.length() - this.pointer); // 避免数据溢出。
		if (bytes < 1) return -1; // 文件读完了。
		let value = 0;
		for (let i = 0; i < bytes; i++) {
			value <<= 8;
			value += this.getByte();
			this.pointer++;
		}
		return value;
	}
	
	/**
	 * 从指定的偏移量开始读取指定字节数的值。
	 * @param offset - 从指定的偏移量开始读取。
	 * @param bytes - 读取指定的字节数。默认为 1 个字节。
	 * @returns 指定字节数的值。
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
	
	readString(bytes: number): string {
		bytes = Math.min(bytes, this.length() - this.pointer);
		let text = "";
		if (bytes < 1) return text;
		for (let i = 0; i < bytes; i++)
			text += this.data[this.pointer++];
		return text;
	}
	
	readByteArray(bytes: number): number[] {
		bytes = Math.min(bytes, this.length() - this.pointer);
		const array: number[] = [];
		if (bytes < 1) return array;
		for (let i = 0; i < bytes; i++) {
			array.push(this.getByte());
			this.pointer++;
		}
		return array;
	}
	
	isReadOver(): boolean {
		return this.pointer >= this.length();
	}
	
	readDeltaTime(): number {
		let value = 0;
		let isLowByte = false;
		while (!(this.isReadOver() || isLowByte)) {
			value <<= 7;
			const b = this.readByte(1); // 来自 ECMAScript 3 的 ExtendScript 会认为 byte 是保留字。
			if (!(b & 0b1000_0000)) isLowByte = true;
			value += b & 0b0111_1111;
		}
		return value;
	}
}
