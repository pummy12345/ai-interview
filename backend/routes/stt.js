import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { createClient } from "@deepgram/sdk";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

function isIndianLanguage(language) {
  return language === "kn-IN" || language === "hi-IN";
}

router.post("/stt", upload.single("audio"), async (req, res) => {
  try {
    const language = req.body.language || "en-IN";

    if (!req.file) {
      return res.status(400).json({ error: "Audio file missing" });
    }

    // ✅ Kannada / Hindi → Sarvam AI
    if (isIndianLanguage(language)) {
      const formData = new FormData();

      formData.append("file", req.file.buffer, {
        filename: "audio.webm",
        contentType: req.file.mimetype,
      });

      formData.append("model", "saaras:v3");
      formData.append("language_code", language);

      const response = await axios.post(
        "https://api.sarvam.ai/speech-to-text",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "api-subscription-key": process.env.SARVAM_API_KEY,
          },
        }
      );

      return res.json({
        provider: "sarvam",
        language,
        transcript:
          response.data.transcript ||
          response.data.text ||
          response.data.transcription ||
          "",
      });
    }

    // ✅ English → Deepgram
    const { result, error } =
      await deepgram.listen.prerecorded.transcribeFile(req.file.buffer, {
        model: "nova-2",
        language: "en-IN",
        smart_format: true,
      });

    if (error) {
      throw error;
    }

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return res.json({
      provider: "deepgram",
      language,
      transcript,
    });
  } catch (error) {
    console.error("STT error:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Speech-to-text failed",
      details: error.response?.data || error.message,
    });
  }
});

export default router;