import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import Groq from "groq-sdk";
import { DeepgramClient } from "@deepgram/sdk";

import questionBank from "./questionBank.js";
import InterviewResult from "./models/InterviewResult.js";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* =========================
   CLIENTS
========================= */

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const deepgram = process.env.DEEPGRAM_API_KEY
  ? new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY })
  : null;

/* =========================
   MODELS
========================= */

const interviewRecordSchema = new mongoose.Schema(
  {
    id: String,
    candidate: Object,
    candidateFingerprint: String,

    language: String,
    district: String,
    skill: String,
    trade: String,

    averageScore: Number,
    relevanceScore: Number,
    completenessScore: Number,
    clarityScore: Number,
    confidenceScore: Number,

    integritySummary: Object,
    answers: Array,

    attemptCount: Number,
    repeatedAttempt: Boolean,

    submittedAt: String,

    decision: String,
    decisionExplanation: String,
    category: String,
    skillCategory: String,
    confidenceBand: String,
    flaggedReasons: Array,
  },
  { timestamps: true }
);

const InterviewRecord =
  mongoose.models.InterviewRecord ||
  mongoose.model("InterviewRecord", interviewRecordSchema);

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
      district: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    default: "",
  },

  skills: {
    type: [String],
    required: true,
    default: [],
  },

  selectedSkill: {
    type: String,
    default: null,
  },

  preferredLanguage: {
    type: String,
    enum: ["en", "hi", "kn"],
    default: "en",
  },

  deviceId: {
    type: String,
    default: "",
  },

  totalInterviews: {
    type: Number,
    default: 0,
  },

  averageScore: {
    type: Number,
    default: 0,
  },

  lastInterviewScore: {
    type: Number,
    default: 0,
  },

  repeatedAttempts: {
    type: Number,
    default: 0,
  },

  flagged: {
    type: Boolean,
    default: false,
  },

  flaggedReasons: {
    type: [String],
    default: [],
  },

  role: {
    type: String,
    enum: ["candidate", "employee", "admin"],
    default: "candidate",
  },
    },
  { timestamps: true }
);
userSchema.index({ deviceId: 1 });

const Candidate =
  mongoose.models.Candidate ||
  mongoose.model("Candidate", userSchema);
/* =========================
   CONSTANTS
========================= */

const TOTAL_QUESTIONS = 5;
const sessions = new Map();

const commonQuestions = {
  en: "Tell me about yourself and your recent work experience.",
  hi: "अपने बारे में बताएं और आपने हाल ही में किस तरह का काम किया है।",
  kn: "ನಿಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ನೀವು ಇತ್ತೀಚೆಗೆ ಮಾಡಿದ ಕೆಲಸದ ಬಗ್ಗೆ ಹೇಳಿ.",
};

const skillBuckets = {
  blueCollar: [
    "driver",
    "electrician",
    "electrical technician",
    "plumbing",
    "plumber",
    "carpentry",
    "carpenter",
    "masonry",
    "mason",
    "construction",
    "construction helper",
    "warehouse",
    "warehouse operations",
    "hvac",
    "hvac technician",
  ],
  polytechnic: [
    "diploma mechanical",
    "diploma",
    "mechanical",
    "technician",
    "machine operator",
    "operator",
    "maintenance",
    "production",
  ],
  semiSkilled: [
    "retail",
    "retail associate",
    "store",
    "sales",
    "helper",
    "packing",
    "delivery",
    "field",
    "loader",
  ],
};

