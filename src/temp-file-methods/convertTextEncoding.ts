import { CannotCreateFileError } from "../errors";
import TempFile from "./TempFile";

// ²âÊÔ0 → 测试0

export default function convertTextEncoding(texts: string[] | string): string[] {
	if (typeof texts === "string") texts = [texts];
	if (texts.length === 0) return [];
	const file = new TempFile("tmp.txt");
	let defaultEncoding: string; // 系统默认编码
	if (file && file.open("w")) {
		defaultEncoding = file.encoding;
		file.encoding = "binary";
		for (const text of texts)
			file.writeln(text);
		file.close();
	} else throw new CannotCreateFileError();
	const results: string[] = [];
	if (file && file.open("r")) {
		file.encoding = defaultEncoding;
		while (!file.eof)
			results.push(file.readln());
		file.close();
		file.remove();
	} else throw new CannotCreateFileError();
	return results;
}
