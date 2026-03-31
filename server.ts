import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

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
          headers: {
            'Authorization': `Bearer ${CONFIG.pollinations.apiKey}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `Pollinations API Error: ${response.status}`);
        }
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
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `G4F API Error: ${response.status}`);
        }
        const data = await response.json();
        return res.json({ content: data.choices?.[0]?.message?.content || "No response from G4F" });
      }

      res.status(400).json({ error: "Invalid provider" });
    } catch (error: any) {
      console.error(`Chat Error (${provider}):`, error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.get("/api/image", async (req, res) => {
    const { prompt, modelId, seed } = req.query;
    const s = seed || Math.floor(Math.random() * 1000000);
    const model = (modelId as string) || "flux";
    
    try {
      if (model.startsWith('@cf/')) {
        const url = `https://api.cloudflare.com/client/v4/accounts/${CONFIG.cf.accountId}/ai/run/${model}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.cf.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt, seed: Number(s) })
        });

        if (!response.ok) {
          throw new Error(`Cloudflare Error: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/png');
        return res.send(Buffer.from(buffer));
      }

      // Default to Pollinations
      const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt as string)}?model=${model}&width=1024&height=1024&seed=${s}&nologo=true`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${CONFIG.pollinations.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Pollinations Image Error: ${response.status}`);
      }

      // Pollinations returns the image directly. We can return the URL or the blob.
      // But for simplicity, we can just return the URL if the key can be passed via header.
      // Wait, if it's a direct image URL, we can't easily pass headers in <img> tag.
      // So we might need to proxy the image or use the ?key= param.
      // If we use ?key= in the URL we return to the client, it's exposed.
      // So we should proxy the image.
      
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/png');
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/video", async (req, res) => {
    const { prompt, modelId } = req.body;
    console.log("Video Generation Request:", { prompt, modelId });
    const isHardcoded = CONFIG.siliconflow.apiKey === "sk-sfysaofnkvguyhpwchkkdtxragdnspjvjbwcpdamkswujcrz";
    console.log("Using SiliconFlow Key Source:", isHardcoded ? "Hardcoded Fallback" : "Environment Variable");
    console.log("Using SiliconFlow Key (masked):", CONFIG.siliconflow.apiKey.substring(0, 7) + "...");
    console.log("SiliconFlow Key Length:", CONFIG.siliconflow.apiKey.length);

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

      const responseText = await response.text();
      console.log("SiliconFlow Status:", response.status);
      console.log("SiliconFlow Response Body:", responseText);

      if (!response.ok) {
        throw new Error(`SiliconFlow Error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      // SiliconFlow returns a requestId for async generation
      res.json(data);
    } catch (error: any) {
      console.error("Video Gen Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.get("/api/video/status/:requestId", async (req, res) => {
    const { requestId } = req.params;

    try {
      const response = await fetch(`https://api.siliconflow.cn/v1/video/status?requestId=${requestId}`, {
        headers: {
          'Authorization': `Bearer ${CONFIG.siliconflow.apiKey}`
        }
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error("SiliconFlow Status Error Response:", responseText);
        throw new Error(`SiliconFlow Status Error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error: any) {
      console.error("Video Status Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.get("/api/models", async (req, res) => {
    try {
      const orResponse = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { 'Authorization': `Bearer ${CONFIG.openrouter.apiKey}` }
      });
      const orData = orResponse.ok ? await orResponse.json() : { data: [] };
      
      const groqResponse = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { 'Authorization': `Bearer ${CONFIG.groq.apiKey}` }
      });
      const groqData = groqResponse.ok ? await groqResponse.json() : { data: [] };

      res.json({
        openrouter: orData.data.slice(0, 15),
        groq: groqData.data
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.get("/api/credits", async (req, res) => {
    try {
      const results = await Promise.allSettled([
        fetch("https://api.groq.com/openai/v1/models", {
          headers: { "Authorization": `Bearer ${CONFIG.groq.apiKey}` }
        }).then(r => r.ok ? "Active" : "Error"),
        fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { "Authorization": `Bearer ${CONFIG.openrouter.apiKey}` }
        }).then(r => r.json()),
        fetch(`https://api.cloudflare.com/client/v4/accounts/${CONFIG.cf.accountId}/ai/run/@cf/meta/llama-3-8b-instruct`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${CONFIG.cf.token}` },
          body: JSON.stringify({ prompt: "test" })
        }).then(r => r.ok ? "Active" : "Error")
      ]);

      const credits = [
        {
          provider: "Groq",
          balance: results[0].status === 'fulfilled' ? results[0].value : "Unavailable",
          limit: "Rate Limited",
          usage: "Dynamic"
        },
        {
          provider: "OpenRouter",
          balance: results[1].status === 'fulfilled' && (results[1].value as any).data ? `$${(results[1].value as any).data.usage.toFixed(4)}` : "Unavailable",
          limit: "Prepaid",
          usage: "Usage Based"
        },
        {
          provider: "Cloudflare",
          balance: results[2].status === 'fulfilled' ? results[2].value : "Unavailable",
          limit: "Free Tier",
          usage: "Daily"
        },
        {
          provider: "Pollinations",
          balance: "Unlimited",
          limit: "None",
          usage: "Free"
        }
      ];

      res.json(credits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credits" });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
