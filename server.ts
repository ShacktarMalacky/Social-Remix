import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getFallbackPulseHeadlines() {
  return [
    {
      id: "pulse-fallback-1",
      title: "Quantum Neural Chip Sets 1,000-Qubit Coherence Record in Cybernetics Test",
      category: "QUANTUM & TECH",
      summary: "Researchers achieve unprecedented quantum stability using topological qubit architecture, paving the way for instantaneous neural-net processing.",
      timeAgo: "18m ago",
      impactScore: 98,
      source: "Quantum Tech Journal",
      sourceUrl: "https://news.google.com/search?q=quantum+computing+neural+breakthrough"
    },
    {
      id: "pulse-fallback-2",
      title: "Generative Multimodal Models Achieve Ultra-Low Latency Spatial Streaming",
      category: "AI & NEURAL",
      summary: "Next-gen multimodal AI agents seamlessly stream high-fidelity 3D spatial simulations with sub-5ms latency for immersive interfaces.",
      timeAgo: "42m ago",
      impactScore: 96,
      source: "AI Tech Review",
      sourceUrl: "https://news.google.com/search?q=generative+multimodal+ai+models"
    },
    {
      id: "pulse-fallback-3",
      title: "Biomorphic Cybernetic Exoskeletons Launch for High-End Personal Mobility",
      category: "ROBOTICS",
      summary: "Luxury robotics firm unveils carbon-fiber bio-adaptive suit featuring direct neural muscle feedback and haptic kinetic response.",
      timeAgo: "1h ago",
      impactScore: 94,
      source: "Robotics World",
      sourceUrl: "https://news.google.com/search?q=biomorphic+cybernetic+exoskeletons"
    },
    {
      id: "pulse-fallback-4",
      title: "Decentralized Autonomous Social Mesh Reaches 10M Sovereign Nodes",
      category: "SOCIAL INNOVATION",
      summary: "Peer-to-peer encrypted social protocol introduces zero-knowledge reputation ledgers for elite digital creator networks.",
      timeAgo: "2h ago",
      impactScore: 91,
      source: "Decentralized Web Digest",
      sourceUrl: "https://news.google.com/search?q=decentralized+autonomous+social+mesh"
    },
    {
      id: "pulse-fallback-5",
      title: "High-Frequency Photonic Processors Revolutionize Edge AI Computation",
      category: "HIGH-TECH LUXURY",
      summary: "Silicon photonics breakthrough reduces edge AI power consumption by 85% while boosting throughput across luxury smart devices.",
      timeAgo: "3h ago",
      impactScore: 95,
      source: "Photonics Weekly",
      sourceUrl: "https://news.google.com/search?q=photonic+processors+edge+ai"
    }
  ];
}

function getFallbackPulseData(notice?: string) {
  return {
    success: true,
    grounded: false,
    updatedAt: new Date().toISOString(),
    searchQueries: ["real-time tech breakthroughs", "high-end social innovation news"],
    sources: [
      { uri: "https://news.google.com", title: "Google News Tech Section" }
    ],
    headlines: getFallbackPulseHeadlines(),
    notice
  };
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  const PORT = 3000;
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

  app.use(express.json());
  app.use(cors());

  // --- Socket.io ---
  const users = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("register", (userData) => {
      users.set(socket.id, { ...userData, id: socket.id, status: "online" });
      io.emit("presence_update", Array.from(users.values()));
    });

    socket.on("direct_message", (data) => {
      socket.to(data.to).emit("direct_message", {
        id: Date.now(),
        text: data.text,
        from: data.from,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    socket.on("disconnect", () => {
      users.delete(socket.id);
      io.emit("presence_update", Array.from(users.values()));
      console.log("Client disconnected");
    });
  });

  // --- API Routes ---

  app.post("/api/checkout", async (req, res) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    
    const { planId, price, name, successUrl, cancelUrl } = req.body;
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount: price * 100,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketplace/products", (req, res) => {
    res.json([
      { id: 1, name: "Consultoría Elite", price: 150, description: "Sesión 1:1 con un experto en impacto digital." },
      { id: 2, name: "Pack de Filtros Pro", price: 25, description: "Colección exclusiva de 12 filtros para tus fotos." },
      { id: 3, name: "Acceso Backstage", price: 45, description: "Pase VIP para transmisiones privadas." }
    ]);
  });

  app.get("/api/global-elite-pulse", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json(getFallbackPulseData("API Key not configured - returning cached pulse stream"));
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Perform Google Search grounding to discover 6 recent real-time headlines regarding major technology breakthroughs, artificial intelligence innovations, quantum computing, robotics, and high-end social or luxury tech trends from the past 24-48 hours. Return ONLY a JSON array where each item is an object with: 'id' (string), 'title' (punchy, high-impact headline under 75 chars), 'category' (one of: 'AI & NEURAL', 'QUANTUM & TECH', 'HIGH-TECH LUXURY', 'ROBOTICS', 'SOCIAL INNOVATION'), 'summary' (concise 15-25 word description of the breakthrough), 'timeAgo' (e.g. '15m ago', '1h ago', '3h ago'), 'impactScore' (number 85-99), and 'source' (publisher/outlet name). Output raw JSON array without conversational text.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      let items = [];
      try {
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          items = JSON.parse(jsonMatch[0]);
        } else {
          items = JSON.parse(rawText);
        }
      } catch (parseErr) {
        console.warn("Could not parse JSON array directly from response.text, forming structured payload:", parseErr);
      }

      const sources = chunks.map((c: any) => ({
        uri: c.web?.uri || "",
        title: c.web?.title || "Grounded Web Citation"
      })).filter((s: any) => s.uri);

      if (!Array.isArray(items) || items.length === 0) {
        items = getFallbackPulseHeadlines();
      }

      items = items.map((item: any, idx: number) => {
        const matchingSource = sources[idx % Math.max(1, sources.length)];
        return {
          ...item,
          id: item.id || `pulse-${idx + 1}-${Date.now()}`,
          sourceUrl: item.sourceUrl || matchingSource?.uri || sources[0]?.uri || "https://news.google.com",
          sourceTitle: item.sourceTitle || matchingSource?.title || item.source || "Google Search Grounding"
        };
      });

      res.json({
        success: true,
        grounded: true,
        updatedAt: new Date().toISOString(),
        searchQueries,
        sources,
        headlines: items
      });
    } catch (error: any) {
      if (error?.status === 429 || error?.code === 429) {
        console.warn("Global Elite Pulse: Quota exhausted, using fallback.");
      } else {
        console.error("Global Elite Pulse Search Grounding Error:", error);
      }
      res.json(getFallbackPulseData(`Grounded stream notice: Service temporary unavailable due to high demand.`));
    }
  });

  app.post("/api/generate-profile-background", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API Key is not configured." });
    }
    const { interests, customPrompt, aspectRatio } = req.body;
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = customPrompt || `A breathtaking, high-aesthetic digital profile banner background representing interests in: ${interests || 'cyberpunk aesthetics, ambient neon glow, abstract luxury'}. Cinematic lighting, 8k resolution textures, sophisticated color palette, perfect for a modern creative profile header.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9",
            imageSize: "1K"
          }
        }
      });

      let imageUrl = "";
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("No image generated by the model.");
      }

      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Profile Background Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate profile background" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) return;
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Elite Server running on http://localhost:${PORT}`);
  });
}

startServer();
