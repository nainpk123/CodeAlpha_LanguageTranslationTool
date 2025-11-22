import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Translation Service ---

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string,
  tone: string = 'Standard'
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Role: Expert Linguist and Translator.
      Task: Translate the following text from ${sourceLang} to ${targetLang}.
      Style/Tone: ${tone}.
      
      Constraints: 
      1. Return ONLY the translated text. 
      2. Do not include any preamble, notes, or explanations.
      3. Ensure the tone matches the requested style (${tone}).
      
      Text to translate:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translatedText = response.text;
    if (!translatedText) {
      throw new Error("Empty response from translation model.");
    }
    return translatedText.trim();
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

// --- TTS Service ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playTextToSpeech = async (text: string): Promise<void> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from TTS model.");
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContext.createGain();
    outputNode.connect(audioContext.destination);

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1,
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();

    // Return a promise that resolves when audio ends
    return new Promise((resolve) => {
        source.onended = () => {
            resolve();
            audioContext.close(); 
        };
    });

  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};
