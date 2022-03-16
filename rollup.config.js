import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import ignore from "rollup-plugin-ignore"

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const name = production ? 'production' : 'development'

export default {
	input: 'src/main.js',
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
		ignore([
			"./utils/get-current-player-height",
			"./utils/three-utils",
			"./components/gltf-model-plus",
			"./assets/models/BargeMesh.glb",
			"./systems/sound-effects-system"
		])
	]
};