/* =========================
   HELPERS
========================= */

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveSkillKey(skill = "") {
  const normalized = normalizeText(skill);

  const skillMap = {
    "warehouse operations": "Warehouse operations",
    "electrical technician": "Electrical technician",
    driver: "Driver",
    "construction helper": "Construction helper",
    "machine operator": "Machine operator",
    "retail associate": "Retail associate",
    "diploma mechanical": "Diploma mechanical",
    plumbing: "Plumbing",
    carpentry: "Carpentry",
    masonry: "Masonry",
    "hvac technician": "HVAC Technician",
  };

  return skillMap[normalized] || skill;
}
function titleCase(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function resolveLanguage(language) {
  const normalized = normalizeText(language);

  if (["hi", "hi-in", "hindi", "हिंदी"].includes(normalized)) return "hi-IN";
  if (["kn", "kn-in", "kannada", "ಕನ್ನಡ"].includes(normalized)) return "kn-IN";
  if (["en", "en-in", "english", "english india"].includes(normalized)) return "en-IN";

  return "en-IN";
}

function questionLanguageKey(language) {
  const lang = String(language || "")
    .trim()
    .toLowerCase();

  if (
    lang === "hi" ||
    lang === "hi-in" ||
    lang.includes("hindi")
  ) {
    return "hi";
  }

  if (
    lang === "kn" ||
    lang === "kn-in" ||
    lang.includes("kannada")
  ) {
    return "kn";
  }

  return "en";
}

function languageName(language) {
  if (language === "hi-IN") return "Hindi";
  if (language === "kn-IN") return "Kannada";
  return "English";
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function normalizeAadhar(aadharNumber) {
  return String(aadharNumber || "").replace(/\D/g, "");
}

function normalizeCandidate(candidate = {}, language = "en-IN") {
  const skill = candidate.skill || candidate.trade || "Warehouse operations";

  return {
    name: titleCase(candidate.name || "Unknown Candidate"),
    phone: normalizePhone(candidate.phone),
    district: titleCase(candidate.district || "Unassigned"),
    skill,
    trade: candidate.trade || skill,
    deviceId: String(candidate.deviceId || "").trim(),
    language,
  };
}

function shuffleArray(items = []) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getQuestionList(skill, language) {
  const lang = questionLanguageKey(language);
  const skillKey = resolveSkillKey(skill);

  return (
    questionBank[skillKey]?.[lang] ||
    questionBank[skillKey]?.en ||
    questionBank["Warehouse operations"]?.[lang] ||
    questionBank["Warehouse operations"]?.en ||
    []
  );
}

function getInterviewQuestions(skill, language) {
  const lang = questionLanguageKey(language);
  const allQuestions = getQuestionList(skill, language);

  const skillQuestions = allQuestions.filter(
    (question) => question !== commonQuestions[lang]
  );

  const selectedSkillQuestions = shuffleArray(skillQuestions).slice(
    0,
    TOTAL_QUESTIONS - 1
  );

  while (selectedSkillQuestions.length < TOTAL_QUESTIONS - 1) {
    selectedSkillQuestions.push(
      allQuestions[selectedSkillQuestions.length % allQuestions.length]
    );
  }

  return [commonQuestions[lang] || commonQuestions.en, ...selectedSkillQuestions];
}

function categorizeSkill(candidate = {}) {
  const text = `${candidate.trade || ""} ${candidate.skill || ""}`.toLowerCase();

  if (skillBuckets.polytechnic.some((term) => text.includes(term))) {
    return "Polytechnic-skilled roles";
  }

  if (skillBuckets.blueCollar.some((term) => text.includes(term))) {
    return "Blue-collar trades";
  }

  return "Semi-skilled workforce";
}

function buildCandidateFingerprint(candidate = {}) {
  return [
    candidate.phone,
    candidate.deviceId,
    candidate.name,
    candidate.district,
    candidate.skill,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join("|");
}
function confidenceBand(score) {
  if (score >= 82) return "High";
  if (score >= 66) return "Medium";
  return "Low";
}

function decisionFromScore(score, riskLevel, repeatedAttempt) {
  if (riskLevel === "High" || repeatedAttempt) return "Manual verification";
  if (score >= 70) return "Shortlist for job";
  if (score >= 40) return "Send to training / upskilling";
  if (score >= 25) return "Manual verification";
  return "Reject / retake interview";
}

function categoryFromScore(score, riskLevel, repeatedAttempt) {
  if (riskLevel === "High" || repeatedAttempt) return "Suspected duplicate / fraud";
  if (score >= 70) return "Job-ready";
  if (score >= 45) return "Requires training / upskilling";
  if (score >= 25) return "Requires manual verification";
  return "Low-confidence / poor-quality";
}

function normalizeAnswer(answer) {
  return String(answer || "").trim().replace(/\s+/g, " ");
}

function safeJsonParse(rawText = "") {
  const text = String(rawText || "").trim();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function getMediaRisk(media = {}) {
  const reasons = [];

  if (media.faceVisible === false) reasons.push("Face visibility was low");
  if (media.audioClear === false) reasons.push("Audio clarity was weak");
  if (media.videoFrozen === true) reasons.push("Video feed appeared frozen");
  if (media.tabHiddenDuringAnswer === true) reasons.push("Interview tab lost focus");

  if (media.audioContinuity != null && Number(media.audioContinuity) < 0.15) {
    reasons.push("Audio continuity was low");
  }

  let riskLevel = "Low";

  if (
    media.videoFrozen === true ||
    media.tabHiddenDuringAnswer === true ||
    reasons.length >= 3
  ) {
    riskLevel = "High";
  } else if (reasons.length > 0) {
    riskLevel = "Medium";
  }

  return {
    riskLevel,
    reasons,
  };
}

function fallbackEvaluateAnswer({ answer, media }) {
  const text = normalizeAnswer(answer);
  const words = text.split(/\s+/).filter(Boolean);
  const mediaRisk = getMediaRisk(media);

  let relevance = words.length >= 8 ? 62 : 35;
  let completeness = Math.min(90, 25 + words.length * 3);
  let clarity = words.length >= 5 ? 70 : 40;
  let confidence = words.length >= 10 ? 68 : 42;

  if (!text || words.length < 3) {
    relevance = 10;
    completeness = 10;
    clarity = 20;
    confidence = 15;
  }

  if (mediaRisk.riskLevel === "High") {
    confidence -= 20;
    clarity -= 10;
  }

  relevance = clamp(relevance);
  completeness = clamp(completeness);
  clarity = clamp(clarity);
  confidence = clamp(confidence);

  const score = Math.round(
    relevance * 0.35 +
      completeness * 0.25 +
      clarity * 0.2 +
      confidence * 0.2
  );

  return {
    score,
    feedback:
      score >= 75
        ? "Good answer. The candidate gave useful work-related details."
        : score >= 45
        ? "Average answer. The candidate needs more real examples and job-specific details."
        : "Weak answer. The candidate did not explain actual experience clearly.",
    assessment: {
      relevance,
      completeness,
      clarity,
      confidence,
    },
    integrity: {
      riskLevel: mediaRisk.riskLevel,
      reasons: mediaRisk.reasons,
    },
  };
}

async function evaluateWithGroq({
  question,
  answer,
  skill,
  language,
  questionNumber,
  media,
}) {
  if (!groq) return null;

  const mediaRisk = getMediaRisk(media);

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:"You are an inclusive AI workforce assessor for blue-collar, semi-skilled, and polytechnic candidates in India.Evaluate practical job readiness, not English fluency.Candidates may speak Hindi, Kannada, English, or mixed language.Do not penalize grammar, accent, short sentences, pauses, or informal speech.Return only valid JSON."   
        },
        {
          role: "user",
          content: `
Candidate skill: ${skill}
Interview language: ${languageName(language)}
Question number: ${questionNumber}/5

Question:
${question}

Candidate answer:
${answer}

Media integrity:
- Face visible: ${media?.faceVisible}
- Audio clear: ${media?.audioClear}
- Video frozen: ${media?.videoFrozen}
- Tab hidden: ${media?.tabHiddenDuringAnswer}
- Audio continuity: ${media?.audioContinuity}

Evaluation criteria:
1. Relevance: Did the candidate answer the actual question?
2. Completeness: Did the candidate give any practical detail, example, tool, process, safety point, or work experience?
3. Clarity: Is the answer understandable even if grammar is poor or mixed language is used?
4. Confidence: Does the answer show basic work confidence and job readiness?

Scoring rules:
- 90-100: Excellent practical answer with clear experience, tools, safety, process, examples.
- 75-89: Good answer with useful practical details.
- 60-74: Acceptable answer, relevant but needs more detail.
- 40-59: Partially relevant answer, weak but still understandable.
- 20-39: Very short or unclear answer with little job detail.
- 0-19: Empty, fake, abusive, copied, or completely unrelated answer.

Important:
- Do NOT expect perfect English.
- Do NOT punish Hindi/Kannada/mixed language.
- Do NOT give 0 unless answer is empty or unrelated.
- Simple blue-collar practical answers should get fair marks.
- Give realistic scores, not too high and not too low.

Return JSON only:
{
  "relevance": 0,
  "completeness": 0,
  "clarity": 0,
  "confidence": 0,
  "feedback": "short practical feedback"
}
`,
        },
      ],
    });

    const parsed = safeJsonParse(completion.choices?.[0]?.message?.content || "");
    if (!parsed) return null;

    let relevance = clamp(parsed.relevance);
    let completeness = clamp(parsed.completeness);
    let clarity = clamp(parsed.clarity);
    let confidence = clamp(parsed.confidence);

    if (mediaRisk.riskLevel === "High") {
      clarity = clamp(clarity - 10);
      confidence = clamp(confidence - 20);
    }
   
    const score = clamp(
  relevance * 0.35 +
    completeness * 0.30 +
    clarity * 0.20 +
    confidence * 0.15
    );

    return {
      score,
      feedback:
        parsed.feedback ||
        (score >= 75
          ? "Good answer. The candidate gave useful work-related details."
          : score >= 45
          ? "Average answer. The candidate needs more real examples."
          : "Weak answer. The candidate did not answer clearly."),
      assessment: {
        relevance,
        completeness,
        clarity,
        confidence,
      },
      integrity: {
        riskLevel: mediaRisk.riskLevel,
        reasons: mediaRisk.reasons,
      },
    };
  } catch (err) {
    console.error("Groq evaluation fallback:", err.message);
    return null;
  }
}

