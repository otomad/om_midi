// 想在 npm 找一个类似的插件发现并没有，于是干脆自己写一个好了。

"use strict";

import MagicString from "magic-string";

const PLUGIN_NAME = "rollup-plugin-self-execute";

class SelfExecuteOption {
	args = []; // 实参。位于自执行匿名函数底部。
	params = []; // 形参。位于自执行匿名函数顶部。
	
	constructor(options = { }) {
		for (const key in options) {
			if (Object.hasOwnProperty.call(options, key)) {
				const value = options[key];
				this.args.push(key);
				this.params.push(value);
			}
		}
	}
	
	get head() {
		return `(function (${this.params.join(", ")}) {\n\n`;
	}
	get foot() {
		return `\n\n})(${this.args.join(", ")});`;
	}
}

/**
 * Rollup 插件。
 * 用于给打包后的代码包装自执行匿名函数。
 */
export default function selfExecute(options = {}) {
	const pluginOptions = new SelfExecuteOption(options);
	
	return {
		name: PLUGIN_NAME,
		
		renderChunk(code, chunk, outputOptions = { }) {
			const sourcemap = outputOptions.sourcemap !== false;
			const magicString = new MagicString(code);
			
			magicString.prepend(pluginOptions.head);
			magicString.append(pluginOptions.foot);
			
			const result = { code: magicString.toString() };
			
			if (sourcemap !== false) {
				result.map = magicString.generateMap({ hires: true });
			}
			
			return result;
		}
	}
}
