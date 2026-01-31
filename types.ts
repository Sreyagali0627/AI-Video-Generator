
export enum VideoTone {
  INFORMATIVE = 'informative',
  PROMOTIONAL = 'promotional',
  STORYTELLING = 'storytelling',
  HUMOROUS = 'humorous'
}

export enum TargetPlatform {
  YOUTUBE_SHORTS = 'YouTube Shorts',
  INSTAGRAM_REELS = 'Instagram Reels',
  LINKEDIN = 'LinkedIn',
  GENERIC = 'Generic'
}

export enum VoiceType {
  MALE = 'Male',
  FEMALE = 'Female',
  NEUTRAL = 'Neutral'
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  narration: string;
  visualPrompt: string;
  keywords: string[];
  imageUrl?: string;
  audioData?: string; // base64 pcm
  duration?: number; // in seconds
}

export interface VideoScript {
  title: string;
  scenes: VideoScene[];
}

export interface GenerationConfig {
  topic: string;
  description: string;
  platform: TargetPlatform;
  duration: number; // 15, 30, 60
  tone: VideoTone;
  voice: VoiceType;
  language: string;
  keywords?: string;
}

export type Step = 'INPUT' | 'PLANNING' | 'GENERATING_ASSETS' | 'PREVIEW';
