import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GenerationConfig, VideoScript, VideoScene, VoiceType } from "./types";

// Check if API key is available and valid
const hasApiKey = () => {
  const key = import.meta.env.VITE_API_KEY;
  return key && key.trim().length > 0;
};

// Always create a new instance with the API key from environment directly
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// Mock data for demo mode
const getMockScript = (config: GenerationConfig): VideoScript => {
  const topicKeywords = config.topic.toLowerCase().split(' ');
  const sceneCount = Math.ceil(config.duration / 10);
  
  // Create more relevant scene descriptions based on topic and tone
  const toneDescriptions = {
    'informative': 'Learn about',
    'promotional': 'Discover the benefits of',
    'storytelling': 'Experience the journey of',
    'humorous': 'Funny moments with'
  };
  
  const descriptions = {
    'informative': [
      `Key facts about ${config.topic}`,
      `Deep dive into ${config.topic} technology`,
      `Understanding ${config.topic} better`,
      `Why ${config.topic} matters`,
      `${config.topic} explained simply`,
      `Expert insights on ${config.topic}`
    ],
    'promotional': [
      `Introducing amazing ${config.topic}`,
      `Transform your life with ${config.topic}`,
      `Limited time: ${config.topic} offer`,
      `See what makes ${config.topic} special`,
      `Join thousands enjoying ${config.topic}`,
      `Your ${config.topic} solution starts here`
    ],
    'storytelling': [
      `A remarkable ${config.topic} story`,
      `The ${config.topic} that changed everything`,
      `When ${config.topic} became personal`,
      `${config.topic}: One person's journey`,
      `Heartwarming ${config.topic} moment`,
      `The untold story of ${config.topic}`
    ],
    'humorous': [
      `Hilarious ${config.topic} fails`,
      `${config.topic} in a nutshell`,
      `Why ${config.topic} is comedy gold`,
      `Funny things about ${config.topic}`,
      `${config.topic} humor you'll love`,
      `When ${config.topic} goes wrong (funny)`
    ]
  };
  
  const sceneDescriptions = descriptions[config.tone] || descriptions['informative'];
  const sceneDuration = Math.floor(config.duration / sceneCount);
  
  return {
    title: `${config.topic} - ${config.platform}`,
    scenes: Array.from({ length: sceneCount }, (_, i) => ({
      id: `scene-${i}`,
      sceneNumber: i + 1,
      narration: `${sceneDescriptions[i % sceneDescriptions.length]}. This is scene ${i + 1} where we explore this fascinating aspect. ${config.description.substring(0, 80)}...`,
      visualPrompt: `${config.tone} professional video scene about ${config.topic}, scene ${i + 1}, high quality, cinematic lighting, suitable for ${config.platform}`,
      keywords: topicKeywords.concat([config.tone, `scene-${i + 1}`, config.platform.toLowerCase()]),
      duration: sceneDuration,
      imageUrl: undefined,
      audioData: undefined
    }))
  };
};

// Mock image - creates a gradient with text
const getMockImage = (prompt?: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 360, 640);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 360, 640);
    
    // Add semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 360, 640);
    
    // Add main text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Display prompt or default text
    const displayText = prompt ? prompt.substring(0, 60) : 'Scene Image';
    ctx.fillText(displayText, 180, 280);
    
    // Add demo watermark
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('[Demo Mode]', 180, 600);
  }
  return canvas.toDataURL();
};

