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

    // ✅ Phone is optional now
    phone: {
      type: String,
      required: false,
      trim: true,
      default: null,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    // ✅ Aadhaar remains mandatory
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhaar number must be 12 digits"],
    },

    // ✅ Store masked Aadhaar also
    maskedAadhar: {
      type: String,
      default: null,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Make state optional, because your frontend may not send it
    state: {
      type: String,
      required: false,
      default: "Karnataka",
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "At least one skill is required",
      },
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

    role: {
      type: String,
      enum: ["candidate", "employee", "admin"],
      default: "candidate",
    },

    aadharVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ KYC status
    kycStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED"],
      default: "PENDING",
    },

    // ✅ KYC method
    kycMethod: {
      type: String,
      default: "Aadhaar Number Provided",
    },

    profileImage: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Aadhaar must be unique
candidateSchema.index({ aadharNumber: 1 }, { unique: true });

// ✅ Phone optional unique index
// This allows multiple candidates with no phone number.
candidateSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: "string" } },
  }
);

candidateSchema.index({ deviceId: 1 });

export default mongoose.model("Candidate", candidateSchema);