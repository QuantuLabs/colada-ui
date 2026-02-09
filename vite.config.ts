import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		tailwindcss(),
		nodePolyfills({
			include: ['buffer', 'crypto', 'stream', 'util', 'events', 'assert', 'http', 'https', 'os', 'url', 'zlib', 'path'],
			globals: { Buffer: true, global: true, process: true }
		}),
		sveltekit()
	],
	define: {
		'process.env.BROWSER': true
	}
});
