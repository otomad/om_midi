export default class TempFile extends File {
	constructor(fileName: string) {
		super(Folder.temp.fsName + '/' + fileName);
	}
}
