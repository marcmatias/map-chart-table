import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.js"),
      name: "MapChartTable",
      fileName: () => `map-chart-table.js`,

      formats: ['umd']
    },
    rollupOptions: {
      output: {
        assetFileNames: "map-chart-table.[ext]",
      },
    },
  },
});