function buildDecisionExplanation({ score, decision, riskLevel, repeatedAttempt, flaggedReasons }) {
  if (repeatedAttempt) {
    return "The candidate requires manual verification because the same candidate fingerprint has appeared in a previous interview.";
  }

  if (riskLevel === "High") {
    return "The candidate requires manual verification because interview integrity signals showed possible risk.";
  }

  if (decision === "Shortlist for job") {
    return "The candidate is job-ready because the interview score is strong and answers show practical work readiness.";
  }

  if (decision === "Send to training / upskilling") {
    return "The candidate has basic potential but should be routed to training before job matching.";
  }

  if (flaggedReasons?.length) {
    return "The candidate requires review because some interview quality or integrity flags were detected.";
  }

  return "The candidate needs manual review because the interview score is below the direct shortlist threshold.";
}

function averageMetric(answers, metric) {
  if (!answers.length) return 0;

  return Math.round(
    answers.reduce((total, item) => total + (item.assessment?.[metric] || 0), 0) /
      answers.length
  );
}

function buildInterviewRecord(session) {
  const answerCount = session.answers.length || 1;

  const averageScore = Math.round(
    session.answers.reduce((total, item) => total + item.score, 0) / answerCount
  );

  const relevanceScore = averageMetric(session.answers, "relevance");
  const completenessScore = averageMetric(session.answers, "completeness");
  const clarityScore = averageMetric(session.answers, "clarity");
  const confidenceScore = averageMetric(session.answers, "confidence");

  const allIntegrityReasons = [
    ...new Set(session.answers.flatMap((item) => item.integrity?.reasons || [])),
  ];

  const riskLevels = session.answers.map((item) => item.integrity?.riskLevel || "Low");

  const riskLevel = riskLevels.includes("High")
    ? "High"
    : riskLevels.includes("Medium")
    ? "Medium"
    : "Low";

  const fingerprint = buildCandidateFingerprint(session.candidate);
  const repeatedAttempt = session.previousAttemptCount >= 2;

  const flaggedReasons = [...allIntegrityReasons];

  if (repeatedAttempt) {
    flaggedReasons.push("Candidate fingerprint matches a previous interview attempt");
  }

  const decision = decisionFromScore(averageScore, riskLevel, repeatedAttempt);
  const category = categoryFromScore(averageScore, riskLevel, repeatedAttempt);

  const decisionExplanation = buildDecisionExplanation({
    score: averageScore,
    decision,
    riskLevel,
    repeatedAttempt,
    flaggedReasons,
  });

  return {
    id: randomUUID(),
    candidate: session.candidate,
    candidateFingerprint: fingerprint,

    language: session.language,
    district: session.candidate.district,
    skill: session.candidate.skill,
    trade: session.candidate.trade,

    averageScore,
    relevanceScore,
    completenessScore,
    clarityScore,
    confidenceScore,

    integritySummary: {
      riskLevel,
      reasons: flaggedReasons,
    },

    answers: session.answers,

    attemptCount: session.previousAttemptCount + 1,
    repeatedAttempt,

    submittedAt: new Date().toISOString(),

    decision,
    decisionExplanation,
    category,
    skillCategory: categorizeSkill(session.candidate),
    confidenceBand: confidenceBand(averageScore),
    flaggedReasons,
  };
}

