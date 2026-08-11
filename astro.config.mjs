// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import fs from 'fs';
import path from 'path';

import { GoogleGenAI } from '@google/genai';
import { loadEnv } from 'vite';

function localAdminPlugin() {
  return {
    name: 'local-admin-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-setup', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', async () => {
            try {
              const { prompt, selectedGear } = JSON.parse(body);
              if (!prompt || !selectedGear || selectedGear.length === 0) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Prompt and selected gear are required' }));
                return;
              }

              // Load .env explicitly for Vite middleware
              const env = loadEnv(server.config.mode, process.cwd(), '');
              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              
              if (!apiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is missing in .env' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });

              const systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra. Crie um setup de áudio para a música solicitada utilizando ESTRITAMENTE E APENAS os equipamentos fornecidos na lista a seguir. Não adicione, sugira ou invente nenhum equipamento que não esteja na lista.
Equipamentos permitidos: ${selectedGear.join(', ')}

A sua resposta deve ser APENAS o código Markdown contendo o YAML Frontmatter perfeitamente alinhado à nossa Content Collection do Zod (artist, guitar, pedals, amp, amp_settings) seguido de uma breve explicação sobre a cadeia de sinal. Não adicione formatação de bloco de código (\`\`\`) envolvendo o arquivo todo.`;

              const aiResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: { systemInstruction: systemPrompt }
              });

              let generatedContent = aiResponse.text || '';
              // Limpa formatação markdown indesejada caso o LLM retorne envolto em blocos
              generatedContent = generatedContent.replace(/^```markdown\s*/i, '').replace(/\s*```$/i, '');
              
              // Gera um nome de arquivo seguro baseado no prompt
              const filename = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.md';
              const filePath = path.join(process.cwd(), 'src', 'content', 'setups', filename);
              
              fs.writeFileSync(filePath, generatedContent, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Setup gerado e salvo como ${filename}!` }));

            } catch (e) {
              console.error('API Error:', e);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message || 'Error generating setup' }));
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