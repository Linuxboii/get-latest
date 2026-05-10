import { defineConfig, loadEnv } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load .env from project root so PORT stays in sync with the Express backend
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const backendPort = env.PORT || '3000';

  return {
    plugins: [cloudflare()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
        '/auth': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});