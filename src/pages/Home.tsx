import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Home.css";

type LanguageCode = "en" | "hi" | "kn";

const content: Record<LanguageCode, any> = {
  en: {
    badge: "AI hiring platform for skilled workers",
    title: "AI Interviews for",
    highlight: "Faster Hiring",
    tagline: "From Voice to Job: AI-Based Candidate Evaluation",
    desc: "Help candidates complete interviews in English, Hindi, or Kannada. Employers get instant scores, fraud checks, and hiring insights.",
    start: "Start Interview",
    employer: "Employer Dashboard",
    stats: [
      { value: "5 min", label: "AI interview" },
      { value: "3", label: "Languages" },
      { value: "AI", label: "Scoring" },
    ],
    overviewSmall: "Platform Overview",
    overview: "Built for candidates and employers",
    features: [
      {
        icon: "🎙️",
        title: "Multi-language AI",
        desc: "Supports Kannada, Hindi, and English interviews seamlessly",
      },
      {
        icon: "📊",
        title: "Instant Scoring",
        desc: "Get real-time feedback on clarity, confidence, and relevance",
      },
      {
        icon: "🔍",
        title: "Fraud Detection",
        desc: "Detect duplicate answers, low quality, and suspicious activity",
      },
      {
        icon: "🗂️",
        title: "Smart Classification",
        desc: "Automatically categorize candidates as job-ready or needs training",
      },
      {
        icon: "🏛️",
        title: "Employer Dashboard",
        desc: "View, filter, and shortlist candidates easily",
      },
      {
        icon: "📱",
        title: "Mobile Friendly",
        desc: "Works perfectly with camera and voice on any device",
      },
    ],
  },

  hi: {
    badge: "कुशल कामगारों के लिए AI hiring platform",
    title: "शीघ्र भर्ती के लिए",
    highlight: "AI इंटरव्यू",
    tagline: "आवाज़ से नौकरी तक: AI आधारित उम्मीदवार मूल्यांकन",
    desc: "उम्मीदवार हिंदी, कन्नड़ या अंग्रेज़ी में इंटरव्यू दे सकते हैं। नियोक्ता तुरंत स्कोर, फ्रॉड चेक और hiring insights देख सकते हैं।",
    start: "इंटरव्यू शुरू करें",
    employer: "नियोक्ता डैशबोर्ड",
    stats: [
      { value: "5 मिनट", label: "AI इंटरव्यू" },
      { value: "3", label: "भाषाएँ" },
      { value: "AI", label: "स्कोरिंग" },
    ],
    overviewSmall: "प्लेटफॉर्म ओवरव्यू",
    overview: "उम्मीदवारों और नियोक्ताओं के लिए बनाया गया",
    features: [
      {
        icon: "🎙️",
        title: "बहुभाषी AI",
        desc: "कन्नड़, हिंदी और अंग्रेज़ी इंटरव्यू को आसानी से सपोर्ट करता है",
      },
      {
        icon: "📊",
        title: "तुरंत स्कोरिंग",
        desc: "स्पष्टता, आत्मविश्वास और relevance पर तुरंत feedback मिलता है",
      },
      {
        icon: "🔍",
        title: "फ्रॉड डिटेक्शन",
        desc: "Duplicate answers, low quality और suspicious activity को detect करता है",
      },
      {
        icon: "🗂️",
        title: "स्मार्ट classification",
        desc: "Candidate को job-ready या training-needed category में classify करता है",
      },
      {
        icon: "🏛️",
        title: "नियोक्ता डैशबोर्ड",
        desc: "Candidates को view, filter और shortlist करना आसान बनाता है",
      },
      {
        icon: "📱",
        title: "मोबाइल फ्रेंडली",
        desc: "Camera और voice के साथ किसी भी device पर काम करता है",
      },
    ],
  },

  kn: {
    badge: "ನಿಪುಣ ಕಾರ್ಮಿಕರಿಗಾಗಿ AI hiring platform",
    title: "ತಕ್ಷಣ ನೇಮಕಾತಿಗಾಗಿ",
    highlight: "AI ಸಂದರ್ಶನಗಳು",
    tagline: "ಧ್ವನಿಯಿಂದ ಉದ್ಯೋಗದವರೆಗೆ: AI ಆಧಾರಿತ ಅಭ್ಯರ್ಥಿ ಮೌಲ್ಯಮಾಪನ",
    desc: "ಅಭ್ಯರ್ಥಿಗಳು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸಂದರ್ಶನ ನೀಡಬಹುದು. ಉದ್ಯೋಗದಾತರು ತಕ್ಷಣ ಸ್ಕೋರ್, ಮೋಸ ಪರಿಶೀಲನೆ ಮತ್ತು hiring insights ನೋಡಬಹುದು.",
    start: "ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ",
    employer: "ಉದ್ಯೋಗದಾತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    stats: [
      { value: "5 ನಿಮಿಷ", label: "AI ಸಂದರ್ಶನ" },
      { value: "3", label: "ಭಾಷೆಗಳು" },
      { value: "AI", label: "ಸ್ಕೋರಿಂಗ್" },
    ],
    overviewSmall: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅವಲೋಕನ",
    overview: "ಅಭ್ಯರ್ಥಿಗಳು ಮತ್ತು ಉದ್ಯೋಗದಾತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
    features: [
      {
        icon: "🎙️",
        title: "ಬಹುಭಾಷಾ AI",
        desc: "ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಸಂದರ್ಶನಗಳನ್ನು ಸುಲಭವಾಗಿ ಬೆಂಬಲಿಸುತ್ತದೆ",
      },
      {
        icon: "📊",
        title: "ತಕ್ಷಣದ ಸ್ಕೋರಿಂಗ್",
        desc: "ಸ್ಪಷ್ಟತೆ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು relevance ಬಗ್ಗೆ ತಕ್ಷಣ feedback ನೀಡುತ್ತದೆ",
      },
      {
        icon: "🔍",
        title: "ಮೋಸ ಪತ್ತೆ",
        desc: "Duplicate answers, low quality ಮತ್ತು suspicious activity ಅನ್ನು ಪತ್ತೆಹಚ್ಚುತ್ತದೆ",
      },
      {
        icon: "🗂️",
        title: "ಸ್ಮಾರ್ಟ್ ವರ್ಗೀಕರಣ",
        desc: "Candidate ಅನ್ನು job-ready ಅಥವಾ training-needed category ಗೆ classify ಮಾಡುತ್ತದೆ",
      },
      {
        icon: "🏛️",
        title: "ಉದ್ಯೋಗದಾತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        desc: "Candidates ಅನ್ನು view, filter ಮತ್ತು shortlist ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ",
      },
      {
        icon: "📱",
        title: "ಮೊಬೈಲ್ ಸ್ನೇಹಿ",
        desc: "Camera ಮತ್ತು voice ಜೊತೆಗೆ ಯಾವುದೇ device ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
      },
    ],
  },
};

