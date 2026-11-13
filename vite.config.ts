import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Build-time SEO plugin:
 * - Injects Google Search Console verification meta tag if VITE_GOOGLE_SITE_VERIFICATION is set
 * - Replaces placeholder domain in built HTML, sitemap.xml, and robots.txt if VITE_SITE_URL is set
 */
function mbhSeoBuildPlugin(): Plugin {
  const siteUrl = (process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');
  const gscVerification = (process.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();

  return {
    name: 'mbh-seo-build-plugin',
    transformIndexHtml(html) {
      let result = html;
      if (siteUrl) {
        result = result.replace(/https:\/\/mumbaibeatboxhub\.com/g, siteUrl);
      }
      if (gscVerification) {
        result = result.replace(
          '</head>',
          `    <meta name="google-site-verification" content="${gscVerification.replace(/"/g, '&quot;')}" />\n  </head>`
        );
      }
      return result;
    },
    closeBundle() {
      if (!siteUrl) return;
      const distDir = path.resolve(__dirname, 'dist');
      for (const file of ['sitemap.xml', 'robots.txt']) {
        const filePath = path.join(distDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          fs.writeFileSync(
            filePath,
            content.replace(/https:\/\/mumbaibeatboxhub\.com/g, siteUrl),
            'utf-8'
          );
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mbhSeoBuildPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['motion'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
