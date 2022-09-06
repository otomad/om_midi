/**
 * 用于利用临时生成文件来执行操作的函数。
 */
export default class TempFile extends File {
	constructor(fileName: string) {
		super(`${Folder.temp.fsName}/${new Date().valueOf()}_${fileName}`);
	}
}
