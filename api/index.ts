import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  cf: {
    accountId: process.env.CF_ACCOUNT_ID || "ac73028e2d0141fe300f1e9b37e29485",
    token: process.env.CF_TOKEN || "cfut_P7JIBJxXemwlaef8hvqSAohLOfxOr36SPIpqZ3L36ac14b03",
  },
  pollinations: {
    apiKey: process.env.POLLINATIONS_API_KEY || "sk_GPIaqPVYmvtCkIZlDdpM6teovDHu6DGk",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || "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"
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "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"
  },
  g4f: {
    apiKey: process.env.G4F_API_KEY || "g4f_u_mm0nf9_b0d03c0f02970cd1cc4339ee909ee3d5c208d3d7e9d0d353_5daddaa1"
  },
  siliconflow: {
    apiKey: (process.env.SILICONFLOW_API_KEY || "sk-sfysaofnkvguyhpwchkkdtxragdnspjvjbwcpdamkswujcrz").trim()
  }
};

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.post("/api/chat", async (req, res) => {
  const { provider, modelId, message, systemInstruction } = req.body;
  try {
    const baseSystem = "You are SteveAI, a highly advanced AI orchestrator made by saadpie, Ahmed Aftab, and Shawaiz Ali. You are helpful, creative, and technically precise.";
    const finalSystem = systemInstruction ? `${baseSystem}\n\nUser's Custom Instructions: ${systemInstruction}` : baseSystem;

    if (provider === 'groq') {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: finalSystem },
            { role: "user", content: message }
          ],
          temperature: 0.7
        })
      });
      const data = await response.json();
      return res.json({ content: data.choices?.[0]?.message?.content || "No response from Groq" });
    }

    if (provider === 'openrouter') {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.openrouter.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'SteveAI Orchestrator'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: finalSystem },
            { role: "user", content: message }
          ]
        })
      });
      const data = await response.json();
      return res.json({ content: data.choices?.[0]?.message?.content || "No response from OpenRouter" });
    }

    if (provider === 'pollinations') {
      const url = `https://text.pollinations.ai/${encodeURIComponent(message)}?model=gemini&json=true&system=${encodeURIComponent(finalSystem)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${CONFIG.pollinations.apiKey}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Pollinations API Error: ${response.status}`);
      return res.json({ content: data.choices?.[0]?.message?.content || data.content || JSON.stringify(data) });
    }

    if (provider === 'g4f') {
      const response = await fetch("https://api.g4f.ai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.g4f.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: finalSystem },
            { role: "user", content: message }
          ]
        })
      });
      const data = await response.json();
      return res.json({ content: data.choices?.[0]?.message?.content || "No response from G4F" });
    }
    res.status(400).json({ error: "Invalid provider" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.get("/api/image", async (req, res) => {
  const { prompt, modelId, seed } = req.query;
  const s = seed || Math.floor(Math.random() * 1000000);
  const model = (modelId as string) || "flux";
  
  try {
    if (model.startsWith('@cf/')) {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.cf.accountId}/ai/run/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.cf.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, seed: Number(s) })
      });
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      return res.send(Buffer.from(buffer));
    }

    const response = await fetch(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt as string)}?model=${model}&width=1024&height=1024&seed=${s}&nologo=true`, {
      headers: { 'Authorization': `Bearer ${CONFIG.pollinations.apiKey}` }
    });
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/png');
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post("/api/video", async (req, res) => {
  const { prompt, modelId } = req.body;
  try {
    const response = await fetch("https://api.siliconflow.cn/v1/video/submit", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.siliconflow.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId || "Wan-AI/Wan2.1-T2V-14B",
        prompt: prompt
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.get("/api/video/status/:requestId", async (req, res) => {
  const { requestId } = req.params;
  try {
    const response = await fetch(`https://api.siliconflow.cn/v1/video/status?requestId=${requestId}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.siliconflow.apiKey}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.get("/api/models", async (req, res) => {
  try {
    const orResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { 'Authorization': `Bearer ${CONFIG.openrouter.apiKey}` }
    });
    const orData = await orResponse.json();
    const groqResponse = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { 'Authorization': `Bearer ${CONFIG.groq.apiKey}` }
    });
    const groqData = await groqResponse.json();
    res.json({ openrouter: orData.data?.slice(0, 15) || [], groq: groqData.data || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// IMPORTANT: Export for Vercel
export default app;
  
