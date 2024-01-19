import path from 'path';
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { external: ['better-sqlite3'] }
    },
    resolve: {
      alias: {
        '@model': resolve('src/data/model'),
        '@config': resolve('src/data/config'),
        '@': resolve('src')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@model': resolve('src/data/model'),
        '@config': resolve('src/data/config'),
        '@': resolve('src')
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          mltSelector: resolve(__dirname, 'src/renderer/mlt-selector.html'),
          aaCanvas: resolve(__dirname, 'src/renderer/aa-canvas.html'),
          textEditor: resolve(__dirname, 'src/renderer/text-editor.html')
        }
      }
    },
    resolve: {
      alias: {
        icons: path.resolve(__dirname, 'node_modules/vue-material-design-icons'),
        '@model': resolve('src/data/model'),
        '@config': resolve('src/data/config'),
        '@components': resolve('src/renderer/src/components'),
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src')
      }
    },
    plugins: [
      vue(),
      VueI18nPlugin({
        include: path.resolve(__dirname, 'src/locales/**'),
        jitCompilation: true
      })
    ]
  }
});
