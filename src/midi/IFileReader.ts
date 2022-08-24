export default abstract class IFileReader {
	/**
	 * 获得指针当前偏移量。
	 */
	public abstract getPointer(): number;
	
	/**
	 * 获得数据长度 / 字节大小。
	 */
	public abstract length(): number;
	
	/**
	 * 读取指定字节数的值。
	 * @param bytes - 读取指定的字节数。默认为 1 个字节。
	 * @returns - 指定字节数的值。
	 */
	protected abstract readByte(bytes: number): number;
	
	/**
	 * 读取指定字节数的字符串。
	 * @param bytes - 读取指定的字节数。
	 * @returns - 指定字节数的字符串。
	 */
	protected abstract readString(bytes: number): string;
	
	/**
	 * 读取指定字节数的数字数组。
	 * @param bytes - 读取指定的字节数。
	 * @returns - 指定字节数的数字数组。
	 */
	protected abstract readByteArray(bytes: number): number[];
	
	/**
	 * 读取事件时间间隔（不定长数字）。
	 * @returns 事件时间间隔。
	 */
	protected abstract readDeltaTime(): number;
	
	/**
	 * 是否阅读完毕？
	 */
	public abstract isReadOver(): boolean;
	
	/**
	 * 将指针移动指定的字节数。
	 * @param bytes - 移动字节数。
	 */
	protected abstract movePointer(bytes: number): number | void;
};
