import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    aadharNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\d{12}$/,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 Candidate profile skills
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "At least one skill is required",
      },
    },

    // 🎯 Selected interview skill
    selectedSkill: {
      type: String,
      default: null,
    },

    // 🌐 Preferred language
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "kn"],
      default: "en",
    },

    // 📊 Interview analytics
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

    // 🚨 Fraud detection
    deviceId: {
      type: String,
      default: null,
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

    // 🔐 Roles
    role: {
      type: String,
      enum: ["candidate", "employee", "admin"],
      default: "candidate",
    },

    // ✅ Verification
    aadharVerified: {
      type: Boolean,
      default: false,
    },

    // 👤 Profile image (future)
    profileImage: {
      type: String,
      default: null,
    },

    // 🕒 Last login
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Indexes
candidateSchema.index({ phone: 1 }, { unique: true });
candidateSchema.index({ aadharNumber: 1 }, { unique: true });
candidateSchema.index({ deviceId: 1 });

export default mongoose.model("Candidate", candidateSchema);