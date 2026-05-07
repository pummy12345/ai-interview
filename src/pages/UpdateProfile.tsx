import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import "./UpdateProfle.css";

const SKILLS = [
  "Driver",
  "Electrician",
  "Electrical Technician",
  "Warehouse Operations",
  "Construction Helper",
  "Machine Operator",
  "Retail Associate",
  "Diploma Mechanical",
  "Plumbing",
  "Carpentry",
  "Masonry",
  "HVAC Technician",
];

type Lang = "en" | "hi" | "kn";

type Candidate = {
  _id: string;
  name: string;
  phone: string;
  district: string;
  skills: string[];
};

const text = {
  en: {
    eyebrow: "Candidate Profile",
    title: "Update Profile",
    desc: "Update your district and skills. Name and phone number cannot be changed.",
    loading: "Loading profile...",
    name: "Full Name",
    phone: "Phone Number",
    district: "District",
    districtPlaceholder: "Enter district",
    skillsTitle: "Profile Skills",
    skillsDesc: "Select the skills you want to show on your dashboard.",
    instruction:
      "Instruction: Single click to select a skill. Double click to deselect a selected skill.",
    cancel: "Cancel",
    update: "Update Profile",
    updating: "Updating...",
    districtRequired: "District is required",
    skillRequired: "Please select at least one skill",
    candidateMissing: "Candidate ID not found. Please login again.",
    fetchFailed: "Failed to fetch candidate profile",
    updateFailed: "Profile update failed",
  },
  hi: {
    eyebrow: "उम्मीदवार प्रोफाइल",
    title: "प्रोफाइल अपडेट करें",
    desc: "अपना जिला और कौशल अपडेट करें। नाम और फोन नंबर बदला नहीं जा सकता।",
    loading: "प्रोफाइल लोड हो रही है...",
    name: "पूरा नाम",
    phone: "फोन नंबर",
    district: "जिला",
    districtPlaceholder: "जिला दर्ज करें",
    skillsTitle: "प्रोफाइल कौशल",
    skillsDesc: "वे कौशल चुनें जिन्हें आप डैशबोर्ड पर दिखाना चाहते हैं।",
    instruction:
      "निर्देश: कौशल चुनने के लिए सिंगल क्लिक करें। चुने हुए कौशल को हटाने के लिए डबल क्लिक करें।",
    cancel: "रद्द करें",
    update: "प्रोफाइल अपडेट करें",
    updating: "अपडेट हो रहा है...",
    districtRequired: "जिला आवश्यक है",
    skillRequired: "कृपया कम से कम एक कौशल चुनें",
    candidateMissing: "उम्मीदवार ID नहीं मिली। कृपया दोबारा लॉगिन करें।",
    fetchFailed: "उम्मीदवार प्रोफाइल लोड नहीं हो सकी",
    updateFailed: "प्रोफाइल अपडेट विफल रहा",
  },
  kn: {
    eyebrow: "ಅಭ್ಯರ್ಥಿ ಪ್ರೊಫೈಲ್",
    title: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    desc: "ನಿಮ್ಮ ಜಿಲ್ಲೆ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ನವೀಕರಿಸಿ. ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗುವುದಿಲ್ಲ.",
    loading: "ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    name: "ಪೂರ್ಣ ಹೆಸರು",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    district: "ಜಿಲ್ಲೆ",
    districtPlaceholder: "ಜಿಲ್ಲೆ ನಮೂದಿಸಿ",
    skillsTitle: "ಪ್ರೊಫೈಲ್ ಕೌಶಲ್ಯಗಳು",
    skillsDesc: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ತೋರಿಸಲು ಬಯಸುವ ಕೌಶಲ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    instruction:
      "ಸೂಚನೆ: ಕೌಶಲ್ಯ ಆಯ್ಕೆ ಮಾಡಲು ಸಿಂಗಲ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ಆಯ್ಕೆ ಮಾಡಿದ ಕೌಶಲ್ಯ ತೆಗೆದುಹಾಕಲು ಡಬಲ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    cancel: "ರದ್ದುಮಾಡಿ",
    update: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    districtRequired: "ಜಿಲ್ಲೆ ಅಗತ್ಯವಿದೆ",
    skillRequired: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಕೌಶಲ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    candidateMissing: "ಅಭ್ಯರ್ಥಿ ID ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    fetchFailed: "ಅಭ್ಯರ್ಥಿ ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ",
    updateFailed: "ಪ್ರೊಫೈಲ್ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ",
  },
};

