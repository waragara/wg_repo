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
      // Rota 1: Gerar Setup com IA (Não salva no disco)
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

              const env = loadEnv(server.config.mode, process.cwd(), '');
              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              
              if (!apiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is missing in .env' }));
                return;
              }

              const gearListPath = path.join(process.cwd(), 'src', 'data', 'gear.json');
              const allGear = JSON.parse(fs.readFileSync(gearListPath, 'utf-8'));
              
              const tankGPath = path.join(process.cwd(), 'src', 'data', 'tank-g-presets.json');
              const tankGPresets = fs.existsSync(tankGPath) ? JSON.parse(fs.readFileSync(tankGPath, 'utf-8')) : { amps: [], cabs: [] };

              const isAutopilot = !selectedGear || selectedGear.length === 0;

              let systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra.
Sua missão é criar o setup de áudio perfeito para a música/artista solicitado pelo usuário, baseando-se nos equipamentos disponíveis.

IMPORTANTE: Você NÃO deve retornar JSON. Retorne EXATAMENTE o texto bruto do arquivo markdown (incluindo o Frontmatter YAML) seguido de um separador "### SUGESTOES ###" e então escreva as suas explicações/sugestões na parte final.

Exemplo OBRIGATÓRIO do formato da sua resposta (substitua pelos dados reais e inclua as regulagens):
---
title: "Nome da Música"
artist: "Nome do Artista"
targetTone: "Breve descrição do timbre alvo (ex: Distorção pesada com muito sustain)"
guitar: "NOME EXATO DA GUITARRA"
pickup: "Braço" # OBRIGATÓRIO: "Braço", "Ponte" ou "Ambos"
pedals: 
  - "NOME EXATO DO PEDAL 1"
  - "NOME EXATO DO PEDAL 2"
amp: "NOME EXATO DO AMPLIFICADOR"
equipment:
  - title: "NOME EXATO DO PEDAL 1"
    list:
      - '<strong class="text-white">Drive/Gain:</strong> 6 | <strong class="text-white">Tone:</strong> 5 | <strong class="text-white">Level:</strong> 5'
  - title: "Pedaleira Multi Efeitos M-Vave Tank-G"
    list:
      - '<strong class="text-white">AMP:</strong> NOME EXATO DO AMP'
      - '<strong class="text-white">CAB:</strong> NOME EXATO DO CAB'
      - '<strong class="text-white">Gain:</strong> 5 | <strong class="text-white">Treble:</strong> 6 | <strong class="text-white">Middle:</strong> 5 | <strong class="text-white">Bass:</strong> 5'
---
**Sinal:**
1. A guitarra passa pelo pedal X...
2. Em seguida vai para o Amp Y...

**Captadores:**
Explique detalhadamente no corpo do texto o motivo da escolha do captador específico (Braço, Ponte ou Ambos) para essa música.

### SUGESTOES ###
Explique aqui a sua análise. Se a pedaleira "M-Vave Tank-G" for escolhida, justifique o AMP e IR CAB. 
VISÃO HOLÍSTICA: Se você notar que o usuário selecionou poucos equipamentos mas o timbre exigiria mais, recomende proativamente a inclusão de outros pedais do inventário.

REGRA CRÍTICA 1: Os valores de guitar, pedals, amp e os titles dentro de equipment DEVEM ser uma cópia EXATA de algum item do inventário geral.
REGRA CRÍTICA 2: Se a pedaleira "Pedaleira Multi Efeitos M-Vave Tank-G" for selecionada no setup (seja por você ou pelo usuário), você OBRIGATORIAMENTE deve usar um AMP e um IR CAB da lista do Tank-G e incluí-los no bloco equipment como mostrado no exemplo acima.
REGRA CRÍTICA 3: O campo pickup (Braço, Ponte ou Ambos) é obrigatório no YAML Frontmatter.

Inventário GERAL disponível:
${allGear.map((g) => `- ${g}`).join('\n')}

Inventário TANK-G (Opções exclusivas de Amps e Cabs do Tank-G):
- Amps: ${tankGPresets.amps.join(', ')}
- IR Cabs: ${tankGPresets.cabs.join(', ')}
`;

              if (isAutopilot) {
                systemPrompt += `
