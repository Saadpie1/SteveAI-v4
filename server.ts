import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { createServer as createHttpServer } from "http";
import { GoogleGenAI, Modality } from "@google/genai";
import { STEVE_SYSTEM_INSTRUCTION } from "./src/constants";
import { app } from "./api/index.js";

dotenv.config();

const cleanApiKey = (key: string | undefined) => {
  if (!key) return "";
  let k = key.trim();
  if (k.includes('API_KEY=')) {
    const parts = k.split('API_KEY=');
    k = parts[parts.length - 1].trim();
  }
  k = k.replace(/^(Bearer\s+)/i, '');
  k = k.replace(/^["']+|["']+$/g, '');
  return k;
};

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    let key = cleanApiKey(process.env.GEMINI_API_KEY);
    if (!key && process.env.EXTERNAL_GEMINI_API_URL && !process.env.EXTERNAL_GEMINI_API_URL.startsWith("http")) {
      key = cleanApiKey(process.env.EXTERNAL_GEMINI_API_URL);
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const PORT = 3000;

async function startServer() {
  const httpServer = createHttpServer(app);

  // Gemini Live WebSocket Bridge (for full persistent server environments)
  const wss = new WebSocketServer({ server: httpServer, path: "/api/live" });

  wss.on("connection", async (clientWs) => {
    console.log("Neural link requested via bridge...");
    let session: any = null;

    try {
      const ai = getGeminiClient();
      const apiKey = cleanApiKey(process.env.GEMINI_API_KEY);
      
      if (!apiKey) {
        throw new Error("Neural Link Error: GEMINI_API_KEY is missing or invalid in server environment.");
      }

      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
             console.log("Gemini Live session opened successfully.");
             clientWs.send(JSON.stringify({ type: 'open' }));
          },
          onmessage: (message: any) => {
            clientWs.send(JSON.stringify(message));
          },
          onclose: (event: any) => {
            console.log("Gemini Live session closed by server. Event reason:", event?.reason || "No reason provided");
            const reason = event?.reason || "Neural Link was severed by the remote host.";
            clientWs.send(JSON.stringify({ type: 'close', reason }));
            clientWs.close();
          },
          onerror: (err: any) => {
            const errorMessage = err.message || (err.error ? err.error.message : null) || JSON.stringify(err) || "Unknown internal error";
            console.error("Gemini Live Bridge Internal Error:", errorMessage);
            clientWs.send(JSON.stringify({ 
              type: 'error', 
              message: `Neural Link Synchronization Failure: ${errorMessage}` 
            }));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: {
            parts: [{ text: STEVE_SYSTEM_INSTRUCTION }]
          },
        }
      });

      clientWs.on("message", (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.realtimeInput) {
            session.sendRealtimeInput(data.realtimeInput);
          } else if (data.toolResponse) {
            session.sendToolResponse(data.toolResponse);
          }
        } catch (e) {
          console.error("Failed to parse client message:", e);
        }
      });

      clientWs.on("close", () => {
        if (session) session.close();
      });

    } catch (err: any) {
      console.error("Failed to establish neural link bridge:", err);
      clientWs.send(JSON.stringify({ type: 'error', message: err.message }));
      clientWs.close();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in a Vercel serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
