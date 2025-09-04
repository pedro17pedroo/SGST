import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@shared": path.resolve(import.meta.dirname, "..", "shared"),
        "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(import.meta.dirname, "..", "dist/public"),
      emptyOutDir: true,
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            charts: ['recharts'],
            maps: ['leaflet', 'react-leaflet'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      host: !isProduction ? 'localhost' : '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:4001',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
