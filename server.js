// server.js

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Render will inject PORT; fallback for local dev
const PORT = process.env.PORT || 10000;

// Hugging Face token from Render "Environment Variables"
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("❌ HF_TOKEN environment variable is missing!");
}

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serves your index.html, etc.

// -------- API ROUTE FOR FRONTEND --------
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  console.log("🔥 /api/generate-image called:", req.body);

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Call Hugging Face Stable Diffusion XL via router
    const apiRes = await fetch(
      "https://router.huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png", // we want an image back
        },
        body: JSON.stringify({
          inputs: prompt, // simple text prompt
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("❌ HF API Error:", apiRes.status, errText);
      return res.status(500).json({
        error: "Hugging Face API error",
        status: apiRes.status,
        details: errText,
      });
    }

    // Get image bytes and convert to base64 for the browser
    const arrayBuffer = await apiRes.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

    return res.json({ imageBase64 });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// -------- START SERVER --------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
