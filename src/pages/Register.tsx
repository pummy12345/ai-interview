import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL } from "../config";
import "./Auth.css";

type UILanguage = "en" | "hi" | "kn";

const skillOptions = [
  "Warehouse operations",
  "Electrical technician",
  "Driver",
  "Construction helper",
  "Machine operator",
  "Retail associate",
  "Diploma mechanical",
  "Plumbing",
  "Carpentry",
  "Masonry",
  "HVAC Technician",
];

const districtOptions = [
  "Bengaluru Urban",
  "Mysuru",
  "Hubballi",
  "Belagavi",
  "Shivamogga",
  "Patna",
  "Lucknow",
  "Indore",
  "Jaipur",
];

const text = {
  en: {
    pill: "AI SkillFit",
    title: "Create your account",
    subtitle: "Complete your candidate profile.",
    name: "Full Name",
    namePlaceholder: "Your full name",
    phone: "Phone Number",
    phonePlaceholder: "10-digit number",
    optional: "Optional",
    aadhar: "Aadhaar Number",
    aadharPlaceholder: "12-digit Aadhaar number",
    district: "District",
    districtPlaceholder: "Select district",
    skills: "Profile Skills",
    skillsHint: "Select all skills you know.",
    selectedSkills: "Selected Skills:",
    selectedSkillsNote: "These represent your experience.",
    kycTitle: "Offline Aadhaar KYC",
    kycHint:
      "Upload Aadhaar image/PDF. AI OCR will match it with entered Aadhaar.",
    uploadAadhaar: "Upload Aadhaar Image / PDF",
    verifyKyc: "Verify Identity",
    kycVerified: "✓ KYC Verified using OCR Aadhaar Document Match",
    kycPending: "KYC Pending",
    create: "Create Account",
    creating: "Creating Account...",
    already: "Already have an account?",
    signin: "Sign In",
    removeSkill: "Remove skill",
    ocrMismatch:
      "Uploaded Aadhaar document does not match entered Aadhaar number",
    ocrFailed: "KYC verification failed. Please try again.",
    kycRequired:
      "Please upload Aadhaar document and verify identity before registration.",
  },
  hi: {
    pill: "AI SkillFit",
    title: "अपना अकाउंट बनाएं",
    subtitle: "अपनी उम्मीदवार प्रोफाइल पूरी करें।",
    name: "पूरा नाम",
    namePlaceholder: "आपका नाम",
    phone: "फोन नंबर",
    phonePlaceholder: "10 अंकों का नंबर",
    optional: "वैकल्पिक",
    aadhar: "आधार नंबर",
    aadharPlaceholder: "12 अंकों का आधार नंबर",
    district: "जिला",
    districtPlaceholder: "जिला चुनें",
    skills: "प्रोफाइल स्किल्स",
    skillsHint: "जो-जो स्किल्स आपको आती हैं उन्हें चुनें।",
    selectedSkills: "चुनी गई स्किल्स:",
    selectedSkillsNote: "ये आपकी अनुभव वाली स्किल्स हैं।",
    kycTitle: "ऑफलाइन आधार KYC",
    kycHint:
      "आधार इमेज/PDF अपलोड करें। AI OCR इसे दर्ज किए गए आधार नंबर से मैच करेगा।",
    uploadAadhaar: "आधार इमेज / PDF अपलोड करें",
    verifyKyc: "पहचान सत्यापित करें",
    kycVerified: "✓ OCR Aadhaar Document Match से KYC Verified",
    kycPending: "KYC Pending",
    create: "अकाउंट बनाएं",
    creating: "अकाउंट बनाया जा रहा है...",
    already: "पहले से अकाउंट है?",
    signin: "लॉगिन करें",
    removeSkill: "स्किल हटाएं",
    ocrMismatch:
      "अपलोड किया गया आधार दस्तावेज दर्ज किए गए आधार नंबर से मेल नहीं खाता",
    ocrFailed: "KYC सत्यापन विफल हुआ। कृपया पुनः प्रयास करें।",
    kycRequired:
      "कृपया आधार दस्तावेज अपलोड करके पहचान सत्यापित करें, फिर रजिस्ट्रेशन करें।",
  },
  kn: {
    pill: "AI SkillFit",
    title: "ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ",
    subtitle: "ನಿಮ್ಮ ಅಭ್ಯರ್ಥಿ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ.",
    name: "ಪೂರ್ಣ ಹೆಸರು",
    namePlaceholder: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    phonePlaceholder: "10 ಅಂಕಿಯ ಸಂಖ್ಯೆ",
    optional: "ಐಚ್ಛಿಕ",
    aadhar: "ಆಧಾರ್ ಸಂಖ್ಯೆ",
    aadharPlaceholder: "12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆ",
    district: "ಜಿಲ್ಲೆ",
    districtPlaceholder: "ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ",
    skills: "ಪ್ರೊಫೈಲ್ ಕೌಶಲ್ಯಗಳು",
    skillsHint: "ನಿಮಗೆ ತಿಳಿದಿರುವ ಎಲ್ಲಾ ಕೌಶಲ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    selectedSkills: "ಆಯ್ಕೆ ಮಾಡಿದ ಕೌಶಲ್ಯಗಳು:",
    selectedSkillsNote: "ಇವು ನಿಮ್ಮ ಅನುಭವವನ್ನು ಸೂಚಿಸುತ್ತವೆ.",
    kycTitle: "ಆಫ್‌ಲೈನ್ ಆಧಾರ್ KYC",
    kycHint:
      "ಆಧಾರ್ ಇಮೇಜ್/PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ. AI OCR ಅದನ್ನು ನಮೂದಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಹೋಲಿಸುತ್ತದೆ.",
    uploadAadhaar: "ಆಧಾರ್ ಇಮೇಜ್ / PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ",
    verifyKyc: "ಗುರುತು ಪರಿಶೀಲಿಸಿ",
    kycVerified: "✓ OCR Aadhaar Document Match ಮೂಲಕ KYC Verified",
    kycPending: "KYC Pending",
    create: "ಖಾತೆ ರಚಿಸಿ",
    creating: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    already: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    signin: "ಲಾಗಿನ್ ಮಾಡಿ",
    removeSkill: "ಕೌಶಲ್ಯ ತೆಗೆದುಹಾಕಿ",
    ocrMismatch:
      "ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಆಧಾರ್ ದಾಖಲೆ ನಮೂದಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ",
    ocrFailed: "KYC ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    kycRequired:
      "ದಯವಿಟ್ಟು ಆಧಾರ್ ದಾಖಲೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ ಗುರುತು ಪರಿಶೀಲಿಸಿ, ನಂತರ ನೋಂದಣಿ ಮಾಡಿ.",
  },
};

