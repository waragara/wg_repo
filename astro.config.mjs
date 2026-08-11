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
              if (!prompt) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Prompt is required' }));
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

              // Load Full Inventory
              const gearListPath = path.join(process.cwd(), 'src', 'data', 'gear.json');
              const allGear = JSON.parse(fs.readFileSync(gearListPath, 'utf-8'));

              const isAutopilot = !selectedGear || selectedGear.length === 0;

              let systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra.
Seu objetivo é criar um setup de áudio para a música solicitada retornando ESTRITAMENTE um objeto JSON válido com duas chaves:
- "sugestoes": Uma mensagem explicativa (string).
- "markdown": O código do arquivo Markdown (string) contendo o YAML Frontmatter perfeitamente alinhado à nossa Content Collection do Zod (title, artist, guitar, pedals, amp, amp_settings) seguido de uma breve explicação sobre a cadeia de sinal.

Inventário COMPLETO disponível do usuário:
${allGear.map((g) => `- ${g}`).join('\n')}
`;

              if (isAutopilot) {
                systemPrompt += `
CENÁRIO (Piloto Automático): O usuário NÃO selecionou nenhum equipamento.
Sua Tarefa: Analise a música solicitada, vasculhe o inventário completo acima e selecione a dedo a melhor guitarra, pedais e amplificador.
Na chave "sugestoes", explique brevemente por que você montou esse setup específico com base no inventário.`;
              } else {
                systemPrompt += `
CENÁRIO (Equipamento Selecionado): O usuário selecionou manualmente os seguintes equipamentos:
${selectedGear.map((g) => `- ${g}`).join('\n')}

Sua Tarefa: Crie o setup utilizando ESTRITAMENTE E APENAS os equipamentos que o usuário selecionou. Não invente equipamentos fora desta lista.
Na chave "sugestoes", aja como um revisor: comente sobre a escolha do usuário baseando-se no inventário completo (ex: elogie a escolha ou sugira gentilmente se outra guitarra do inventário seria melhor para aquele timbre).`;
              }

              const ai = new GoogleGenAI({ apiKey });

              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { 
                  systemInstruction: systemPrompt,
                  responseMimeType: "application/json"
                }
              });

              const responseData = JSON.parse(aiResponse.text || '{}');
              const generatedContent = responseData.markdown || '';
              const sugestoes = responseData.sugestoes || '';
              
              // Gera um nome de arquivo seguro baseado no prompt
              const filename = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.md';
              const filePath = path.join(process.cwd(), 'src', 'content', 'setups', filename);
              
              fs.writeFileSync(filePath, generatedContent, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Setup gerado e salvo como ${filename}!`, sugestoes }));

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