import { CannotCreateFileError } from "../errors";
import TempFile from "./TempFile";

export default class Base64Image extends TempFile {
	constructor(base64: string, imageName: string = `tmp${new Date().valueOf()}.png`) {
		super(imageName);
		if (this && this.open("w")) {
			this.encoding = "binary";
			
			for (const text of texts)
				file.writeln(text);
			this.close();
		} else throw new CannotCreateFileError();
	}
	
	private base64Decode = function F(/*str*/s) {
		var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		F.cache || F.cache = {
			RE_NON_ALPHA: new RegExp('[^' + ALPHA + ']'),
				RE_BAD_EQUALS: /\=([^=]|\=\=)/
		};
		if ((n % 4) || F.cache.RE_NON_ALPHA.test(s) || F.cache.RE_BAD_EQUALS.test(s)) {
			throw Error("Invalid Base64 data");
		}
		var fChr = String.fromCharCode,
			n = s.length >>> 0,
			a = [],
			c = 0,
			i0, i1, i2, i3,
			b, b0, b1, b2;
		while (c < n) {
			i0 = ALPHA.indexOf(s[c++]);
			i1 = ALPHA.indexOf(s[c++]);
			i2 = ALPHA.indexOf(s[c++]);
			i3 = ALPHA.indexOf(s[c++]);

			b = (i0 << 18) + (i1 << 12) + ((i2 & 63) << 6) + (i3 & 63);
			b0 = (b & (255 << 16)) >> 16;
			b1 = (i2 == 64) ? -1 : (b & (255 << 8)) >> 8;
			b2 = (i3 == 64) ? -1 : (b & 255);
			a[a.length] = fChr(b0);
			if (0 <= b1) a[a.length] = fChr(b1);
			if (0 <= b2) a[a.length] = fChr(b2);
		}
		// Cleanup and return
		// ---
		s = a.join('');
		a.length = 0;
		a = fChr = null;
		return s;
	};
}
