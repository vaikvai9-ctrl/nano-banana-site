import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

const HF_TOKEN = process.env.HF_TOKEN;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required!" });
  }

  console.log("🔥 /api/generate-image called:", { prompt });

  try {
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
      console.log("❌ HF API Error:", apiRes.status);
      return res.status(500).json({ error: "HF API error", status: apiRes.status });
    }

    const arrayBuffer = await apiRes.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

    return res.json({ imageBase64 });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
