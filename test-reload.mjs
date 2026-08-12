import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { loadEnv } from 'vite';

async function runTest() {
  const env = loadEnv('development', process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const setupSchema = {
    type: Type.OBJECT,
    properties: {
      sugestoes: { type: Type.STRING },
      markdown_frontmatter: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
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
                title: { type: Type.STRING },
                list: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
      signal_chain: {
        type: Type.OBJECT,
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

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Refaça o setup ideal para a música Led Zeppelin Jangly do artista Led Zeppelin usando APENAS equipamentos virtuais.`;
  const systemPrompt = `Você é um Engenheiro de Áudio profissional e Roadie especialista em timbres de guitarra (Tone Hunter)...` // simplified

  console.log('Enviando request...');
  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { 
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: setupSchema
      }
    });

    console.log('Resposta bruta recebida:');
    console.log(aiResponse.text);

  } catch(e) {
    console.error('Erro na API:', e.message);
  }
}

runTest();