const Home = () => {
  const navigate = useNavigate();
  const { candidate } = useAuth();
  const { language} = useLanguage();

  const t = content[language];

  const handleStartInterview = () => {
    if (!candidate) {
      navigate("/login");
      return;
    }

    navigate("/candidate-dashboard");
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-card">
            <div className="hero-left">
              <div className="hero-top-row">
                <div className="hero-badge">
                  <span className="badge-dot"></span>
                  {t.badge}
                </div>
              </div>

              

              <h1>
                {t.title} <span>{t.highlight}</span>
              </h1>

              <h2 className="hero-tagline">{t.tagline}</h2>

              <p className="hero-description">{t.desc}</p>

              <div className="hero-buttons">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleStartInterview}
                >
                  {t.start}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate("/admin")}
                >
                  {t.employer}
                </button>
              </div>

              <div className="hero-stats">
                {t.stats.map((item: { value: string; label: string }) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <img src="/workers-collage.png" alt="Skilled workers collage" />

              <div className="floating-card top-card">
                <strong>AI Verified</strong>
                <span>Voice + camera checks</span>
              </div>

              <div className="floating-card bottom-card">
                <strong>Instant Score</strong>
                <span>Ready for employers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <p className="features-subtitle">{t.overviewSmall}</p>

        <h2 className="features-title">{t.overview}</h2>

        <div className="feature-grid">
          {t.features.map(
            (item: { icon: string; title: string; desc: string }) => (
              <div className="feature-card" key={item.title}>
                <span className="icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;