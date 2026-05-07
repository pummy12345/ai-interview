// CandidateDashboard.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../config";
import "./CandidateDashboard.css";

type InterviewRecord = {
  id: string;
  skill?: string;
  trade?: string;
  language?: string;
  averageScore?: number;
  confidenceScore?: number;
  clarityScore?: number;
  category?: string;
  confidenceBand?: string;
  submittedAt?: string;
  createdAt?: string;
};

type CandidateType = {
  _id?: string;
  name?: string;
  phone?: string;
  district?: string;
  skills?: string[];
};

type Lang = "en" | "hi" | "kn";

const text = {
  en: {
    portal: "AI Hiring Platform",
    welcome: "Welcome",
    hero: "Track interview attempts, improve scores, and continue your hiring journey.",
    update: "Update Profile",
    newInterview: "New Interview",
    selectSkill: "Select skill for interview",
    selectPlaceholder: "Select Skill",
    selectText: "Choose the skill in which you want to give interview.",
    start: "Start Interview",
    profile: "Profile",
    phone: "Phone",
    district: "District",
    skills: "Skills",
    total: "Total Attempts",
    average: "Average Score",
    best: "Best Score",
    latest: "Latest Score",
    history: "Interview History",
    historyText: "Your completed interview attempts and scores.",
    loading: "Loading history...",
    noInterview: "No interview yet",
    noInterviewText: "Start your first interview to see analytics.",
    interview: "Interview",
    pending: "Pending",
    confidence: "Confidence",
    clarity: "Clarity",
    band: "Band",
  },

  hi: {
    portal: "एआई हायरिंग प्लेटफॉर्म",
    welcome: "स्वागत है",
    hero: "अपने इंटरव्यू प्रयास और स्कोर ट्रैक करें।",
    update: "प्रोफाइल अपडेट करें",
    newInterview: "नया इंटरव्यू",
    selectSkill: "इंटरव्यू के लिए कौशल चुनें",
    selectPlaceholder: "कौशल चुनें",
    selectText: "जिस कौशल में इंटरव्यू देना चाहते हैं उसे चुनें।",
    start: "इंटरव्यू शुरू करें",
    profile: "प्रोफाइल",
    phone: "फोन",
    district: "जिला",
    skills: "कौशल",
    total: "कुल प्रयास",
    average: "औसत स्कोर",
    best: "सर्वश्रेष्ठ स्कोर",
    latest: "नवीनतम स्कोर",
    history: "इंटरव्यू इतिहास",
    historyText: "आपके इंटरव्यू और स्कोर।",
    loading: "लोड हो रहा है...",
    noInterview: "अभी कोई इंटरव्यू नहीं",
    noInterviewText: "अपना पहला इंटरव्यू शुरू करें।",
    interview: "इंटरव्यू",
    pending: "लंबित",
    confidence: "आत्मविश्वास",
    clarity: "स्पष्टता",
    band: "बैंड",
  },

  kn: {
    portal: "ಎಐ ನೇಮಕಾತಿ ವೇದಿಕೆ",
    welcome: "ಸ್ವಾಗತ",
    hero: "ನಿಮ್ಮ ಸಂದರ್ಶನ ಪ್ರಯತ್ನ ಮತ್ತು ಅಂಕಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    update: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    newInterview: "ಹೊಸ ಸಂದರ್ಶನ",
    selectSkill: "ಸಂದರ್ಶನಕ್ಕಾಗಿ ಕೌಶಲ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    selectPlaceholder: "ಕೌಶಲ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    selectText: "ನೀವು ಸಂದರ್ಶನ ನೀಡಲು ಬಯಸುವ ಕೌಶಲ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    start: "ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ",
    profile: "ಪ್ರೊಫೈಲ್",
    phone: "ಫೋನ್",
    district: "ಜಿಲ್ಲೆ",
    skills: "ಕೌಶಲ್ಯಗಳು",
    total: "ಒಟ್ಟು ಪ್ರಯತ್ನಗಳು",
    average: "ಸರಾಸರಿ ಅಂಕ",
    best: "ಉತ್ತಮ ಅಂಕ",
    latest: "ಇತ್ತೀಚಿನ ಅಂಕ",
    history: "ಸಂದರ್ಶನ ಇತಿಹಾಸ",
    historyText: "ನಿಮ್ಮ ಸಂದರ್ಶನ ಮತ್ತು ಅಂಕಗಳು.",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noInterview: "ಇನ್ನೂ ಸಂದರ್ಶನ ಇಲ್ಲ",
    noInterviewText: "ಮೊದಲ ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ.",
    interview: "ಸಂದರ್ಶನ",
    pending: "ಬಾಕಿ",
    confidence: "ಆತ್ಮವಿಶ್ವಾಸ",
    clarity: "ಸ್ಪಷ್ಟತೆ",
    band: "ಬ್ಯಾಂಡ್",
  },
};

