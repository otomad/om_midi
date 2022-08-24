import IFileReader from "./IFileReader";

export default class BinFileReader extends IFileReader {
	file: File;
	
	constructor(file: File) {
		super();
		this.file = file;
	}
	
	getPointer(): number {
		return this.file.tell();
	}
	length(): number {
		return this.file.length;
	}
	readByte(bytes: number = 1): number {
		const str = this.file.read(bytes);
		let value = 0;
		for (let i = 0; i < str.length; i++) {
			value <<= 8;
			value += str.charCodeAt(i);
		}
		return value;
	}
	readString(bytes: number): string {
		return this.file.read(bytes);
	}
	readByteArray(bytes: number): number[] {
		const str = this.file.read(bytes);
		const array: number[] = [];
		for (let i = 0; i < str.length; i++)
			array.push(str.charCodeAt(i));
		return array;
	}
	readDeltaTime(): number {
		let value = 0;
		let isLowByte = false;
		while (!(this.isReadOver() || isLowByte)) {
			value <<= 7;
			const b = this.file.read(1).charCodeAt(0);
			if (!(b & 0b1000_0000)) isLowByte = true;
			value += b & 0b0111_1111;
		}
		return value;
	}
	isReadOver(): boolean {
		return this.file.eof;
	}
	movePointer(bytes: number): void {
		this.file.seek(bytes, 1);
	}
	setPointer(pos: number): boolean {
		if (pos < 0 || pos >= this.length()) return false;
		return this.file.seek(pos, 0);
	}
}
