import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    // Call Gemini IMAGE model (not text model)
    const apiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/image-lt:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await apiRes.json();
    console.log("Gemini response (short):", JSON.stringify(data).slice(0, 400));

    let imageBase64 = null;
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    for (const part of parts) {
      // Normal image response
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        break;
      }
      // Fallback: image as data URL text
      if (typeof part.text === "string" && part.text.startsWith("data:image")) {
        imageBase64 = part.text.split(",")[1];
        break;
      }
    }

    if (!imageBase64) {
      return res.status(500).json({ error: "No image in Gemini response", raw: data });
    }

    // Frontend expects "imageBase64"
    res.json({ imageBase64 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
