import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    strictPort: false,
    host: "0.0.0.0",
    cors: true,

    // Proxy para evitar CORS
    proxy: {
      "/api": {
        target: "https://ttn-webhook-server.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true,
      },
      "/health": {
        target: "https://ttn-webhook-server.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 3000,
    strictPort: false,
    host: "0.0.0.0",
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  define: {
    "process.env": {},
  },
});
