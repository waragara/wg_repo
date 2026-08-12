import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const setupSchema = {
    type: Type.OBJECT,
    properties: {
        sugestoes: { type: Type.STRING },
        markdown_frontmatter: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                equipment: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            tagUso: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    }
};

async function run() {
    console.log("Calling Gemini...");
    const systemPrompt = "Gere um setup muito complexo com 10 equipamentos diferentes.";
    const prompt = "Gere 10 pedais detalhados, com descrições grandes.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: { 
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: setupSchema,
                temperature: 0.1,
                maxOutputTokens: 8192
            }
        });
        console.log("Response text length:", response.text.length);
        console.log("Response text:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
