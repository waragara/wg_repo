import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';



export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { song } = body;

        if (!song) {
            return new Response(JSON.stringify({ error: 'Música não fornecida' }), { status: 400 });
        }

        const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Chave da API do Gemini ausente' }), { status: 500 });
        }

        // Load Katana Presets
        const presetsPath = path.join(process.cwd(), 'src', 'data', 'katana-presets.json');
        let presets = [];
        if (fs.existsSync(presetsPath)) {
            presets = JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));
        }

        const systemPrompt = `Você é um especialista em timbres. O usuário quer tocar a música solicitada usando apenas um Boss Katana:GO. 
Analise a lista de presets fornecida e escolha O ÚNICO preset que melhor se encaixa no timbre original da música. 
Retorne um JSON com: song (nome da música e artista), recommended_preset (formato "Slot - Nome", ex: "1-A BROWN LEAD") e explanation (uma breve explicação de 1 ou 2 frases do motivo da escolha).

LISTA DE PRESETS DISPONÍVEIS:
${JSON.stringify(presets, null, 2)}
`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                song: { type: Type.STRING },
                recommended_preset: { type: Type.STRING },
                explanation: { type: Type.STRING }
            },
            required: ["song", "recommended_preset", "explanation"]
        };

        const ai = new GoogleGenAI({ apiKey });
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Recomende um preset para a música: ${song}`,
            config: { 
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.4
            }
        });

        const textResponse = aiResponse.text;
        if (!textResponse) {
            return new Response(JSON.stringify({ error: 'Sem resposta da IA' }), { status: 500 });
        }

        const parsed = JSON.parse(textResponse);
        
        // Save to Markdown
        const slug = parsed.song.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const katanaDir = path.join(process.cwd(), 'src', 'content', 'katana');
        
        if (!fs.existsSync(katanaDir)) {
            fs.mkdirSync(katanaDir, { recursive: true });
        }

        const escapeYml = (str: string) => (str || '').replace(/"/g, '\\"');
        
        const markdownContent = `---
title: "${escapeYml(parsed.song)}"
preset: "${escapeYml(parsed.recommended_preset)}"
---

${parsed.explanation}
`;

        const filePath = path.join(katanaDir, `${slug}.md`);
        fs.writeFileSync(filePath, markdownContent, 'utf-8');

        return new Response(JSON.stringify({ success: true, data: parsed }), { status: 200 });
    } catch (error: any) {
        console.error('Error generating fast katana setup:', error);
        return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor' }), { status: 500 });
    }
};
