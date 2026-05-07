import mongoose from "mongoose";

const InterviewResultSchema = new mongoose.Schema(
  {
    candidateName: String,
    phone: String,
    district: String,
    trade: String,
    skill: String,
    language: String,

    averageScore: Number,
    confidenceScore: Number,

    flaggedReasons: [String],
    repeatedAttempt: Boolean,
    attemptCount: {
      type: Number,
      default: 1,
    },

    decision: {
      type: String,
      default: "Manual verification",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewResult", InterviewResultSchema);