const errorText = {
  en: {
    nameRequired: "Full name is required",
    nameLength: "Name must be more than 2 characters",
    nameInvalid: "Name should contain only letters and spaces",
    phoneLength: "Phone number must be exactly 10 digits",
    phoneInvalid: "Enter a valid Indian phone number",
    aadharRequired: "Aadhaar number is required",
    aadharLength: "Aadhaar number must be exactly 12 digits",
    aadharInvalid: "Aadhaar number must contain only digits",
    aadharRepeated: "Invalid Aadhaar number",
    districtRequired: "Please select your district",
    skillRequired: "Please select at least one profile skill",
    kycFileRequired: "Please upload Aadhaar image or PDF",
    submitFailed: "Registration failed. Please try again.",
  },
  hi: {
    nameRequired: "पूरा नाम जरूरी है",
    nameLength: "नाम 2 अक्षरों से अधिक होना चाहिए",
    nameInvalid: "नाम में केवल अक्षर और स्पेस होने चाहिए",
    phoneLength: "फोन नंबर ठीक 10 अंकों का होना चाहिए",
    phoneInvalid: "सही भारतीय फोन नंबर दर्ज करें",
    aadharRequired: "आधार नंबर जरूरी है",
    aadharLength: "आधार नंबर ठीक 12 अंकों का होना चाहिए",
    aadharInvalid: "आधार नंबर में केवल अंक होने चाहिए",
    aadharRepeated: "अमान्य आधार नंबर",
    districtRequired: "कृपया अपना जिला चुनें",
    skillRequired: "कम से कम एक प्रोफाइल स्किल चुनें",
    kycFileRequired: "कृपया आधार इमेज या PDF अपलोड करें",
    submitFailed: "रजिस्ट्रेशन failed. कृपया दोबारा कोशिश करें।",
  },
  kn: {
    nameRequired: "ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯವಿದೆ",
    nameLength: "ಹೆಸರು 2 ಅಕ್ಷರಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇರಬೇಕು",
    nameInvalid: "ಹೆಸರಿನಲ್ಲಿ ಅಕ್ಷರಗಳು ಮತ್ತು ಸ್ಪೇಸ್ ಮಾತ್ರ ಇರಬೇಕು",
    phoneLength: "ಫೋನ್ ಸಂಖ್ಯೆ ಸರಿಯಾಗಿ 10 ಅಂಕಿಗಳಿರಬೇಕು",
    phoneInvalid: "ಸರಿಯಾದ ಭಾರತೀಯ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    aadharRequired: "ಆಧಾರ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ",
    aadharLength: "ಆಧಾರ್ ಸಂಖ್ಯೆ ಸರಿಯಾಗಿ 12 ಅಂಕಿಗಳಿರಬೇಕು",
    aadharInvalid: "ಆಧಾರ್ ಸಂಖ್ಯೆಯಲ್ಲಿ ಅಂಕಿಗಳು ಮಾತ್ರ ಇರಬೇಕು",
    aadharRepeated: "ಅಮಾನ್ಯ ಆಧಾರ್ ಸಂಖ್ಯೆ",
    districtRequired: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ",
    skillRequired: "ಕನಿಷ್ಠ ಒಂದು ಪ್ರೊಫೈಲ್ ಕೌಶಲ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    kycFileRequired: "ದಯವಿಟ್ಟು ಆಧಾರ್ ಇಮೇಜ್ ಅಥವಾ PDF ಅಪ್ಲೋಡ್ ಮಾಡಿ",
    submitFailed: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },
};

