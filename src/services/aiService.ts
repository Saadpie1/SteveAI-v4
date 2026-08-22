import { AIModel, Message, MODELS } from "../types";

export async function fetchAvailableModels(): Promise<AIModel[]> {
  // Deep copy so we don't mutate everything globally
  const allModels: AIModel[] = MODELS.map(m => ({ ...m }));
  
  const attemptFetch = async (retries = 2): Promise<AIModel[]> => {
    try {
      const response = await fetch("/api/models/status");
      if (response.ok) {
        const statuses = await response.json();
        
        return allModels.map(m => ({
          ...m,
          status: statuses[m.id] === 'ok' ? 'ok' : 'error'
        }));
      } else {
        console.warn(`Model status API returned ${response.status}`);
      }
    } catch (err) {
      if (retries > 0) {
        console.log(`Retrying model status fetch... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attemptFetch(retries - 1);
      }
      console.error("Failed to fetch model statuses after retries:", err);
    }
    
    // Fallback if status fetch fails
    return allModels.map(m => ({ ...m, status: 'ok' }));
  };

  return attemptFetch();
}

export async function generateImage(prompt: string, modelId: string = 'flux'): Promise<string | null> {
  const seed = Math.floor(Math.random() * 1000000);
  // Route through server to protect API key
  const imageUrl = `/api/image?prompt=${encodeURIComponent(prompt)}&modelId=${modelId}&width=1024&height=1024&seed=${seed}&nologo=true`;
  return imageUrl;
}

export async function generateVideo(prompt: string, modelId: string): Promise<{ requestId: string }> {
  const response = await fetch("/api/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, modelId })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Video API Error: ${response.status}`);
  }

  return response.json();
}

export async function getVideoStatus(requestId: string): Promise<{ status: string, video_url?: string, message?: string }> {
  const response = await fetch(`/api/video/status/${requestId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Video Status API Error: ${response.status}`);
  }

  const data = await response.json();
  // SiliconFlow status response mapping
  return {
    status: data.status, // 'SUCCEED', 'FAILED', 'PROCESSING', 'QUEUED'
    video_url: data.video_url,
    message: data.message
  };
}

export async function getChatResponse(
  message: any, 
  model: AIModel, 
  history: Message[] = [], 
  systemInstruction?: string,
  openrouterApiKey?: string
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: model.provider,
      modelId: model.id,
      message: message,
      history: history.map(m => ({ role: m.role, content: m.content })),
      systemInstruction: systemInstruction,
      openrouterApiKey: openrouterApiKey
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.content;
}
