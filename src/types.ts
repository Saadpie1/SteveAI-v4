export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  userId: string;
  imageUrl?: string;
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
  provider: 'groq' | 'pollinations' | 'cloudflare' | 'g4f' | 'siliconflow' | 'huggingface' | 'together' | 'mistral' | 'gemini' | 'sambanova' | 'cohere' | 'antigravity' | 'openrouter';
  type: 'text' | 'image' | 'video' | '3d';
  mirrors?: string[]; // Direct .hf.space URLs
  status?: 'ok' | 'error';
  vision?: boolean;
}

export interface UserSettings {
  uid?: string;
  email?: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
  dob?: string;
  bio?: string;
  location?: string;
  role?: string;
  customSystemInstruction?: string;
  openrouterApiKey?: string;
  credits?: {
    groq?: number;
    pollinations?: number;
    cloudflare?: number;
  };
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: AgentToolCall[];
  tool_call_id?: string;
  name?: string;
  timestamp?: number;
  userId?: string;
  id?: string;
}

export interface AgentToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export const MODELS: AIModel[] = [
  // SambaNova Models (Fast & Free Tier!)
  { id: 'DeepSeek-V3.1', name: 'DeepSeek V3.1 (SambaNova)', provider: 'sambanova', type: 'text' },
  { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (SambaNova)', provider: 'sambanova', type: 'text' },
  { id: 'Llama-4-Maverick-17B-128E-Instruct', name: 'Llama 4 Maverick 17B (SambaNova)', provider: 'sambanova', type: 'text' },
  { id: 'gemma-3-12b-it', name: 'Gemma 3 12B IT (SambaNova)', provider: 'sambanova', type: 'text' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B (SambaNova)', provider: 'sambanova', type: 'text' },

  // Cohere Models (Free Tier)
  { id: 'command-r-08-2024', name: 'Command R (Cohere)', provider: 'cohere', type: 'text' },
  { id: 'command-r-plus-08-2024', name: 'Command R+ (Cohere)', provider: 'cohere', type: 'text' },

  // Gemini Models (Free tier via Google Gen AI!)
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', type: 'text', vision: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', type: 'text', vision: true },
  { id: 'gemini-2.5-flash', name: 'SteveAI Neural Hub', provider: 'gemini', type: 'text', vision: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', type: 'text', vision: true },
  { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite', provider: 'gemini', type: 'text', vision: true },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite (Antigravity)', provider: 'antigravity', type: 'text' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Antigravity)', provider: 'antigravity', type: 'text' },
  { id: 'gemini-1.5-pro-latest-image', name: 'Gemini 1.5 Pro Vision', provider: 'gemini', type: 'image' },
  
  // Groq Models
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Groq)', provider: 'groq', type: 'text' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Groq)', provider: 'groq', type: 'text' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', provider: 'groq', type: 'text' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT (Groq)', provider: 'groq', type: 'text' },
  { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B (Groq)', provider: 'groq', type: 'text' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Groq)', provider: 'groq', type: 'text' },

  // Pollinations Text Models
  { id: 'qwen-coder', name: 'Qwen Coder (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'nova-fast', name: 'Nova Fast (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'gpt-oss', name: 'GPT OSS (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'openai', name: 'OpenAI (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'command-a-plus', name: 'Command A+ (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'openai-fast', name: 'OpenAI Fast (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'gpt-5.4-mini', name: 'GPT 5.4 Mini (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'midijourney', name: 'Midijourney (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'llama', name: 'Llama (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'muse-glimmer', name: 'Muse Glimmer (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'grok', name: 'Grok (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'nemotron-3.5-lightning', name: 'Nemotron 3.5 Lightning (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'mistral-large', name: 'Mistral Large (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'deepseek', name: 'DeepSeek (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'minimax-m2.7', name: 'Minimax M2.7 (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'minimax', name: 'Minimax (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'gpt-5.6-luna', name: 'GPT 5.6 Luna (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'nova', name: 'Nova (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'grok-large', name: 'Grok Large (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'perplexity-fast', name: 'Perplexity Fast (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'deepseek-pro', name: 'DeepSeek Pro (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'midijourney-large', name: 'Midijourney Large (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'gpt-5.6-terra', name: 'GPT 5.6 Terra (Pollinations)', provider: 'pollinations', type: 'text' },
  { id: 'kimi', name: 'Kimi (Pollinations)', provider: 'pollinations', type: 'text' },

  // Together AI Models
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B (Together)', provider: 'together', type: 'text' },
  { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B (Together)', provider: 'together', type: 'text' },
  { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B (Together)', provider: 'together', type: 'text' },

  // Mistral AI Models
  { id: 'mistral-large-latest', name: 'Mistral Large (Mistral)', provider: 'mistral', type: 'text' },
  { id: 'mistral-small-latest', name: 'Mistral Small (Mistral)', provider: 'mistral', type: 'text' },
  { id: 'pixtral-large-latest', name: 'Pixtral Large (Mistral)', provider: 'mistral', type: 'text', vision: true },

  // G4F Models
  { id: 'srv_mkoloq41e34074b6133e:openai-fast', name: 'OpenAI Fast (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkoloq41e34074b6133e:openai', name: 'OpenAI (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkol5tgcd33cc358ddbc:models/gemini-2.5-flash', name: 'Gemini 2.5 Flash (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkombumpae45db46dcb8:meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkombumpae45db46dcb8:deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mnkjel2208cf770e5009:deepseek-v4-pro', name: 'DeepSeek V4 Pro (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mnkjel2208cf770e5009:qwen3-next:80b', name: 'Qwen3 Next 80B (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkomfko63371049b6da6:claude-opus-4.7', name: 'Claude Opus 4.7 (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mnkjel2208cf770e5009:deepseek-v3.1:671b', name: 'DeepSeek V3.1 671B (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkol5tgcd33cc358ddbc:models/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mlv668eaa6d92f50ff10:gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite Alt (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkoloq41e34074b6133e:claude-fast', name: 'Claude Fast (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkomfko63371049b6da6:unmoderated-gpt', name: 'Unmoderated GPT (G4F)', provider: 'g4f', type: 'text' },
  { id: 'srv_mkom688d57c76d8a3542:openai/gpt-oss-120b', name: 'GPT OSS 120B (G4F)', provider: 'g4f', type: 'text' },
  { id: 'auto', name: 'Auto Failsafe (G4F)', provider: 'g4f', type: 'text' },

  // Cloudflare Text Models
  { id: '@cf/deepseek-ai/deepseek-math-7b-instruct', name: 'DeepSeek Math 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/defog/sqlcoder-7b-2', name: 'SQLCoder 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/fblgit/una-cybertron-7b-v2-bf16', name: 'Cybertron 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/google/gemma-7b-it-lora', name: 'Gemma 7B LoRA (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/google/gemma-2b-it-lora', name: 'Gemma 2B LoRA (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/google/gemma-7b-it', name: 'Gemma 7B HF (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/meta-llama/llama-2-7b-chat-hf-lora', name: 'Llama 2 7B LoRA (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/microsoft/phi-2', name: 'Phi-2 (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/mistral/mistral-7b-instruct-v0.2', name: 'Mistral 7B HF (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/mistral/mistral-7b-instruct-v0.2-lora', name: 'Mistral 7B LoRA (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/nexusflow/starling-lm-7b-beta', name: 'Starling LM 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/nousresearch/hermes-2-pro-mistral-7b', name: 'Hermes 2 Pro (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/openchat/openchat-3.5-0106', name: 'OpenChat 3.5 (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/qwen/qwen1.5-1.8b-chat', name: 'Qwen 1.5 1.8B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B AWQ (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/qwen/qwen1.5-7b-chat-awq', name: 'Qwen 1.5 7B AWQ (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/qwen/qwen1.5-0.5b-chat', name: 'Qwen 1.5 0.5B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/thebloke/discolm-german-7b-v1-awq', name: 'DiscoLM German 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/deepseek-coder-6.7b-instruct-awq', name: 'DeepSeek Coder Instruct (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/deepseek-coder-6.7b-base-awq', name: 'DeepSeek Coder Base (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/llamaguard-7b-awq', name: 'LlamaGuard 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/neural-chat-7b-v3-1-awq', name: 'Neural Chat 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq', name: 'OpenHermes 2.5 (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/llama-2-13b-chat-awq', name: 'Llama 2 13B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/mistral-7b-instruct-v0.1-awq', name: 'Mistral 7B v0.1 (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@hf/thebloke/zephyr-7b-beta-awq', name: 'Zephyr 7B Beta (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/tiiuae/falcon-7b-instruct', name: 'Falcon 7B (Cloudflare)', provider: 'cloudflare', type: 'text' },
  { id: '@cf/tinyllama/tinyllama-1.1b-chat-v1.0', name: 'TinyLlama 1.1B (Cloudflare)', provider: 'cloudflare', type: 'text' },

  // Image Models
  { id: 'flux', name: 'Flux (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-realism', name: 'Flux Realism (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-anime', name: 'Flux Anime (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'flux-3d', name: 'Flux 3D (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'any-dark', name: 'Any Dark (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'turbo', name: 'Turbo (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'midjourney', name: 'Midjourney Style (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: 'dall-e-3', name: 'DALL-E 3 Style (Pollinations)', provider: 'pollinations', type: 'image' },
  { id: '@cf/bytedance/stable-diffusion-xl-lightning', name: 'SDXL Lightning (Cloudflare)', provider: 'cloudflare', type: 'image' },
  { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL Base (Cloudflare)', provider: 'cloudflare', type: 'image' },
  { id: 'together/black-forest-labs/FLUX.1-schnell-Free', name: 'FLUX.1 Schnell Free (Together)', provider: 'together', type: 'image' },
  { id: 'together/stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL Base (Together)', provider: 'together', type: 'image' },
  { id: 'siliconflow/black-forest-labs/FLUX.1-schnell', name: 'FLUX.1 Schnell (SiliconFlow)', provider: 'siliconflow', type: 'image' },
  { id: 'siliconflow/stabilityai/stable-diffusion-3-5-large', name: 'SD 3.5 Large (SiliconFlow)', provider: 'siliconflow', type: 'image' },
  
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
  { id: 'stable-fast-3d', name: 'Stable Fast 3D', provider: 'huggingface', type: '3d', mirrors: ['pheerakarn-triposr.hf.space'] },
  
  // OpenRouter Free Models
  { id: 'stealth/ox-alpha', name: 'Ox Alpha (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'dots-studio/dots-3-note-preview:free', name: 'Dots 3 Note (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'liquid/lfm-2.5-2.6b:free', name: 'LFM 2.5 2.6B (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron 3.5 Lightning (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'thinkingmachines/inkling-small:free', name: 'Inkling Small (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1 (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'thinkingmachines/inkling:free', name: 'Inkling (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'cohere/north-mini-code:free', name: 'North Mini Code (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'z-ai/glm-5.2:free', name: 'GLM 5.2 (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'nvidia/nemotron-3.5-content-safety:free', name: 'Nemotron 3.5 Safety (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra 550B (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'Nemotron 3 Nano Reasoning (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B IT (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B IT (OpenRouter)', provider: 'openrouter', type: 'text' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B (OpenRouter)', provider: 'openrouter', type: 'text' }
];
