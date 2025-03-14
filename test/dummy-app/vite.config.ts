import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { routeGeneratorPlugin } from '../../dist/index.js';

export default defineConfig({
	plugins: [
		sveltekit(),
		routeGeneratorPlugin()
	]
});