CENÁRIO (Piloto Automático): O usuário NÃO selecionou nenhum equipamento.
Sua Tarefa: Assuma que todo o inventário está conectado. Analise a música solicitada, vasculhe o inventário completo acima e selecione a dedo a melhor guitarra, pedais (quantos forem necessários) e amplificador.`;
              } else {
                systemPrompt += `
CENÁRIO (Equipamento Selecionado): O usuário selecionou manualmente os seguintes equipamentos:
${selectedGear.map((g) => `- ${g}`).join('\n')}

Sua Tarefa: Crie o setup utilizando os equipamentos que o usuário selecionou. 
No entanto, aja com VISÃO HOLÍSTICA: assuma que TODOS os equipamentos do inventário estão disponíveis no seu estúdio. Se o setup selecionado pelo usuário estiver "pobre" para o timbre solicitado (ex: falta de um reverb ou drive), adicione os equipamentos necessários do inventário geral para atingir a perfeição, e explique isso na seção SUGESTOES.`;
              }

              const ai = new GoogleGenAI({ apiKey });
              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { 
                  systemInstruction: systemPrompt,
                  responseMimeType: "text/plain"
                }
              });

              let rawText = aiResponse.text || '';
              // Remove possíveis marcações de bloco de código genéricas na resposta inteira
              rawText = rawText.replace(/^```markdown/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

              const parts = rawText.split('### SUGESTOES ###');
              let generatedContent = (parts[0] || '').trim();
              const sugestoes = (parts[1] || '').trim();
              
              if (sugestoes) {
                const formattedComment = sugestoes.split('\n').map(line => `  ${line}`).join('\n');
                generatedContent = generatedContent.replace(/^---\n/, `---\naiComment: |\n${formattedComment}\n`);
              }
              
              const filename = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, markdown: generatedContent, sugestoes, filename }));

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

      // Rota 2: Obter Conteúdo Cru de um Arquivo (Usado na Edição)
      server.middlewares.use('/api/get-setup', (req, res, next) => {
        if (req.method === 'GET') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const filename = url.searchParams.get('file');
          
          if (!filename) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Parâmetro file é obrigatório' }));
            return;
          }

          try {
            const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
            const filePath = path.join(process.cwd(), 'src', 'content', 'setups', safeFilename);
            
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Arquivo não encontrado' }));
              return;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, content }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        } else {
          next();
        }
      });

      // Rota 3: Salvar o Arquivo no Disco (Usado na Etapa de Revisão e Edição)
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
      // Rota 4: Recarregar Setup (Lê o arquivo antigo e pede pra IA recriar)
      server.middlewares.use('/api/reload-setup', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', async () => {
            try {
              const { filename } = JSON.parse(body);
              if (!filename) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Filename is required' }));
                return;
              }

              const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
              const filePath = path.join(process.cwd(), 'src', 'content', 'setups', safeFilename);
              
              if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Arquivo não encontrado' }));
                return;
              }

              const content = fs.readFileSync(filePath, 'utf-8');
              
              // Extract title and artist using Regex
              const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
              const artistMatch = content.match(/artist:\s*["']([^"']+)["']/);
              
              const title = titleMatch ? titleMatch[1] : '';
              const artist = artistMatch ? artistMatch[1] : '';
              
              if (!title || !artist) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Não foi possível extrair o título ou o artista do frontmatter.' }));
                return;
              }

              const env = loadEnv(server.config.mode, process.cwd(), '');
              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

              const gearListPath = path.join(process.cwd(), 'src', 'data', 'gear.json');
              const allGear = JSON.parse(fs.readFileSync(gearListPath, 'utf-8'));
              
              const tankGPath = path.join(process.cwd(), 'src', 'data', 'tank-g-presets.json');
              const tankGPresets = fs.existsSync(tankGPath) ? JSON.parse(fs.readFileSync(tankGPath, 'utf-8')) : { amps: [], cabs: [] };

              const systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra.
Sua missão é criar o setup de áudio perfeito para a música/artista solicitado pelo usuário, baseando-se nos equipamentos disponíveis.

IMPORTANTE: Você NÃO deve retornar JSON. Retorne EXATAMENTE o texto bruto do arquivo markdown (incluindo o Frontmatter YAML) seguido de um separador "### SUGESTOES ###" e então escreva as suas explicações/sugestões na parte final.

