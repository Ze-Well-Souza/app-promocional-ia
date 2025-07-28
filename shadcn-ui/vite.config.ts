import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Disponibiliza variáveis de ambiente no cliente
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_DEBUG__: JSON.stringify(env.VITE_APP_DEBUG === 'true'),
    },
    server: {
      port: mode === 'staging' ? 5174 : 5173,
      host: true,
    },
    preview: {
      port: mode === 'staging' ? 5175 : 4173,
      host: true,
    },
    build: {
      outDir: mode === 'staging' ? 'dist-staging' : 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          },
        },
      },
    },
  };
});
