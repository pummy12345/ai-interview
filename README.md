# HireSmart AI Prototype

HireSmart AI is a prototype for AI-led candidate screening focused on workforce hiring. It combines a mobile-first multilingual interview experience with a lightweight assessment engine, integrity checks, fitment classification, and an admin dashboard for stakeholder review.

## Expected Outcome

This prototype demonstrates:

- scalable AI-led candidate screening through structured interview APIs and a reusable frontend interview flow
- Kannada-first multilingual interaction across Kannada, Hindi, and English
- response assessment for relevance, completeness, clarity, and confidence
- quality and fraud detection through duplicate, repeated-attempt, face/audio, and suspicious-pattern heuristics
- a dashboard that supports review, filtering, and routing decisions

## Solution Scope

The current implementation includes:

- candidate mobile interface for multilingual interview intake
- AI interview agent flow with spoken prompts and camera/mic capture
- assessment and scoring engine in the backend
- integrity and duplicate detection layer using candidate fingerprints and answer similarity
- classification logic for fitment and skill-bucket mapping
- admin dashboard for shortlist, training, verification, and hold decisions

## Evaluation Focus

The prototype is designed to be evaluated on:

- Kannada and multilingual interaction quality
- robustness to pauses, informal speech, and dialect-like variation
- assessment usefulness and classification clarity
- duplicate and integrity detection behavior
- dashboard usability and actionability
- deployment readiness through configurable frontend and backend endpoints

## Run Locally

Frontend:

```bash
npm install
cp .env.example .env
npm run dev
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
node server.js
```

## Environment Variables

Frontend `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Backend `.env`:

```bash
PORT=5000
HOST=0.0.0.0
```

## Admin Review Layer

The admin dashboard supports:

- filter by district, skill, language, and candidate category
- flagged-case review for poor quality, duplicate attempts, and suspicious behavior
- confidence score and interview score review
- final routing decisions for jobs, training, or manual verification

## Prototype Limits

Current integrity checks are heuristic and client-assisted. They are useful for a prototype, but not equivalent to production-grade biometric identity verification, server-side liveness detection, or persistent duplicate detection across a full candidate database.
