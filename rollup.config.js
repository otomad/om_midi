import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
// import afterEffectJsx from "rollup-plugin-ae-jsx";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import User from "./src/user";
import path from "path";
import selfExecute from "./custom_modules/rollup-plugin-self-execute";

const enableTerser = false;

export default [{
	input: "src/index.ts",
	output: {
		file: pkg.main,
		format: "cjs",
		format: "es",
	},
	onwarn: function (warning) {
		console.warn(warning.message);
	},
	context: "this",
	external: Object.keys(pkg.dependencies),
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				_npmVersion: pkg.version,
			},
		}),
		typescript({
			module: "esnext",
			target: "es5",
			noImplicitAny: true,
			moduleResolution: "node",
			strict: true,
		}),
		// afterEffectJsx(),
		selfExecute({
			"this": "thisObj",
		}),
		enableTerser ? terser({
			compress: {
				conditionals: false, // 傻逼 ExtendScript 会把三元运算符的每一个选项都计算一遍。
			},
		}) : undefined,
		license({
			banner: {
				content: {
					file: path.join(__dirname, "banner.template.ejs"),
				},
				data: {
					scriptName: User.scriptName,
					version: User.version,
				},
			}
		}),
	],
}];