function buildAdminFilter(query = {}) {
  const filter = {};

  if (query.district) filter.district = query.district;
  if (query.language) filter.language = query.language;
  if (query.category) filter.category = query.category;
  if (query.skill) filter.skill = query.skill;
  if (query.decision) filter.decision = query.decision;
  if (query.skillCategory) filter.skillCategory = query.skillCategory;

  if (query.flagged === "true") {
    filter.flaggedReasons = { $exists: true, $ne: [] };
  }

  if (query.minScore || query.maxScore) {
    filter.averageScore = {};
    if (query.minScore) filter.averageScore.$gte = Number(query.minScore);
    if (query.maxScore) filter.averageScore.$lte = Number(query.maxScore);
  }

  return filter;
}

/* =========================
   INTERVIEW ROUTES
========================= */

app.post("/start", async (req, res) => {
  try {
    const language = resolveLanguage(req.body?.language);
    const candidate = normalizeCandidate(req.body?.candidate || {}, language);
    const fingerprint = buildCandidateFingerprint(candidate);

    const previousAttemptCount = await InterviewRecord.countDocuments({
      candidateFingerprint: fingerprint,
    });
    
    console.log("========== INTERVIEW DEBUG ==========");
console.log("RAW BODY LANGUAGE:", req.body?.language);
console.log("RESOLVED LANGUAGE:", language);
console.log("RAW BODY CANDIDATE:", req.body?.candidate);
console.log("NORMALIZED CANDIDATE:", candidate);
console.log("CANDIDATE SKILL:", candidate.skill);

const mappedLanguage = questionLanguageKey(language);

console.log("MAPPED QUESTION LANGUAGE:", mappedLanguage);
console.log("QUESTION BANK SKILL EXISTS:", Boolean(questionBank[candidate.skill]));
console.log(
  "QUESTION ARRAY:",
  questionBank[candidate.skill]?.[mappedLanguage]
);
console.log("====================================");

const selectedQuestions = getInterviewQuestions(candidate.skill, language);

console.log("SELECTED QUESTIONS:", selectedQuestions);

    if (!selectedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found for selected skill or language.",
      });
    }

    const sessionId = randomUUID();

    sessions.set(sessionId, {
      id: sessionId,
      language,
      candidate,
      index: 0,
      prompts: selectedQuestions,
      answers: [],
      previousAttemptCount,
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      sessionId,
      language,
      question: selectedQuestions[0],
      questionNumber: 1,
      totalQuestions: TOTAL_QUESTIONS,
      completed: false,
      repeatedAttempt: previousAttemptCount > 0,
    });
  } catch (err) {
    console.error("Start interview error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to start interview",
      error: err.message,
    });
  }
});

