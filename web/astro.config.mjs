// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { scrollableFocus } from './plugins/scrollable-focus.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  markdown: {
    // Shiki usa estilos en línea, incompatibles con la CSP estricta: usamos Prism.
    syntaxHighlight: 'prism',
    processor: satteri({ hastPlugins: [scrollableFocus] }),
  },

  security: {
    // Astro genera hashes de los scripts/estilos propios en un <meta> CSP por página.
    // frame-ancestors y demás cabeceras que <meta> no admite van en public/_headers.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "worker-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Ambos cargan WASM relativo a su propio módulo; el pre-bundling de Vite lo rompe.
      exclude: ['pyodide', '@electric-sql/pglite'],
    },
    worker: {
      format: 'es',
    },
  },
});
