import { AIModel, Message, MODELS } from "../types";

export async function fetchAvailableModels(): Promise<AIModel[]> {
  const allModels: AIModel[] = [...MODELS];
  
  try {
    const response = await fetch("/api/models");
    if (response.ok) {
      const data = await response.json();
      
      const orModels = data.openrouter.map((m: any) => ({
        id: m.id,
        name: `${m.name} (OpenRouter)`,
        provider: 'openrouter',
        type: 'text'
      }));
      
      const groqModels = data.groq.map((m: any) => ({
        id: m.id,
        name: `${m.id} (Groq)`,
        provider: 'groq',
        type: 'text'
      }));
      
      allModels.push(...orModels, ...groqModels);
    }
  } catch (err) {
    console.error("Failed to fetch dynamic models:", err);
  }

  // Remove duplicates by ID
  return allModels.filter((model, index, self) =>
    index === self.findIndex((t) => t.id === model.id)
  );
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

export async function getChatResponse(userMessage: string, model: AIModel, systemInstruction?: string): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: model.provider,
        modelId: model.id,
        message: userMessage,
        systemInstruction: systemInstruction
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return `Error: ${error.message || "Failed to get response from AI"}`;
  }
}
