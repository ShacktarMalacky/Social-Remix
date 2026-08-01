import { GoogleGenAI } from "@google/genai";

export async function generateVeoVideo(
  prompt: string, 
  aspectRatio: '16:9' | '9:16' = '16:9', 
  resolution: '720p' | '1080p' | '4k' = '720p',
  videoStyle: string = 'none'
): Promise<string> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not configured.");
  }
  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  const modelToUse = resolution === '4k' ? 'veo-3.1-generate-preview' : 'veo-3.1-lite-generate-preview';

  let enhancedPrompt = prompt;
  const styleMaps: { [key: string]: string } = {
    cinematic_noir: "Film noir aesthetic, high contrast, black and white palette.",
    cyberpunk_elite: "Cyberpunk style, neon lights, vibrant colors.",
    surreal_dream: "Surrealist art style, dreamlike atmosphere.",
    minimalist_luxury: "Minimalist luxury aesthetic, clean lines, sophisticated.",
    hyper_realistic: "Hyper-realistic detail, 8k resolution textures.",
    anime_masterpiece: "High-quality anime style, studio ghibli inspired."
  };

  if (videoStyle !== 'none' && styleMaps[videoStyle]) {
    enhancedPrompt = `${prompt}. Style: ${styleMaps[videoStyle]}`;
  }

  try {
    let operation = await ai.models.generateVideos({
      model: modelToUse,
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      // Reconstruct operation for polling as per SDK requirements
      const op: any = { name: operation.name };
      operation = await ai.operations.getVideosOperation({ operation: op });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Veo Error:", error);
    throw error;
  }
}
