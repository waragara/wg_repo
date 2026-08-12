import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const setupSchema = {
    type: Type.OBJECT,
    properties: {
        sugestoes: { type: Type.STRING },
        markdown_frontmatter: {
            type: Type.OBJECT,
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
            properties: {
                slot_1_gain: { type: Type.STRING, description: 'Gain/Overdrive pedal (optional)' },
                slot_2_eq: { type: Type.STRING, description: 'EQ pedal (optional)' },
                slot_3_modulation: { type: Type.STRING, description: 'Modulation/Tempo pedal (optional)' },
                slot_4_digital_amp: { type: Type.STRING, description: 'Digital Amp/Multi-fx like Tank-G (optional)' },
                slot_5_ambience: { type: Type.STRING, description: 'Reverb/Delay pedal (optional)' }
            }
        }
    }
};

async function run() {
    const gearKnowledgePath = path.join(process.cwd(), 'src', 'data', 'gear-knowledge.md');
    const gearKnowledge = fs.existsSync(gearKnowledgePath) ? fs.readFileSync(gearKnowledgePath, 'utf-8') : '';
    
    const tankGPath = path.join(process.cwd(), 'src', 'data', 'tank-g-presets.json');
    const tankGPresets = fs.existsSync(tankGPath) ? JSON.parse(fs.readFileSync(tankGPath, 'utf-8')) : { amps: [], cabs: [] };

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
((O Joyo 10-Band NUNCA deve vir depois do Tank-G. O Lost Tempo NUNCA deve vir depois do Mini Universe).

REGRA CRÍTICA 6 (Detalhamento do Equipamento): No array 'equipment', forneça um objeto para CADA guitarra, pedal e amp usado detalhando a configuração.
- 'title': O nome exato do equipamento.
- 'tagUso' (opcional): Uma frase curta explicando o uso.
- 'list' (opcional): Array de strings puras. Exemplo: "Volume: 7 | Drive: 4" ou "Captador: Braço". Use apenas texto simples.
- 'table' (opcional): Apenas para o Equalizador Joyo 10-Band. Formato: {f: "125", db: "-2"}.

Inventário GERAL disponível:
- Guitarra Cort Classi Rock Les Paul
- Pedal OverDrive Boss OD-3
- Equilizador Joyo 10-Band Controller
- M-Vave Tank-G
- M-Vave Mini Universe

Inventário TANK-G (Opções exclusivas de Amps e Cabs do Tank-G):
- Amps: ${tankGPresets.amps.join(', ')}
- IR Cabs: ${tankGPresets.cabs.join(', ')}

REGRA CRÍTICA 7 (Conhecimento dos Manuais): Você tem acesso ao manual oficial de funcionamento dos pedais Boss OD-3, Caline Pure Sky, Joyo EQ, M-Vave Tank-G, Mini Universe e Lost Tempo v2. Ao utilizar esses pedais, a sua escolha de parâmetros DEVE respeitar OS NOMES EXATOS descritos nos manuais abaixo.
--- INÍCIO DOS MANUAIS ---
${gearKnowledge}
--- FIM DOS MANUAIS ---

CENÁRIO (Reload / Otimização):
Sua Tarefa: Você deve reconstruir o array de pedais do zero. Analise TODOS os equipamentos disponíveis no arquivo de dados. Se o setup antigo usou apenas 2 pedais, adicione outros pedais se eles forem essenciais para o timbre solicitado. Selecione a melhor guitarra, pedais e amplificador. Na chave 'sugestoes' do JSON, explique como reordenou o sinal.`;

    const prompt = `Refaça o setup ideal para a música Whole Lotta Love do artista Led Zeppelin usando APENAS os equipamentos da lista.`;
    
    console.log("Calling Gemini...");
    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: { 
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: setupSchema,
                temperature: 0.1
            }
        });
        console.log("Response text:", aiResponse.text);
    } catch (e) {
        console.error("Error calling Gemini:", e);
    }
}

run();
