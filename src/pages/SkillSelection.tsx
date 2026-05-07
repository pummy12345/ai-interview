import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SkillSelection.css";

const languageOptions = [
  {
    code: "en-US",
    label: "English",
    detail: "Simple spoken English",
  },
  {
    code: "hi-IN",
    label: "हिंदी",
    detail: "Hindi for conversational interviews",
  },
  {
    code: "kn-IN",
    label: "ಕನ್ನಡ",
    detail: "Kannada with regional dialect support",
  },
];

const defaultSkills = [
  "Electrician",
  "Plumber",
  "Welder",
  "Carpenter",
  "Tailor",
  "Driver",
  "Housekeeping",
  "Security Guard",
  "Machine Operator",
  "Data Entry",
];

const SkillSelection: React.FC = () => {
  const navigate = useNavigate();
  const { candidate, updateCandidate } = useAuth();

  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("en-US");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!candidate) {
      navigate("/login", { replace: true });
    }
  }, [candidate, navigate]);

  if (!candidate) return null;

  const availableSkills =
    candidate.skills && candidate.skills.length > 0
      ? candidate.skills
      : defaultSkills;

  const handleStartInterview = () => {
    if (!selectedSkill) {
      setError("Please select a skill to interview for");
      return;
    }

    const updatedCandidate = {
      ...candidate,
      selectedSkill,
      skill: selectedSkill,
      trade: selectedSkill,
      interviewLanguage: selectedLanguage,
    };

    updateCandidate(updatedCandidate);

    navigate("/interview", {
      state: {
        skill: selectedSkill,
        language: selectedLanguage,
        candidate: updatedCandidate,
      },
    });
  };

  return (
    <div className="skill-page">
      <div className="skill-container">
        {/* HEADER */}
        <div className="skill-header">
          <h1>Select Interview Skill</h1>
          <p>
            Welcome <strong>{candidate.name}</strong>, choose your skill and
            language for today’s interview.
          </p>
        </div>

        {/* SKILL SELECTION */}
        <div className="skill-grid-modern">
          {availableSkills.map((skill) => (
            <div
              key={skill}
              className={`skill-card ${
                selectedSkill === skill ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSkill(skill);
                setError("");
              }}
            >
              {skill}
            </div>
          ))}
        </div>

        {/* LANGUAGE SELECTION */}
        <div className="language-grid">
          {languageOptions.map((lang) => (
            <div
              key={lang.code}
              className={`language-card ${
                selectedLanguage === lang.code ? "active" : ""
              }`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <div>
                <div className="language-title">{lang.label}</div>
                <div className="language-desc">{lang.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ERROR */}
        {error && <div className="error-text">{error}</div>}

        {/* START BUTTON */}
        <button className="start-btn" onClick={handleStartInterview}>
          Start Interview
        </button>

        {/* UPDATE PROFILE */}
        <div
          className="update-link"
          onClick={() => navigate("/update-profile")}
        >
          Update Skills & Profile
        </div>
      </div>
    </div>
  );
};

export default SkillSelection;