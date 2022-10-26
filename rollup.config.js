import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";

export default {
	input: "src/index.ts",
	output: {
		dir: "./dist",
		chunkFileNames: "js/index.js",
		entryFileNames: "js/index.js",
		format: "iife",
		globals: {
			react: "React",
			"react-dom/client": "ReactDOM",
			"csinterface-ts": "CSInterface",
			"react-transition-group": "ReactTransitionGroup",
		},
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
		postcss({
			minimize: false,
			autoModules: true,
			extract: "css/style.css",
		}),
	],
};
