export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  userId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  lastMessage?: string;
  userId: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'groq' | 'openrouter' | 'pollinations' | 'cloudflare' | 'g4f' | 'siliconflow' | 'huggingface';
  type: 'text' | 'image' | 'video' | '3d';
  mirrors?: string[]; // Direct .hf.space URLs
}

export interface UserSettings {
  username?: string;
  customSystemInstruction?: string;
  credits?: {
    groq?: number;
    openrouter?: number;
    pollinations?: number;
    cloudflare?: number;
  };
}

export const MODELS: AIModel[] = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', provider: 'groq', type: 'text' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 (Groq)', provider: 'groq', type: 'text' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'gemini', name: 'Gemini Fast (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'gpt-4', name: 'GPT-4 (G4F)', provider: 'g4f', type: 'text' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus (G4F)', provider: 'g4f', type: 'text' },
  { id: 'flux', name: 'Flux (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-realism', name: 'Flux Realism (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-anime', name: 'Flux Anime (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-3d', name: 'Flux 3D (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'any-dark', name: 'Any Dark (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'turbo', name: 'Turbo (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: '@cf/bytedance/stable-diffusion-xl-lightning', name: 'SDXL Lightning (Cloudflare)', provider: 'cloudflare', type: 'image' },
  { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL Base (Cloudflare)', provider: 'cloudflare', type: 'image' },
  
  // TTV Models with Mirrors
  { 
    id: 'wan-2.1-14b', 
    name: 'Wan 2.1 T2V (14B)', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'wan-ai-wan2-1.hf.space',
      'fffiloni-wan2-1-t2v-14b.hf.space',
      'multimodalart-wan2-1-t2v-14b.hf.space',
      'markury-wan-2-1-t2v-1-3b-lycoris.hf.space',
      'mr2along-wan-2-1-t2v-1-3b-gpu.hf.space',
      'seedofevil-wan2-1-t2v-1-3b-local.hf.space',
      'seokochin-wan2-1-kerala.hf.space',
      'alibaba-pai-wan2-1-fun-1-3b-inp.hf.space',
      'aicoderv2-wan2-1-fun-1-3b-inp.hf.space'
    ]
  },
  { 
    id: 'wan-2.2', 
    name: 'Wan 2.2 T2V', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'wan-ai-wan2-2-t2v-14b.hf.space',
      'wavespeed-wan2-2.static.hf.space',
      'rahul7star-wan2-2-t2v-a14b.hf.space',
      'r3gm-wan2-2-fp8da-aoti-preview.hf.space',
      'r3gm-wan2-2-fp8da-aoti-previewe.hf.space',
      'r3gm-wan2-2-fp8da-aoti-preview2.hf.space'
    ]
  },
  { 
    id: 'cogvideo-x-5b', 
    name: 'CogVideoX-5B', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'thudm-cogvideox-5b.hf.space',
      'fffiloni-cogvideox-5b.hf.space',
      'zai-org-cogvideox-5b-space.hf.space',
      'alibaba-pai-cogvideox-fun-5b.hf.space',
      'zai-org-cogvideox-2b-space.hf.space'
    ]
  },
  { 
    id: 'hunyuan-video', 
    name: 'HunyuanVideo', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'tencent-hunyuanvideo.hf.space',
      'fffiloni-hunyuanvideo.hf.space',
      'smart44-hunyuanvideo.hf.space'
    ]
  },
  { 
    id: 'ltx-video', 
    name: 'LTX-Video', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'lightricks-ltx-video.hf.space',
      'lightricks-ltx-2-3.hf.space',
      'linoyts-ltx-2-3-sync.hf.space',
      'linoyts-ltx-2-3-first-last-frame.hf.space',
      'zerocollabs-ltx-2-3-turbo.hf.space',
      'phamthihong-ltx-2-3-turbo.hf.space',
      'rahul7star-ltx-2-3-turbo.hf.space',
      'iakashpaul-ltx.hf.space',
      'iakashpaul-ltx-fflf.hf.space',
      'mcuo-ltx-2-3-f2lf.hf.space',
      'mcuo-ltx-2-3.hf.space',
      'dagloop5-testing2.hf.space',
      'jblast94-ltx-2-3.hf.space',
      'mcuo-ltx-2-3-sync.hf.space',
      'mario9900-ltx-2-3-sync.hf.space',
      'zontos-ltx-2-3.hf.space',
      'feeday-ltx-2-3.hf.space'
    ]
  },
  { 
    id: 'mochi-1', 
    name: 'Mochi-1', 
    provider: 'huggingface', 
    type: 'video',
    mirrors: [
      'genmo-mochi-1.hf.space',
      'ruslanmv-ai-video-generator.hf.space'
    ]
  },
  {
    id: 'experimental-video',
    name: 'Experimental TTV',
    provider: 'huggingface',
    type: 'video',
    mirrors: [
      'weepiess2383-cfg-zero-star.hf.space',
      'topme-video-generator.hf.space',
      'andypak-wan-video.hf.space',
      'takarajordan-cinediffusion-2.hf.space',
      'alexander00001-private-space-nsfw-t2v-adult.hf.space',
      'aidealab-aidealab-videojp.hf.space',
      'virtualoasis-cinegen.hf.space'
    ]
  },
  
  // 3D Generation Models
  {
    id: 'stable-fast-3d',
    name: 'Stable Fast 3D',
    provider: 'huggingface',
    type: '3d',
    mirrors: [
      'pheerakarn-triposr.hf.space'
    ]
  }
];
