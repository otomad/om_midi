import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import afterEffectJsx from 'rollup-plugin-ae-jsx';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/index.ts',
	output: {
		file: pkg.main,
		format: 'cjs',
		format: 'es',
	},
	onwarn: function (warning) {
		// Skip certain warnings

		// should intercept ... but doesn't in some rollup versions
		// if (warning.code === 'THIS_IS_UNDEFINED') { return; }

		// console.warn everything else
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
			module: 'esnext',
			target: 'es5',
			noImplicitAny: true,
			moduleResolution: 'node',
			strict: true,
		}),
		// afterEffectJsx(),
		terser(),
	],
};
