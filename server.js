import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// We are reusing GEMINI_API_KEY env variable to store your Hugging Face token
const HF_TOKEN = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API route the frontend calls
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    // Call Hugging Face Stable Diffusion using new Router endpoint
const apiRes = await fetch(
  "https://router.huggingface.co/models/stabilityai/stable-diffusion-2-1",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  }
);

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Hugging Face error:", apiRes.status, errText);
      return res
        .status(500)
        .json({ error: "Hugging Face API error", details: errText });
    }

    // Get image bytes and convert to base64
    const arrayBuffer = await apiRes.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

    return res.json({ imageBase64 });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