// Mock audio - creates proper WAV audio with voice-like tones
const getMockAudio = (): string => {
  const sampleRate = 24000;
  const duration = 3; // 3 second audio clip
  const numSamples = sampleRate * duration;
  
  // Create multiple frequency components to simulate speech
  const frequencies = [200, 300, 400]; // Multiple harmonics
  const amplitudes = [0.15, 0.1, 0.05];
  
  // Create WAV file structure
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const subchunk2Size = numSamples * channels * (bitsPerSample / 8);
  
  // WAV header (44 bytes)
  const header = new ArrayBuffer(44);
  const headerView = new DataView(header);
  
  // "RIFF" chunk descriptor
  headerView.setUint8(0, 0x52); // R
  headerView.setUint8(1, 0x49); // I
  headerView.setUint8(2, 0x46); // F
  headerView.setUint8(3, 0x46); // F
  headerView.setUint32(4, 36 + subchunk2Size, true); // file size - 8
  headerView.setUint8(8, 0x57); // W
  headerView.setUint8(9, 0x41); // A
  headerView.setUint8(10, 0x56); // V
  headerView.setUint8(11, 0x45); // E
  
  // "fmt " subchunk
  headerView.setUint8(12, 0x66); // f
  headerView.setUint8(13, 0x6D); // m
  headerView.setUint8(14, 0x74); // t
  headerView.setUint8(15, 0x20); // (space)
  headerView.setUint32(16, 16, true); // subchunk1 size
  headerView.setUint16(20, 1, true); // audio format (PCM)
  headerView.setUint16(22, channels, true); // num channels
  headerView.setUint32(24, sampleRate, true); // sample rate
  headerView.setUint32(28, byteRate, true); // byte rate
  headerView.setUint16(32, blockAlign, true); // block align
  headerView.setUint16(34, bitsPerSample, true); // bits per sample
  
  // "data" subchunk
  headerView.setUint8(36, 0x64); // d
  headerView.setUint8(37, 0x61); // a
  headerView.setUint8(38, 0x74); // t
  headerView.setUint8(39, 0x61); // a
  headerView.setUint32(40, subchunk2Size, true); // subchunk2 size
  
  // Generate audio data with varying frequency
  const audioData = new ArrayBuffer(subchunk2Size);
  const audioView = new DataView(audioData);
  
  for (let i = 0; i < numSamples; i++) {
    let sample = 0;
    
    // Mix multiple frequencies
    for (let f = 0; f < frequencies.length; f++) {
      sample += Math.sin((2 * Math.PI * frequencies[f] * i) / sampleRate) * amplitudes[f];
    }
    
    // Add some envelope variation
    const envelope = Math.sin((Math.PI * i) / numSamples) * 0.8 + 0.2;
    sample *= envelope;
    
    // Convert to 16-bit PCM
    const sample16 = Math.max(-1, Math.min(1, sample)) * 32767;
    audioView.setInt16(i * 2, sample16, true);
  }
  
  // Combine header and audio data
  const wavData = new Uint8Array(44 + audioData.byteLength);
  wavData.set(new Uint8Array(header), 0);
  wavData.set(new Uint8Array(audioData), 44);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < wavData.length; i++) {
    binary += String.fromCharCode(wavData[i]);
  }
  return btoa(binary);
};

export const generateScript = async (config: GenerationConfig): Promise<VideoScript> => {
  // Use mock data if no API key
  if (!hasApiKey()) {
    return getMockScript(config);
  }

  try {
    const ai = getAI();
    const prompt = `
    Create a detailed video script for a ${config.duration}-second ${config.tone} video for ${config.platform}.
    Topic: ${config.topic}
    Description: ${config.description}
    Language: ${config.language}
    Keywords: ${config.keywords || 'N/A'}

    Rules:
    - Divide the video into 3 to 6 distinct scenes.
    - For each scene, provide a narration text and a highly descriptive visual prompt for an image generator.
    - Ensure the total narration length fits the ${config.duration}-second duration (roughly 3 words per second).
    - Return the result in the specified JSON format.
  `;

    // Always use ai.models.generateContent to query GenAI
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  narration: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["sceneNumber", "narration", "visualPrompt", "keywords"]
              }
            }
          },
          required: ["title", "scenes"]
        }
      }
    });

    // Access the .text property directly
    const scriptStr = response.text;
    const script = JSON.parse(scriptStr || '{}') as VideoScript;
    script.scenes = script.scenes.map((s, idx) => ({ ...s, id: `scene-${idx}` }));
    return script;
  } catch (error: any) {
    console.warn('Script generation failed, using mock script:', error?.message || error);
    return getMockScript(config);
  }
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  // Use mock image if no API key
  if (!hasApiKey()) {
    return getMockImage(prompt);
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High quality, cinematic, social media style: ${prompt}` }]
      },
      config: {
        imageConfig: { aspectRatio: "9:16" }
      }
    });

    // Iterate through parts to find the image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image data generated");
  } catch (error: any) {
    console.warn('Image generation failed, using mock image:', error?.message || error);
    return getMockImage(prompt);
  }
};

export const generateSceneAudio = async (text: string, voice: VoiceType, language = 'English'): Promise<string> => {
  // Use mock audio if no API key
  if (!hasApiKey()) {
    return getMockAudio();
  }

  const ai = getAI();
  // Map our UI voice types to Gemini prebuilt voices (generic)
  const voiceName = voice === VoiceType.FEMALE ? 'Kore' : (voice === VoiceType.MALE ? 'Puck' : 'Zephyr');

  // Map simple language names to BCP-47 codes accepted by Gemini TTS
  const languageMap: Record<string, string> = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Telugu': 'te-IN',
    'Kannada': 'kn-IN',
    'Tamil': 'ta-IN'
  };
  const languageCode = languageMap[language] || 'en-US';

  // Helper to extract inline data
  const extractAudio = (resp: any): string | undefined => {
    try {
      return resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      return undefined;
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          languageCode,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    let audioData = extractAudio(response);
    if (audioData) return audioData;

    // Retry with explicit language hint
    const hintText = `[Language: ${languageCode}] ${text}`;
    const retry = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: hintText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          languageCode,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    audioData = extractAudio(retry);
    if (audioData) return audioData;

    throw new Error('Audio generation returned no data');
  } catch (err: any) {
    console.warn('Audio generation failed, falling back to mock audio:', err?.message || err);
    return getMockAudio();
  }
};