app.post("/api/interview/start", async (req, res) => {
  req.url = "/start";
  app._router.handle(req, res);
});

app.post("/next", async (req, res) => {
  try {
    const { sessionId, answer = "", media = {} } = req.body || {};

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(400).json({
        success: false,
        error: "Interview session not found. Start a new interview and try again.",
      });
    }

    const session = sessions.get(sessionId);

    const currentQuestionNumber = session.index + 1;
    const prompt = session.prompts[session.index];

    let evaluation = await evaluateWithGroq({
      question: prompt,
      answer,
      skill: session.candidate.skill,
      language: session.language,
      questionNumber: currentQuestionNumber,
      media,
    });

    if (!evaluation) {
      evaluation = fallbackEvaluateAnswer({
        answer,
        media,
      });
    }

    session.answers.push({
      questionNumber: currentQuestionNumber,
      prompt,
      answer: normalizeAnswer(answer),
      score: evaluation.score,
      feedback: evaluation.feedback,
      assessment: evaluation.assessment,
      integrity: evaluation.integrity,
      answeredAt: new Date().toISOString(),
    });

    session.index += 1;

    const completed = session.index >= TOTAL_QUESTIONS;

    const averageScore = Math.round(
      session.answers.reduce((total, item) => total + item.score, 0) /
        session.answers.length
    );

    let nextQuestion = null;
    let finalResult = null;

    if (!completed) {
      nextQuestion = session.prompts[session.index];
    }

    if (completed) {
      const record = buildInterviewRecord(session);

      await InterviewRecord.create(record);

      await InterviewResult.create({
        candidateName: record.candidate.name,
        phone: record.candidate.phone,
        district: record.district,
        trade: record.trade,
        skill: record.skill,
        language: record.language,

        skillCategory: record.skillCategory,

        averageScore: record.averageScore,
        relevanceScore: record.relevanceScore,
        completenessScore: record.completenessScore,
        clarityScore: record.clarityScore,
        confidenceScore: record.confidenceScore,
        confidenceBand: record.confidenceBand,

        category: record.category,
        flaggedReasons: record.flaggedReasons || [],
        repeatedAttempt: record.repeatedAttempt,
        attemptCount: record.attemptCount,

        decision: record.decision,
        decisionExplanation: record.decisionExplanation,
        submittedAt: record.submittedAt,
      });

      finalResult = {
        averageScore: record.averageScore,
        relevanceScore: record.relevanceScore,
        completenessScore: record.completenessScore,
        clarityScore: record.clarityScore,
        confidenceScore: record.confidenceScore,
        confidenceBand: record.confidenceBand,
        category: record.category,
        skillCategory: record.skillCategory,
        decision: record.decision,
        decisionExplanation: record.decisionExplanation,
        integritySummary: record.integritySummary,
        flaggedReasons: record.flaggedReasons,
        repeatedAttempt: record.repeatedAttempt,
        attemptCount: record.attemptCount,
      };

      sessions.delete(sessionId);
    }

    res.json({
      success: true,

      score: evaluation.score,
      averageScore,

      // Frontend should hide this during interview and show only after completion if needed.
      feedback: completed ? evaluation.feedback : "",

      assessment: evaluation.assessment,
      integrity: evaluation.integrity,

      nextQuestion,
      question: nextQuestion,

      questionNumber: completed ? TOTAL_QUESTIONS : session.index + 1,
      totalQuestions: TOTAL_QUESTIONS,
      completed,

      finalResult,
    });
  } catch (err) {
    console.error("Interview next error:", err);

    res.status(500).json({
      success: false,
      message: "Interview evaluation failed",
      error: err.message,
    });
  }
});

