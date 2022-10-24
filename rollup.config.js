import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
// import afterEffectJsx from "rollup-plugin-ae-jsx";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import User from "./src/user.ts";
import path from "path";
import selfExecute from "./custom_modules/rollup-plugin-self-execute";
import cleanup from "rollup-plugin-cleanup";

const enableTerser = true;

export default [{
	input: "src/index.ts",
	output: {
		file: pkg.main,
		format: "es", // "iife"
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
		cleanup({
			comments: "all",
			lineEndings: "unix",
		}),
		enableTerser ? terser({
			compress: {
				// conditionals: false, // ExtendScript 对三元运算符的运算顺序有偏见。
				// comparisons: false, // ExtendScript 对逻辑与、逻辑或的运算顺序也有偏见。
				defaults: false, // 直接禁用默认得了。
			},
		}) : undefined,
		license({
			banner: {
				content: {
					file: path.join(__dirname, "banner.template.ejs"),
				},
				data: User,
			}
		}),
	],
}/* , {
	input: "src/utils.ts",
	output: {
		file: "dist/om_utils.jsx",
		format: "cjs",
		format: "es",
	},
	onwarn: function (warning) {
		console.warn(warning.message);
	},
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
		afterEffectJsx(),
	],
} */];
