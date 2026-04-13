import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['src/dev', 'src/stories', 'src/__tests__'] })
  ],
  server: {
    host: '0.0.0.0',
  },
  build: {
    copyPublicDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ChatUI',
      fileName: 'chat-ui',
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'framer-motion',
        'lucide-react',
        'clsx',
        '@tanstack/react-virtual',
        'react-markdown',
        'remark-gfm',
        'remark-math',
        'rehype-katex',
        'katex',
        /^katex\//,
        '@chenglou/pretext',
        'rehype-highlight',
        'highlight.js',
      ],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-dom': 'ReactDOM',
          'framer-motion': 'FramerMotion',
          'lucide-react': 'LucideReact',
          clsx: 'clsx',
          '@tanstack/react-virtual': 'TanstackReactVirtual',
          '@chenglou/pretext': 'Pretext',
          'react-markdown': 'ReactMarkdown',
          'remark-gfm': 'RemarkGfm',
          'remark-math': 'RemarkMath',
          'rehype-katex': 'RehypeKatex',
          katex: 'katex',
          'katex/dist/katex.min.css': 'katexCSS',
        }
      }
    }
  }
});