app.post("/api/interview/next", async (req, res) => {
  req.url = "/next";
  app._router.handle(req, res);
});

/* =========================
   TRANSCRIPTION ROUTE
========================= */

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio uploaded",
      });
    }

    const languageCode = req.body.languageCode || req.body.language || "en-IN";

    const isKannada = languageCode === "kn-IN" || languageCode === "kn";
    const isHindi = languageCode === "hi-IN" || languageCode === "hi";

    if ((isKannada || isHindi) && process.env.SARVAM_API_KEY) {
      const formData = new FormData();

      formData.append("file", req.file.buffer, {
        filename: "audio.webm",
        contentType: req.file.mimetype || "audio/webm",
      });

      formData.append("model", "saaras:v3");
      formData.append("language_code", isKannada ? "kn-IN" : "hi-IN");

      const sarvamResponse = await axios.post(
        "https://api.sarvam.ai/speech-to-text",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "api-subscription-key": process.env.SARVAM_API_KEY,
          },
          timeout: 30000,
        }
      );

      const text =
        sarvamResponse.data?.transcript ||
        sarvamResponse.data?.text ||
        sarvamResponse.data?.transcription ||
        "";

      return res.json({
        success: true,
        text,
        provider: "sarvam",
        languageCode,
      });
    }

    if (!deepgram) {
      return res.status(500).json({
        success: false,
        message: "Deepgram API key is missing",
      });
    }

    const response = await deepgram.listen.v1.media.transcribeFile(req.file.buffer, {
      model: "nova-2",
      smart_format: true,
      punctuate: true,
      language: "en",
    });

    const text =
      response?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    res.json({
      success: true,
      text,
      provider: "deepgram",
      languageCode,
    });
  } catch (err) {
    console.error("Transcription error:", err.response?.data || err.message);
    console.error("Transcription error full:", {
  message: err.message,
  response: err.response?.data,
  status: err.response?.status,
});
    res.status(500).json({
      success: false,
      message: "Transcription failed",
      error: err.response?.data || err.message,
    });
  }
});