const getSavedCandidate = (): CandidateType | null => {
  try {
    const saved = localStorage.getItem("candidate");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getSavedLanguage = (): Lang => {
  const saved = localStorage.getItem("language") as Lang | null;
  return saved === "hi" || saved === "kn" ? saved : "en";
};

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { candidate } = useAuth();
  const { theme } = useTheme();

  const [localCandidate, setLocalCandidate] = useState<CandidateType | null>(
    getSavedCandidate() || candidate || null
  );

  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Lang>(getSavedLanguage());
  const [selectedSkill, setSelectedSkill] = useState("");

  const t = text[language];

  const fetchLatestCandidate = async () => {
    const savedCandidate = getSavedCandidate();
    const candidateId = savedCandidate?._id || candidate?._id;

    if (!candidateId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/candidates/${candidateId}`
      );

      const data = await response.json();

      if (data.success && data.candidate) {
        setLocalCandidate(data.candidate);

        localStorage.setItem(
          "candidate",
          JSON.stringify(data.candidate)
        );

        if (data.candidate.skills?.length) {
          setSelectedSkill(data.candidate.skills[0]);
        } else {
          setSelectedSkill("");
        }
      }
    } catch (error) {
      console.error("Failed to refresh candidate", error);
    }
  };

  useEffect(() => {
    if (candidate) {
      setLocalCandidate((prev) => ({
        ...prev,
        ...candidate,
      }));
    }
  }, [candidate]);

  useEffect(() => {
    fetchLatestCandidate();

    const syncCandidate = () => {
      const savedCandidate = getSavedCandidate();

      if (savedCandidate) {
        setLocalCandidate(savedCandidate);

        if (savedCandidate.skills?.length) {
          setSelectedSkill(savedCandidate.skills[0]);
        } else {
          setSelectedSkill("");
        }
      }

      fetchLatestCandidate();
    };

    window.addEventListener("candidateUpdated", syncCandidate);

    return () => {
      window.removeEventListener("candidateUpdated", syncCandidate);
    };
  }, [candidate?._id]);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    window.addEventListener("languagechange", syncLanguage);

    return () => {
      window.removeEventListener("languagechange", syncLanguage);
    };
  }, []);

  useEffect(() => {
    if (localCandidate?.skills?.length) {
      setSelectedSkill((prev) =>
        prev && localCandidate.skills?.includes(prev)
          ? prev
          : localCandidate.skills?.[0] || ""
      );
    } else {
      setSelectedSkill("");
    }
  }, [localCandidate?.skills]);

  useEffect(() => {
    if (!localCandidate?.phone) return;

    const fetchHistory = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/candidate/interviews/${localCandidate.phone}`
        );

        const data = await response.json();

        if (data.success) {
          setInterviews(data.interviews || []);
        }
      } catch (error) {
        console.error("Failed to fetch interview history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [localCandidate?.phone]);

  const analytics = useMemo(() => {
    const total = interviews.length;

    if (!total) {
      return {
        total: 0,
        average: 0,
        best: 0,
        latest: 0,
      };
    }

    const scores = interviews.map((item) => item.averageScore || 0);

    return {
      total,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / total),
      best: Math.max(...scores),
      latest: scores[0],
    };
  }, [interviews]);

  return (
    <div className={`candidate-dashboard ${theme}`}>
      <div className="candidate-shell">
        <section className="candidate-hero">
          <div>
            <p className="candidate-eyebrow">{t.portal}</p>

            <h1>
              {t.welcome}, {localCandidate?.name || "Candidate"} 👋
            </h1>

            <p>{t.hero}</p>
          </div>

          <button
            className="primary-action"
            onClick={() => navigate("/update-profile")}
          >
            {t.update}
          </button>
        </section>

        <section className="candidate-card start-interview-card">
          <div className="start-left">
            <p className="candidate-eyebrow">{t.newInterview}</p>

            <h2>{t.selectSkill}</h2>

            <p>{t.selectText}</p>
          </div>

          <div className="start-interview-actions">
            <select
              className="skill-select"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">{t.selectPlaceholder}</option>

              {localCandidate?.skills?.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <button
              className="primary-action large-btn"
              disabled={!selectedSkill}
              onClick={() =>
                navigate("/interview", {
                  state: {
                    skill: selectedSkill,
                    language,
                  },
                })
              }
            >
              {t.start}
            </button>
          </div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card profile-card">
            <h2>{t.profile}</h2>

            <p>
              <span>{t.phone}</span>
              {localCandidate?.phone || "-"}
            </p>

            <p>
              <span>{t.district}</span>
              {localCandidate?.district || "-"}
            </p>

            <p>
              <span>{t.skills}</span>
              {localCandidate?.skills?.length
                ? localCandidate.skills.join(", ")
                : "-"}
            </p>
          </div>

          <div className="analytics-grid">
            <div className="metric-card">
              <span>{t.total}</span>
              <strong>{analytics.total}</strong>
            </div>

            <div className="metric-card">
              <span>{t.average}</span>
              <strong>{analytics.average}</strong>
            </div>

            <div className="metric-card">
              <span>{t.best}</span>
              <strong>{analytics.best}</strong>
            </div>

            <div className="metric-card">
              <span>{t.latest}</span>
              <strong>{analytics.latest}</strong>
            </div>
          </div>
        </section>

        <section className="candidate-card history-card">
          <div className="section-head">
            <div>
              <h2>{t.history}</h2>
              <p>{t.historyText}</p>
            </div>
          </div>

          {loading && <div className="empty-state">{t.loading}</div>}

          {!loading && interviews.length === 0 && (
            <div className="empty-state">
              <h3>{t.noInterview}</h3>
              <p>{t.noInterviewText}</p>
            </div>
          )}

          {!loading && interviews.length > 0 && (
  <div className="history-grid">
    {interviews.map((item, index) => (
      <div className="history-modern-card" key={item.id || index}>
        <div className="history-modern-top">
          <div>
            <h3>{item.skill || item.trade || t.interview}</h3>

            <p>
              {item.language || language}
              {" • "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : item.submittedAt
                ? new Date(item.submittedAt).toLocaleDateString()
                : "Today"}
            </p>
          </div>

          <div className="history-score-circle">
            <strong>{item.averageScore || 0}</strong>
            <span>%</span>
          </div>
        </div>

        <div className="history-modern-metrics">
          <div>
            <span>{t.confidence}</span>
            <strong>{item.confidenceScore || 0}</strong>
          </div>

          <div>
            <span>{t.clarity}</span>
            <strong>{item.clarityScore || 0}</strong>
          </div>

          <div>
            <span>{t.band}</span>
            <strong>{item.confidenceBand || "-"}</strong>
          </div>
        </div>

        <div className="history-bottom">
          <span className="history-category">
            {item.category || t.pending}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
        </section>
      </div>
    </div>
  );
};

export default CandidateDashboard;