import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

let name = production ? 'production' : 'development';
let input = 'src/main.js';

export default {
	input: `${input}`,
	output: {
		name: `${name}`,
		file: `build/${name}.js`,
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		production && terser(), // minify, but only in production
		serve({
			host: 'localhost',
  			port: 3000,
			contentBase: ['build'],
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Expose-Headers': '*',
				'Cross-Origin-Resource-Policy': 'cross-origin'
			}
		})
	]
};
