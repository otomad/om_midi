import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
import copy from "rollup-plugin-copy";
import sass from "rollup-plugin-sass";

export default {
	input: "src/index.ts",
	output: {
		file: pkg.main,
		format: "iife",
	},
	onwarn: function (warning) {
		console.warn(warning.message);
	},
	external: Object.keys(pkg.dependencies),
	plugins: [
		copy({
			targets: [
				{ src: "public/*", dest: "dist" },
			]
		}),
		typescript({
			module: "esnext",
			target: "esnext",
			noImplicitAny: true,
			moduleResolution: "node",
			strict: true,
			jsx: "react",
		}),
		sass({
			output: "dist/css/style.css",
			options: {
				outputStyle: "expanded",
			}
		}),
	],
};
