import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig((opt) => {
  return {
    root: "src",
    build: {
      outDir: "../dist",
      rollupOptions: {
        input: {
          content_scripts: resolve(__dirname, "src/content_scripts.ts"),
          background: resolve(__dirname, "src/background.ts"),
          popup: resolve(__dirname, "src/popup.html"),
        },
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };
});
