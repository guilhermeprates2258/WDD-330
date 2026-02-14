import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "FinalProject",
  build: {
    outDir: "../dist/final-project",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "FinalProject/index.html"),
      },
    },
  },
});
