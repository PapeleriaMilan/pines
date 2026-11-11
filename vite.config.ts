import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// Ruta base: "/" en Netlify y local; en GitHub Pages el workflow define
// BASE_PATH (p. ej. "/pines/"), así no depende del nombre del dueño o repo.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Separa librerías para mejor caché entre despliegues.
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          motion: ["motion/react"],
        },
      },
    },
  },
});