/* =========================
   AUTH ROUTES
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { phone, aadharNumber, name, district, skills, deviceId, email } = req.body;

    if (!phone || !aadharNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone and Aadhar are required",
      });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanAadhar = normalizeAadhar(aadharNumber);
    const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: "Phone number must be 10 digits",
      });
    }

    if (cleanAadhar.length !== 12) {
      return res.status(400).json({
        success: false,
        error: "Aadhar number must be 12 digits",
      });
    }

    const duplicateQuery = {
      $or: [
        { phone: cleanPhone },
        { aadharNumber: cleanAadhar },
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ],
    };

    const existingUser = await Candidate.findOne(duplicateQuery);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Phone, Email, or Aadhar already exists",
      });
    }

   const user = await Candidate.create({
  phone: cleanPhone,
  aadharNumber: cleanAadhar,
  name: titleCase(name || "Candidate"),
  district: titleCase(district || ""),
  skills: Array.isArray(skills) ? skills : [],
  deviceId: deviceId || "",
  email: cleanEmail,
  preferredLanguage: req.body.preferredLanguage || "en",
  selectedSkill: null,
  role: "candidate",
});

    res.json({
      success: true,
      message: "Registration successful",
      user,
      token: user._id,
    });
  } catch (err) {
    const duplicate = err.code === 11000;

    res.status(duplicate ? 409 : 500).json({
      success: false,
      error: duplicate ? "Phone, Email, or Aadhar already exists" : err.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, aadharNumber } = req.body;

    if (!phone || !aadharNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone and Aadhar are required",
      });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanAadhar = normalizeAadhar(aadharNumber);
    console.log("LOGIN BODY:", req.body);
console.log("CLEAN PHONE:", cleanPhone);
console.log("CLEAN AADHAR:", cleanAadhar);

    const user = await Candidate.findOne({
      phone: cleanPhone,
      aadharNumber: cleanAadhar,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid phone or Aadhar",
      });
    }

    res.json({
  success: true,
  message: "Login successful",
  user,
  candidate: user,
  token: user._id,
  });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   CANDIDATE ROUTES
========================= */