const getLanguage = (): Lang => {
  const saved = localStorage.getItem("language") as Lang | null;
  return saved === "hi" || saved === "kn" ? saved : "en";
};

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, candidate, token } = useAuth() as any;

  const [language, setLanguage] = useState<Lang>(getLanguage());
  const t = text[language];

  const candidateId = useMemo(() => {
    return candidate?._id || user?._id || "";
  }, [candidate, user]);

  const [formData, setFormData] = useState<Candidate>({
    _id: "",
    name: "",
    phone: "",
    district: "",
    skills: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const syncLanguage = () => setLanguage(getLanguage());

    window.addEventListener("languagechange", syncLanguage);

    return () => {
      window.removeEventListener("languagechange", syncLanguage);
    };
  }, []);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        if (!candidateId) {
          setError(t.candidateMissing);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/candidates/${candidateId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || t.fetchFailed);
        }

        setFormData({
          _id: data.candidate._id,
          name: data.candidate.name || "",
          phone: data.candidate.phone || "",
          district: data.candidate.district || "",
          skills: data.candidate.skills || [],
        });
      } catch (err: any) {
        setError(err.message || t.fetchFailed);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId, token]);

  const selectSkill = (skill: string) => {
    setFormData((prev) => {
      if (prev.skills.includes(skill)) return prev;

      return {
        ...prev,
        skills: [...prev.skills, skill],
      };
    });
  };

  const deselectSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const validateForm = () => {
    if (!formData.district.trim()) return t.districtRequired;
    if (formData.skills.length === 0) return t.skillRequired;

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/${candidateId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            district: formData.district.trim(),
            skills: formData.skills,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.updateFailed);
      }

      const updatedCandidate = data.candidate;

      localStorage.setItem("candidate", JSON.stringify(updatedCandidate));

      window.dispatchEvent(new Event("candidateUpdated"));

      navigate("/candidate-dashboard", {
        replace: true,
        state: {
          refresh: Date.now(),
        },
      });
    } catch (err: any) {
      setError(err.message || t.updateFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="update-profile-page">
        <section className="update-profile-card">
          <p className="loading-text">{t.loading}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="update-profile-page">
      <section className="update-profile-card">
        <div className="update-profile-header">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="update-profile-form">
          <div className="form-grid">
            <label>
              {t.name}
              <input value={formData.name} disabled />
            </label>

            <label>
              {t.phone}
              <input value={formData.phone} disabled />
            </label>

            <label>
              {t.district}
              <input
                name="district"
                value={formData.district}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    district: e.target.value,
                  }))
                }
                placeholder={t.districtPlaceholder}
              />
            </label>
          </div>

          <div className="section-block">
            <div className="section-title">
              <h2>{t.skillsTitle}</h2>
              <p>{t.skillsDesc}</p>
            </div>

            <div className="skills-grid">
              {SKILLS.map((skill) => {
                const active = formData.skills.includes(skill);

                return (
                  <button
                    type="button"
                    key={skill}
                    className={active ? "skill-chip active" : "skill-chip"}
                    onClick={() => selectSkill(skill)}
                    onDoubleClick={() => deselectSkill(skill)}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <p className="skill-instruction">{t.instruction}</p>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/candidate-dashboard")}
            >
              {t.cancel}
            </button>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? t.updating : t.update}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default UpdateProfile;