Exemplo OBRIGATÓRIO do formato da sua resposta (substitua pelos dados reais e inclua as regulagens):
---
title: "Nome da Música"
artist: "Nome do Artista"
targetTone: "Breve descrição do timbre alvo (ex: Distorção pesada com muito sustain)"
guitar: "NOME EXATO DA GUITARRA"
pickup: "Braço" # OBRIGATÓRIO: "Braço", "Ponte" ou "Ambos"
pedals: 
  - "NOME EXATO DO PEDAL 1"
  - "NOME EXATO DO PEDAL 2"
amp: "NOME EXATO DO AMPLIFICADOR"
equipment:
  - title: "NOME EXATO DO PEDAL 1"
    list:
      - '<strong class="text-white">Drive/Gain:</strong> 6 | <strong class="text-white">Tone:</strong> 5 | <strong class="text-white">Level:</strong> 5'
  - title: "Pedaleira Multi Efeitos M-Vave Tank-G"
    list:
      - '<strong class="text-white">AMP:</strong> NOME EXATO DO AMP'
      - '<strong class="text-white">CAB:</strong> NOME EXATO DO CAB'
      - '<strong class="text-white">Gain:</strong> 5 | <strong class="text-white">Treble:</strong> 6 | <strong class="text-white">Middle:</strong> 5 | <strong class="text-white">Bass:</strong> 5'
---
**Sinal:**
1. A guitarra passa pelo pedal X...
2. Em seguida vai para o Amp Y...

**Captadores:**
Explique detalhadamente no corpo do texto o motivo da escolha do captador específico (Braço, Ponte ou Ambos) para essa música.

### SUGESTOES ###
Explique aqui a sua análise. Se a pedaleira "M-Vave Tank-G" for escolhida, justifique o AMP e IR CAB. 
VISÃO HOLÍSTICA: Se você notar que o usuário selecionou poucos equipamentos mas o timbre exigiria mais, recomende proativamente a inclusão de outros pedais do inventário.

REGRA CRÍTICA 1: Os valores de guitar, pedals, amp e os titles dentro de equipment DEVEM ser uma cópia EXATA de algum item do inventário geral.
REGRA CRÍTICA 2: Se a pedaleira "Pedaleira Multi Efeitos M-Vave Tank-G" for selecionada no setup (seja por você ou pelo usuário), você OBRIGATORIAMENTE deve usar um AMP e um IR CAB da lista do Tank-G e incluí-los no bloco equipment como mostrado no exemplo acima.
REGRA CRÍTICA 3: O campo pickup (Braço, Ponte ou Ambos) é obrigatório no YAML Frontmatter.

Inventário GERAL disponível:
${allGear.map((g) => `- ${g}`).join('\n')}

Inventário TANK-G (Opções exclusivas de Amps e Cabs do Tank-G):
- Amps: ${tankGPresets.amps.join(', ')}
- IR Cabs: ${tankGPresets.cabs.join(', ')}

CENÁRIO (Piloto Automático / Reload):
Sua Tarefa: Assuma que todo o inventário está conectado. Analise a música solicitada, vasculhe o inventário completo acima e selecione a dedo a melhor guitarra, pedais (quantos forem necessários) e amplificador.`;

              const ai = new GoogleGenAI({ apiKey });
              const prompt = `Refaça o setup ideal para a música ${title} do artista ${artist} usando APENAS os equipamentos da lista.`;
              
              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { 
                  systemInstruction: systemPrompt,
                  responseMimeType: "text/plain"
                }
              });

              let rawText = aiResponse.text || '';
              rawText = rawText.replace(/^```markdown/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

              const parts = rawText.split('### SUGESTOES ###');
              let generatedContent = (parts[0] || '').trim();
              const sugestoes = (parts[1] || '').trim();
              
              if (sugestoes) {
                const formattedComment = sugestoes.split('\n').map(line => `  ${line}`).join('\n');
                generatedContent = generatedContent.replace(/^---\n/, `---\naiComment: |\n${formattedComment}\n`);
              }

              fs.writeFileSync(filePath, generatedContent, 'utf-8');
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Setup ${safeFilename} refeito com sucesso!` }));

            } catch (e) {
              console.error('API Error:', e);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message || 'Error reloading setup' }));
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