type FormData = {
  name: string;
  phone: string;
  aadharNumber: string;
  district: string;
  skills: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();

  const uiLanguage = language as UILanguage;
  const t = text[uiLanguage];
  const eText = errorText[uiLanguage];

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    aadharNumber: "",
    district: "",
    skills: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [extractedAddress, setExtractedAddress] = useState("");
   const [extractedPinCode, setExtractedPinCode] = useState("");
  const [isKycChecking, setIsKycChecking] = useState(false);

  const validateField = (
    field: keyof FormData,
    value: string | string[]
  ): string => {
    if (field === "name") {
      const name = String(value).trim();
      if (!name) return eText.nameRequired;
      if (name.length < 3) return eText.nameLength;
      if (!/^[A-Za-z\u0900-\u097F\u0C80-\u0CFF ]+$/.test(name)) {
        return eText.nameInvalid;
      }
      return "";
    }

    if (field === "phone") {
      const phone = String(value);
      if (!phone) return "";
      if (phone.length !== 10) return eText.phoneLength;
      if (!/^[6-9]\d{9}$/.test(phone)) return eText.phoneInvalid;
      return "";
    }

    if (field === "aadharNumber") {
      const aadhar = String(value);
      if (!aadhar) return eText.aadharRequired;
      if (aadhar.length !== 12) return eText.aadharLength;
      if (!/^\d{12}$/.test(aadhar)) return eText.aadharInvalid;
      if (/^(\d)\1{11}$/.test(aadhar)) return eText.aadharRepeated;
      return "";
    }

    if (field === "district") {
      if (!value) return eText.districtRequired;
      return "";
    }

    if (field === "skills") {
      const skills = value as string[];
      if (skills.length === 0) return eText.skillRequired;
      return "";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      phone: validateField("phone", formData.phone),
      aadharNumber: validateField("aadharNumber", formData.aadharNumber),
      district: validateField("district", formData.district),
      skills: validateField("skills", formData.skills),
    };

    Object.keys(newErrors).forEach((key) => {
      const typedKey = key as keyof FormErrors;
      if (!newErrors[typedKey]) delete newErrors[typedKey];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidField = (field: keyof FormData) => {
    const value = formData[field];
    if (Array.isArray(value)) return value.length > 0 && !errors[field];
    return value.trim().length > 0 && !errors[field];
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const field = name as keyof FormData;

    setSubmitError("");

    let updatedValue = value;

    if (field === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (field === "aadharNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 12);
      setKycVerified(false);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, updatedValue),
    }));
  };

  const toggleSkill = (skill: string) => {
    setSubmitError("");

    const updatedSkills = formData.skills.includes(skill)
      ? formData.skills.filter((item) => item !== skill)
      : [...formData.skills, skill];

    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));

    setErrors((prev) => ({
      ...prev,
      skills: validateField("skills", updatedSkills),
    }));
  };

  const handleKycFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSubmitError("");
    setKycFile(file);
    setKycVerified(false);
  };

  const handleKycVerify = async () => {
    setSubmitError("");

    const aadharError = validateField("aadharNumber", formData.aadharNumber);

    if (aadharError) {
      setErrors((prev) => ({
        ...prev,
        aadharNumber: aadharError,
      }));
      return;
    }

    if (!kycFile) {
      setSubmitError(eText.kycFileRequired);
      return;
    }

    try {
      setIsKycChecking(true);

      const form = new FormData();
      form.append("aadhaarFile", kycFile);
      form.append("aadharNumber", formData.aadharNumber.trim());

      const response = await fetch(`${API_BASE_URL}/api/kyc/verify`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok || !data.verified) {
        setKycVerified(false);
        setSubmitError(data.message || t.ocrMismatch);
        return;
      }

      setKycVerified(true);
      setSubmitError("");
    } catch {
      setKycVerified(false);
      setSubmitError(t.ocrFailed);
    } finally {
      setIsKycChecking(false);
    }
  };

  const getMaskedAadhaar = (aadharNumber: string) => {
    return `XXXX XXXX ${aadharNumber.slice(-4)}`;
  };

  const getDeviceId = () => {
    const existingDeviceId = window.localStorage.getItem("hireSmartDeviceId");
    if (existingDeviceId) return existingDeviceId;

    const newDeviceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem("hireSmartDeviceId", newDeviceId);
    return newDeviceId;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    if (!kycVerified) {
      setSubmitError(t.kycRequired);
      return;
    }

    setIsLoading(true);

    try {
      const deviceId = getDeviceId();

      const candidate = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || "",
        aadharNumber: formData.aadharNumber.trim(),
        maskedAadhar: getMaskedAadhaar(formData.aadharNumber.trim()),
        district: formData.district,
        skills: formData.skills,
        preferredLanguage: uiLanguage,
        aadharVerified: true,
        kycStatus: "VERIFIED",
        kycMethod: "OCR Aadhaar Document Match",
        deviceId,
      };

      await register(candidate);
      localStorage.removeItem("adminLoggedIn");

      navigate("/candidate-dashboard", {
        replace: true,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : eText.submitFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-glow register-glow-one" />
      <div className="register-glow register-glow-two" />

      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-header">
            <div className="register-pill">{t.pill}</div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form" noValidate>

  {/* NAME */}
  <div className="form-group">
    <label htmlFor="name">{t.name}</label>

    <div className="input-wrap">
      <input
        type="text"
        id="name"
        name="name"
        placeholder={t.namePlaceholder}
        value={formData.name}
        onChange={handleChange}
        className={
          errors.name
            ? "input-error"
            : isValidField("name")
            ? "input-success"
            : ""
        }
        autoComplete="name"
      />

      {isValidField("name") && (
        <span className="success-icon">✓</span>
      )}
    </div>

    {errors.name && <p className="field-error">{errors.name}</p>}
  </div>

  {/* PHONE + AADHAAR */}
  <div className="form-row">

    <div className="form-group">
      <label htmlFor="phone">
        {t.phone}{" "}
        <span className="optional-text">({t.optional})</span>
      </label>

      <div className="input-wrap">
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder={t.phonePlaceholder}
          value={formData.phone}
          onChange={handleChange}
          maxLength={10}
          inputMode="numeric"
          className={
            errors.phone
              ? "input-error"
              : isValidField("phone")
              ? "input-success"
              : ""
          }
          autoComplete="tel"
        />

        {isValidField("phone") && (
          <span className="success-icon">✓</span>
        )}
      </div>

      {errors.phone && (
        <p className="field-error">{errors.phone}</p>
      )}
    </div>

    <div className="form-group">
      <label htmlFor="aadharNumber">{t.aadhar}</label>

      <div className="input-wrap">
        <input
          type="text"
          id="aadharNumber"
          name="aadharNumber"
          placeholder={t.aadharPlaceholder}
          value={formData.aadharNumber}
          onChange={handleChange}
          maxLength={12}
          inputMode="numeric"
          className={
            errors.aadharNumber
              ? "input-error"
              : isValidField("aadharNumber")
              ? "input-success"
              : ""
          }
        />

        {isValidField("aadharNumber") && (
          <span className="success-icon">✓</span>
        )}
      </div>

      {errors.aadharNumber && (
        <p className="field-error">{errors.aadharNumber}</p>
      )}
    </div>
  </div>

  {/* KYC */}
  <div className="form-group">
    <label>{t.kycTitle}</label>

    <p className="form-hint">{t.kycHint}</p>

    <div className="kyc-upload-box">
      <label htmlFor="aadhaarFile" className="kyc-upload-label">
        {t.uploadAadhaar}
      </label>

      <input
        id="aadhaarFile"
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={handleKycFileChange}
        className="kyc-file-input"
      />

      {kycFile && (
        <p className="kyc-file-name">
          Selected: <strong>{kycFile.name}</strong>
        </p>
      )}

      <button
        type="button"
        className="kyc-verify-btn"
        onClick={handleKycVerify}
        disabled={isKycChecking}
      >
        {isKycChecking ? t.creating : t.verifyKyc}
      </button>

      <div
        className={`kyc-status ${
          kycVerified
            ? "kyc-status-verified"
            : "kyc-status-pending"
        }`}
      >
        {kycVerified ? t.kycVerified : t.kycPending}
      </div>
    </div>
  </div>

  {/* DISTRICT */}
  <div className="form-group">
    <label htmlFor="district">{t.district}</label>

    <div className="input-wrap">
      <select
        id="district"
        name="district"
        value={formData.district}
        onChange={handleChange}
        className={
          errors.district
            ? "input-error"
            : isValidField("district")
            ? "input-success"
            : ""
        }
      >
        <option value="">
          {t.districtPlaceholder}
        </option>

        {districtOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {isValidField("district") && (
        <span className="success-icon">✓</span>
      )}
    </div>

    {errors.district && (
      <p className="field-error">{errors.district}</p>
    )}
  </div>

  {/* SKILLS */}
  <div className="form-group">
    <label>{t.skills}</label>

    <p className="form-hint">{t.skillsHint}</p>

    <div className="skill-grid">
      {skillOptions.map((skill) => (
        <label
          key={skill}
          className={`skill-checkbox ${
            formData.skills.includes(skill)
              ? "skill-selected"
              : ""
          }`}
        >
          <input
            type="checkbox"
            checked={formData.skills.includes(skill)}
            onChange={() => toggleSkill(skill)}
          />

          <span>{skill}</span>
        </label>
      ))}
    </div>

    {errors.skills && (
      <p className="field-error">{errors.skills}</p>
    )}

    {formData.skills.length > 0 && (
      <>
        <div className="selected-skills">
          {formData.skills.map((skill) => (
            <span key={skill} className="skill-tag">
              <span className="skill-name">{skill}</span>

              <button
                type="button"
                onClick={() => toggleSkill(skill)}
                className="skill-tag-remove"
                aria-label={`${t.removeSkill}: ${skill}`}
                title={t.removeSkill}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="profile-skill-note">
          <strong>{t.selectedSkills}</strong>{" "}
          {t.selectedSkillsNote}
        </div>
      </>
    )}
  </div>

  {submitError && (
    <div className="error-message">{submitError}</div>
  )}

  <button
    type="submit"
    className="register-submit-btn"
    disabled={isLoading || !kycVerified}
  >
    {isLoading ? t.creating : t.create}
  </button>
</form>

          <div className="register-divider">
            <span>{t.already}</span>
          </div>

          <Link to="/login" className="register-link-btn">
            {t.signin}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;