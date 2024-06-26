import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			utilities: path.resolve(__dirname, "./src/utilities/"),
			services: path.resolve(__dirname, "./src/services/"),
			components: path.resolve(__dirname, "./src/components/"),
			assets: path.resolve(__dirname, "./src/assets/"),
			contexts: path.resolve(__dirname, "./src/contexts/"),
			barrel: path.resolve(__dirname, "./src/components/componentsBarrel.js"),
			projectConfig: path.resolve(__dirname, "./src/services/config.js"),
			helperFunctions: path.resolve(__dirname, "./src/utilities/helperFunctions.js"),
		},
	},
	plugins: [react()],
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true,
				additionalData: [`@use "./src/utilities/variables.scss" as *;`],
			},
		},
	},
});