app.get("/api/candidate/interviews/:phone", async (req, res) => {
  try {
    const phone = normalizePhone(req.params.phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone is required",
      });
    }

    const interviews = await InterviewRecord.find({
      "candidate.phone": phone,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: interviews.length,
      interviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   ADMIN ROUTES
========================= */

app.get("/api/admin/candidates", async (req, res) => {
  try {
    const filter = buildAdminFilter(req.query);

    const results = await InterviewResult.find(filter).sort({ createdAt: -1 }).lean();

    const candidates = results.map((item) => ({
      id: item._id.toString(),
      candidate: {
        name: item.candidateName || "Unknown Candidate",
        phone: item.phone || "N/A",
        district: item.district || "N/A",
        trade: item.trade || item.skill || "N/A",
        skill: item.skill || "N/A",
        language: item.language || "N/A",
      },
      district: item.district || "N/A",
      language: item.language || "N/A",
      skill: item.skill || "N/A",
      trade: item.trade || item.skill || "N/A",

      skillCategory: item.skillCategory || "General",

      averageScore: item.averageScore || 0,
      relevanceScore: item.relevanceScore || 0,
      completenessScore: item.completenessScore || 0,
      clarityScore: item.clarityScore || 0,
      confidenceScore: item.confidenceScore || 0,
      confidenceBand: item.confidenceBand || confidenceBand(item.averageScore || 0),

      category: item.category || categoryFromScore(item.averageScore || 0, "Low", false),
      flaggedReasons: item.flaggedReasons || [],
      repeatedAttempt: item.repeatedAttempt || false,
      attemptCount: item.attemptCount || 1,

      decision: item.decision || "Manual verification",
      decisionExplanation: item.decisionExplanation || "",

      submittedAt: item.submittedAt || item.createdAt || new Date(),
    }));

    res.json({
      success: true,
      total: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch candidate results",
      error: error.message,
    });
  }
});

app.get("/api/admin/summary", async (req, res) => {
  try {
    const filter = buildAdminFilter(req.query);

    const results = await InterviewResult.find(filter).lean();
    const allResults = await InterviewResult.find().lean();

    const getUnique = (items, key) => [
      ...new Set(items.map((item) => item[key]).filter(Boolean)),
    ];

    const byCategory = results.reduce((acc, item) => {
      const category =
        item.category || categoryFromScore(item.averageScore || 0, "Low", false);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const byDecision = results.reduce((acc, item) => {
      const decision = item.decision || "Manual verification";
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {});

    const averageScore =
      results.length > 0
        ? Math.round(
            results.reduce((total, item) => total + (item.averageScore || 0), 0) /
              results.length
          )
        : 0;

    res.json({
      success: true,
      totalCandidates: results.length,
      averageScore,
      flaggedCases: results.filter(
        (item) => item.repeatedAttempt || (item.flaggedReasons || []).length > 0
      ).length,
      districts: getUnique(allResults, "district"),
      skills: getUnique(allResults, "skill"),
      languages: getUnique(allResults, "language"),
      categories: getUnique(allResults, "category"),
      decisions: getUnique(allResults, "decision"),
      skillCategories: getUnique(allResults, "skillCategory"),
      byCategory,
      byDecision,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin summary",
      error: error.message,
    });
  }
});

app.post("/api/admin/candidates/:id/decision", async (req, res) => {
  try {
    const { decision } = req.body;

    if (!decision) {
      return res.status(400).json({
        success: false,
        error: "Decision is required",
      });
    }

    const updated = await InterviewResult.findByIdAndUpdate(
      req.params.id,
      { decision },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Candidate record not found",
      });
    }

    res.json({
      success: true,
      candidate: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   TEST ROUTES
========================= */

app.get("/", (_req, res) => {
  res.send("HireSmart backend is running.");
});

app.get("/test-db", async (_req, res) => {
  try {
    const totalInterviews = await InterviewResult.countDocuments();

    res.json({
      success: true,
      message: "MongoDB working ✅",
      totalInterviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "MongoDB error ❌",
      error: err.message,
    });
  }
});
app.get("/api/candidates/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select("-__v");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
});

app.put("/api/candidates/:id/profile", async (req, res) => {
  try {
    const { district, skills } = req.body;

    if (!district || !district.trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one skill",
      });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          district: district.trim(),
          skills,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedCandidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
});
/* =========================
   SERVER
========================= */

const port = Number(process.env.PORT || 5000);
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`🚀 Backend running on http://${host}:${port}`);
});