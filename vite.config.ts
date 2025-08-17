import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT) || 5173;
  const host = env.HOST || 'localhost'
  const open = (env.OPEN ?? 'false').toLowerCase() === 'true'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { host, port, open, strictPort: true },
    preview: { port },
    build: { target: 'es2020', sourcemap: mode !== 'production', outDir: 'dist' },
  }
})
