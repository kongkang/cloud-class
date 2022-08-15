import { defineConfig } from 'vite';
import path from "path";
import vue from '@vitejs/plugin-vue';
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '/src'),
			// '@pub': path.resolve(__dirname, '/public'),
		}
	},
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  clearScreen: false,
  server: {
    open: true,
  },
})
