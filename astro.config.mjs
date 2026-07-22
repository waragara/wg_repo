// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import fs from 'fs';
import path from 'path';

function localAdminPlugin() {
  return {
    name: 'local-admin-api',
    configureServer(server) {
      server.middlewares.use('/api/save-file', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            try {
              const { filename, content } = JSON.parse(body);
              if (filename && content) {
                const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
                const filePath = path.join(process.cwd(), 'src', 'content', 'setups', safeFilename);
                fs.writeFileSync(filePath, content, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: `Setup ${safeFilename} salvo com sucesso!` }));
                return;
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Filename and content are required' }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// https://astro.build/config
export default defineConfig({
  site: 'https://waragara.github.io',
  base: '/wg_repo',
  vite: {
    plugins: [tailwindcss(), localAdminPlugin()]
  },
  integrations: [mdx()]
});