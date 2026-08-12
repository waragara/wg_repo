// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import fs from 'fs';
import path from 'path';

import { GoogleGenAI, Type } from '@google/genai';
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
              const gearKnowledgePath = path.join(process.cwd(), 'src', 'data', 'gear-knowledge.md');
              const gearKnowledge = fs.existsSync(gearKnowledgePath) ? fs.readFileSync(gearKnowledgePath, 'utf-8') : '';

              const isAutopilot = !selectedGear || selectedGear.length === 0;

              const setupSchema = {
                type: Type.OBJECT,
                properties: {
                  sugestoes: { type: Type.STRING },
                  markdown_frontmatter: {
                    type: Type.OBJECT,
                    required: ["title", "artist", "targetTone", "guitar", "pickup", "amp", "equipment"],
                    properties: {
                      title: { type: Type.STRING, description: "Short title (max 40 chars)" },
                      artist: { type: Type.STRING },
                      targetTone: { type: Type.STRING },
                      guitar: { type: Type.STRING },
                      pickup: { type: Type.STRING },
                      amp: { type: Type.STRING },
                      equipment: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["title", "tagUso", "list", "table"],
                          properties: {
                            title: { type: Type.STRING, description: "Exact name of the gear from the inventory" },
                            tagUso: { type: Type.STRING },
                            list: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            table: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                required: ["f", "db"],
                                properties: {
                                  f: { type: Type.STRING },
                                  db: { type: Type.STRING }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  signal_chain: {
                    type: Type.OBJECT,
                    required: ["slot_1_gain", "slot_2_eq", "slot_3_modulation", "slot_4_digital_amp", "slot_5_ambience"],
                    properties: {
                      slot_1_gain: { type: Type.STRING, description: 'Overdrive/Distortion pedal (optional, leave empty if none)' },
                      slot_2_eq: { type: Type.STRING, description: 'EQ pedal (optional)' },
                      slot_3_modulation: { type: Type.STRING, description: 'Modulation/Tempo pedal (optional)' },
                      slot_4_digital_amp: { type: Type.STRING, description: 'Digital Amp/Multi-fx like Tank-G (optional)' },
                      slot_5_ambience: { type: Type.STRING, description: 'Reverb/Delay pedal (optional)' }
                    }
                  }
                }
              };

              let systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra.
Sua missão é criar o setup de áudio perfeito para a música/artista solicitado pelo usuário, baseando-se nos equipamentos disponíveis.

IMPORTANTE: Você DEVE retornar EXATAMENTE a estrutura JSON requerida no schema. Preencha os slots da "signal_chain" com os pedais adequados. Deixe vazio os slots que não for usar.

REGRA CRÍTICA 1: Os valores de guitar, pickup, amp, equipment e signal_chain DEVEM ser uma cópia EXATA de algum item do inventário geral.
REGRA CRÍTICA 2: Se a pedaleira "Pedaleira Multi Efeitos M-Vave Tank-G" for selecionada, você OBRIGATORIAMENTE deve usar um AMP e um IR CAB da lista exclusiva do Tank-G e incluí-los na chave 'list' dentro de 'equipment' (ex: "<strong class='text-white'>AMP:</strong> NOME DO AMP").
REGRA CRÍTICA 3: O campo pickup (Braço, Ponte ou Ambos) é OBRIGATÓRIO.

REGRA CRÍTICA 4 (A Regra de Ouro do Cabeamento Físico e Conexão): O sinal de áudio sai da Guitarra e ENTRA EXCLUSIVAMENTE no "Input" do pedal do Slot 1. Sob nenhuma hipótese conecte a guitarra na "saída" de um pedal. O fluxo é sempre Input -> Output para o próximo pedal. 
Ordem Lógica Obrigatória de Efeitos (Inviolável): Preencha os slots do JSON estritamente nesta arquitetura:
Slot 1: Ganho/Overdrive (ex: Pure Sky - Caline, Boss OD-3)
Slot 2: Equalização Analógica (ex: Equilizador Joyo 10-Band Controller)
Slot 3: Modulações/Tempo (ex: M-Vave LOst Tempo v2)
Slot 4: Processamento Digital / Amp Sim / Multi-efeitos (ex: M-Vave Tank-G)
Slot 5: Ambiência Final (ex: M-Vave Mini Universe)
((O Joyo 10-Band NUNCA deve vir depois do Tank-G. O Lost Tempo NUNCA deve vir depois do Mini Universe).\n
REGRA CRÍTICA 6 (Detalhamento do Equipamento): No array 'equipment', forneça um objeto para CADA guitarra, pedal e amp usado detalhando a configuração.
- 'title': O nome exato do equipamento.
- 'tagUso': Uma frase curta explicando o uso.
- 'list': OBRIGATÓRIO para guitarras, amps e todos os pedais (exceto o Equalizador). Array de strings puras com os parâmetros. NUNCA invente parâmetros extras. Use APENAS os listados no conhecimento técnico.
- 'table': OBRIGATÓRIO Apenas para o Equalizador Joyo 10-Band. Formato: {f: "125", db: "-2"}. PREENCHA TODOS OS VALORES 'db' COM NÚMEROS (ex: +2, -3, 0). NUNCA DEIXE VAZIO.

Inventário GERAL disponível:
${allGear.map((g) => `- ${g}`).join('\n')}

Inventário TANK-G (Opções exclusivas de Amps e Cabs do Tank-G):
- Amps: ${tankGPresets.amps.join(', ')}
- IR Cabs: ${tankGPresets.cabs.join(', ')}

REGRA CRÍTICA 7 (Conhecimento dos Manuais): Você tem acesso ao manual oficial de funcionamento dos pedais Boss OD-3, Caline Pure Sky, Joyo EQ, M-Vave Tank-G, Mini Universe e Lost Tempo v2. Ao utilizar esses pedais, a sua escolha de parâmetros DEVE respeitar OS NOMES EXATOS descritos nos manuais abaixo.
--- INÍCIO DOS MANUAIS ---
${gearKnowledge}
--- FIM DOS MANUAIS ---
`;

              if (isAutopilot) {
                systemPrompt += `
CENÁRIO (Piloto Automático): O usuário NÃO selecionou nenhum equipamento.
Sua Tarefa: Assuma que todo o inventário está conectado. Analise a música solicitada, vasculhe o inventário completo acima e selecione a melhor guitarra, pedais e amplificador. Na chave 'sugestoes' do JSON, explique detalhadamente a escolha do captador e como ordenou o sinal.`;
              } else {
                systemPrompt += `
CENÁRIO (Equipamento Selecionado): O usuário selecionou manualmente os seguintes equipamentos:
${selectedGear.map((g) => `- ${g}`).join('\n')}

REGRA CRÍTICA 5: NUNCA use quebras de linha reais dentro das strings do JSON. Use apenas espaço.\nSua Tarefa: Crie o setup utilizando os equipamentos que o usuário selecionou. 
No entanto, aja com VISÃO HOLÍSTICA: assuma que TODOS os equipamentos do inventário estão disponíveis no seu estúdio. Se o setup selecionado pelo usuário estiver "pobre" para o timbre solicitado (ex: falta de um reverb ou drive), adicione os equipamentos necessários do inventário geral para atingir a perfeição. Você DEVE alocar os pedais nos slots corretos aplicando a Ordem Lógica Inviolável acima. Na chave 'sugestoes' do JSON, explique a escolha do captador e como reordenou o sinal.`;
              }

              const ai = new GoogleGenAI({ apiKey });
              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { 
                  systemInstruction: systemPrompt,
                  responseMimeType: "application/json",
                  responseSchema: setupSchema,
                  temperature: 0.7,
                  maxOutputTokens: 8192
                }
              });

              let rawText = aiResponse.text || '{}';
              const jsonMatch = rawText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                rawText = jsonMatch[0];
              }

              let responseJson;
              try {
                let cleanedText = rawText.replace(/[\u0000-\u001F]+/g, " ");
                responseJson = JSON.parse(cleanedText);
              } catch (e1) {
                try {
                  // Fallback extremamente permissivo caso o JSON.parse falhe
                  responseJson = (new Function('return ' + rawText))();
                } catch (e2) {
                  console.error("Erro no Parse do JSON. Texto bruto recebido:\n", rawText);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: "Falha na formatação da IA. Resposta: " + rawText.substring(0, 150) + "..." }));
                  return;
                }
              }

              const fm = responseJson.markdown_frontmatter || {};
              const sc = responseJson.signal_chain || {};
              const sugestoes = responseJson.sugestoes || '';

              const pedalsArray = [
                sc.slot_1_gain,
                sc.slot_2_eq,
                sc.slot_3_modulation,
                sc.slot_4_digital_amp,
                sc.slot_5_ambience
              ].filter(Boolean);

              let equipmentYaml = '';
              if (fm.equipment && fm.equipment.length > 0) {
                equipmentYaml = 'equipment:\n';
                fm.equipment.forEach(eq => {
                  const eqTitle = (eq.title || '').replace(/"/g, '\\"');
                  equipmentYaml += `  - title: "${eqTitle}"\n`;
                  
                  if (eq.tagUso) {
                    equipmentYaml += `    tagUso: "${eq.tagUso.replace(/"/g, '\\"')}"\n`;
                  }
                  
                  if (eq.list && eq.list.length > 0) {
                    equipmentYaml += `    list:\n`;
                    eq.list.forEach(item => {
                      let formattedItem = item.replace(/([A-Za-zÀ-ÿ0-9/ ]+):/g, "<strong class=\"text-white\">$1:</strong>");
                      equipmentYaml += `      - '${formattedItem.replace(/'/g, "''")}'\n`;
                    });
                  }
                  
                  if (eq.table && eq.table.length > 0) {
                    equipmentYaml += `    table:\n`;
                    eq.table.forEach(row => {
                      equipmentYaml += `      - f: "${(row.f || '').toString().replace(/"/g, '\\"')}"\n`;
                      equipmentYaml += `        db: "${(row.db || '').toString().replace(/"/g, '\\"')}"\n`;
                    });
                  }
                });
              }

              const formattedComment = sugestoes.split('\n').map(line => `  ${line}`).join('\n');
              const escapeYml = (str) => (str || '').replace(/"/g, '\\"');
              
              let generatedContent = `---
title: "${escapeYml(fm.title)}"
artist: "${escapeYml(fm.artist)}"
targetTone: "${escapeYml(fm.targetTone)}"
guitar: "${escapeYml(fm.guitar)}"
pickup: "${escapeYml(fm.pickup)}"
pedals: ${pedalsArray.length > 0 ? '\n' + pedalsArray.map(p => `  - "${escapeYml(p)}"`).join('\n') : '[]'}
amp: "${escapeYml(fm.amp)}"
${equipmentYaml.trimEnd()}
aiComment: |
${formattedComment}
---`;
              
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
              
              // Extract title and artist using robust Regex (handles quotes or no quotes)
              const titleMatch = content.match(/title:\s*([^\n\r]+)/);
              const artistMatch = content.match(/artist:\s*([^\n\r]+)/);
              
              let title = titleMatch ? titleMatch[1].trim() : '';
              let artist = artistMatch ? artistMatch[1].trim() : '';
              
              // Remove surrounding quotes if they exist
              title = title.replace(/^["']/, '').replace(/["']$/, '');
              artist = artist.replace(/^["']/, '').replace(/["']$/, '');
              
              if (!title || !artist) {
                // Se ainda falhar, tenta extrair pelo nome do arquivo
                // Ex: acdc-back-in-black.md => artist: acdc, title: back in black
                const nameParts = filename.replace('.md', '').split('-');
                if (nameParts.length >= 2) {
                    artist = nameParts[0];
                    title = nameParts.slice(1).join(' ');
                } else {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Não foi possível extrair o título ou o artista do frontmatter.' }));
                    return;
                }
              }

              const env = loadEnv(server.config.mode, process.cwd(), '');
              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

              const gearListPath = path.join(process.cwd(), 'src', 'data', 'gear.json');
              const allGear = JSON.parse(fs.readFileSync(gearListPath, 'utf-8'));
              
              const tankGPath = path.join(process.cwd(), 'src', 'data', 'tank-g-presets.json');
              const tankGPresets = fs.existsSync(tankGPath) ? JSON.parse(fs.readFileSync(tankGPath, 'utf-8')) : { amps: [], cabs: [] };
              const gearKnowledgePath = path.join(process.cwd(), 'src', 'data', 'gear-knowledge.md');
              const gearKnowledge = fs.existsSync(gearKnowledgePath) ? fs.readFileSync(gearKnowledgePath, 'utf-8') : '';

              const setupSchema = {
                type: Type.OBJECT,
                properties: {
                  sugestoes: { type: Type.STRING },
                  markdown_frontmatter: {
                    type: Type.OBJECT,
                    required: ["title", "artist", "targetTone", "guitar", "pickup", "amp", "equipment"],
                    properties: {
                      title: { type: Type.STRING, description: "Short title (max 40 chars)" },
                      artist: { type: Type.STRING },
                      targetTone: { type: Type.STRING },
                      guitar: { type: Type.STRING },
                      pickup: { type: Type.STRING },
                      amp: { type: Type.STRING },
                      equipment: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["title", "tagUso", "list", "table"],
                          properties: {
                            title: { type: Type.STRING, description: "Exact name of the gear from the inventory" },
                            tagUso: { type: Type.STRING },
                            list: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            table: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                required: ["f", "db"],
                                properties: {
                                  f: { type: Type.STRING },
                                  db: { type: Type.STRING }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  signal_chain: {
                    type: Type.OBJECT,
                    required: ["slot_1_gain", "slot_2_eq", "slot_3_modulation", "slot_4_digital_amp", "slot_5_ambience"],
                    properties: {
                      slot_1_gain: { type: Type.STRING, description: 'Overdrive/Distortion pedal (optional)' },
                      slot_2_eq: { type: Type.STRING, description: 'EQ pedal (optional)' },
                      slot_3_modulation: { type: Type.STRING, description: 'Modulation/Tempo pedal (optional)' },
                      slot_4_digital_amp: { type: Type.STRING, description: 'Digital Amp/Multi-fx like Tank-G (optional)' },
                      slot_5_ambience: { type: Type.STRING, description: 'Reverb/Delay pedal (optional)' }
                    }
                  }
                }
              };
              setupSchema.required = ["sugestoes", "markdown_frontmatter", "signal_chain"];

              const systemPrompt = `Você é um engenheiro de áudio especialista em timbres de guitarra.
Sua missão é criar o setup de áudio perfeito para a música/artista solicitado pelo usuário, baseando-se nos equipamentos disponíveis.

IMPORTANTE: Você DEVE retornar EXATAMENTE a estrutura JSON requerida no schema. Preencha os slots da "signal_chain" com os pedais adequados. Deixe vazio os slots que não for usar.

REGRA CRÍTICA 1: Os valores de guitar, pickup, amp, equipment e signal_chain DEVEM ser uma cópia EXATA de algum item do inventário geral.
REGRA CRÍTICA 2: Se a pedaleira "Pedaleira Multi Efeitos M-Vave Tank-G" for selecionada, você OBRIGATORIAMENTE deve usar um AMP e um IR CAB da lista exclusiva do Tank-G e incluí-los na chave 'list' dentro de 'equipment' (ex: "<strong class='text-white'>AMP:</strong> NOME DO AMP").
REGRA CRÍTICA 3: O campo pickup (Braço, Ponte ou Ambos) é OBRIGATÓRIO.

REGRA CRÍTICA 4 (A Regra de Ouro do Cabeamento Físico e Conexão): O sinal de áudio sai da Guitarra e ENTRA EXCLUSIVAMENTE no "Input" do pedal do Slot 1. Sob nenhuma hipótese conecte a guitarra na "saída" de um pedal. O fluxo é sempre Input -> Output para o próximo pedal. 
Ordem Lógica Obrigatória de Efeitos (Inviolável): Preencha os slots do JSON estritamente nesta arquitetura:
Slot 1: Ganho/Overdrive (ex: Pure Sky - Caline, Boss OD-3)
Slot 2: Equalização Analógica (ex: Equilizador Joyo 10-Band Controller)
Slot 3: Modulações/Tempo (ex: M-Vave LOst Tempo v2)
Slot 4: Processamento Digital / Amp Sim / Multi-efeitos (ex: M-Vave Tank-G)
Slot 5: Ambiência Final (ex: M-Vave Mini Universe)
((O Joyo 10-Band NUNCA deve vir depois do Tank-G. O Lost Tempo NUNCA deve vir depois do Mini Universe).\n
REGRA CRÍTICA 6 (Detalhamento do Equipamento): No array 'equipment', forneça um objeto para CADA guitarra, pedal e amp usado detalhando a configuração.
- 'title': O nome exato do equipamento.
- 'tagUso': Uma frase curta explicando o uso.
- 'list': OBRIGATÓRIO para guitarras, amps e todos os pedais (exceto o Equalizador). Array de strings puras com os parâmetros. NUNCA invente parâmetros extras. Use APENAS os listados no conhecimento técnico.
- 'table': OBRIGATÓRIO Apenas para o Equalizador Joyo 10-Band. Formato: {f: "125", db: "-2"}. PREENCHA TODOS OS VALORES 'db' COM NÚMEROS (ex: +2, -3, 0). NUNCA DEIXE VAZIO.

Inventário GERAL disponível:
${allGear.map((g) => `- ${g}`).join('\n')}

Inventário TANK-G (Opções exclusivas de Amps e Cabs do Tank-G):
- Amps: ${tankGPresets.amps.join(', ')}
- IR Cabs: ${tankGPresets.cabs.join(', ')}

REGRA CRÍTICA 7 (Conhecimento dos Manuais): Você tem acesso ao manual oficial de funcionamento dos pedais Boss OD-3, Caline Pure Sky, Joyo EQ, M-Vave Tank-G, Mini Universe e Lost Tempo v2. Ao utilizar esses pedais, a sua escolha de parâmetros DEVE respeitar OS NOMES EXATOS descritos nos manuais abaixo.
--- INÍCIO DOS MANUAIS ---
${gearKnowledge}
--- FIM DOS MANUAIS ---

CENÁRIO (Reload / Otimização):
Sua Tarefa: Você deve reconstruir o array de pedais do zero. Analise TODOS os equipamentos disponíveis no arquivo de dados. Se o setup antigo usou apenas 2 pedais, adicione outros pedais se eles forem essenciais para o timbre solicitado. Selecione a melhor guitarra, pedais e amplificador. Na chave 'sugestoes' do JSON, explique como reordenou o sinal.`;

              const ai = new GoogleGenAI({ apiKey });
              const prompt = `Refaça o setup ideal para a música ${title} do artista ${artist} usando APENAS os equipamentos da lista.`;
              
              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { 
                  systemInstruction: systemPrompt,
                  responseMimeType: "application/json",
                  responseSchema: setupSchema,
                  temperature: 0.7,
                  maxOutputTokens: 8192
                }
              });

              let rawText = aiResponse.text || '{}';
              const jsonMatch = rawText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                rawText = jsonMatch[0];
              }

              let responseJson;
              try {
                // Remove invalid control characters that often break JSON parsing
                let cleanedText = rawText.replace(/[\u0000-\u001F]+/g, " ");
                responseJson = JSON.parse(cleanedText);
              } catch (e1) {
                try {
                  // Fallback extremamente permissivo caso o JSON.parse falhe
                  responseJson = (new Function('return ' + rawText))();
                } catch (e2) {
                  console.error("Erro no Parse do JSON. Texto bruto recebido:\n", rawText);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: "Falha na formatação da IA. Resposta: " + rawText.substring(0, 150) + "..." }));
                  return;
                }
              }

              const fm = responseJson.markdown_frontmatter || {};
              const sc = responseJson.signal_chain || {};
              const sugestoes = responseJson.sugestoes || '';

              const pedalsArray = [
                sc.slot_1_gain,
                sc.slot_2_eq,
                sc.slot_3_modulation,
                sc.slot_4_digital_amp,
                sc.slot_5_ambience
              ].filter(Boolean);

              let equipmentYaml = '';
              if (fm.equipment && fm.equipment.length > 0) {
                equipmentYaml = 'equipment:\n';
                fm.equipment.forEach(eq => {
                  const eqTitle = (eq.title || '').replace(/"/g, '\\"');
                  equipmentYaml += `  - title: "${eqTitle}"\n`;
                  
                  if (eq.tagUso) {
                    equipmentYaml += `    tagUso: "${eq.tagUso.replace(/"/g, '\\"')}"\n`;
                  }
                  
                  if (eq.list && eq.list.length > 0) {
                    equipmentYaml += `    list:\n`;
                    eq.list.forEach(item => {
                      let formattedItem = item.replace(/([A-Za-zÀ-ÿ0-9/ ]+):/g, "<strong class=\"text-white\">$1:</strong>");
                      equipmentYaml += `      - '${formattedItem.replace(/'/g, "''")}'\n`;
                    });
                  }
                  
                  if (eq.table && eq.table.length > 0) {
                    equipmentYaml += `    table:\n`;
                    eq.table.forEach(row => {
                      equipmentYaml += `      - f: "${(row.f || '').toString().replace(/"/g, '\\"')}"\n`;
                      equipmentYaml += `        db: "${(row.db || '').toString().replace(/"/g, '\\"')}"\n`;
                    });
                  }
                });
              }

              const formattedComment = sugestoes.split('\n').map(line => `  ${line}`).join('\n');
              const escapeYml = (str) => (str || '').replace(/"/g, '\\"');
              
              let generatedContent = `---
title: "${escapeYml(fm.title)}"
artist: "${escapeYml(fm.artist)}"
targetTone: "${escapeYml(fm.targetTone)}"
guitar: "${escapeYml(fm.guitar)}"
pickup: "${escapeYml(fm.pickup)}"
pedals: ${pedalsArray.length > 0 ? '\n' + pedalsArray.map(p => `  - "${escapeYml(p)}"`).join('\n') : '[]'}
amp: "${escapeYml(fm.amp)}"
${equipmentYaml.trimEnd()}
aiComment: |
${formattedComment}
---`;

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