import { useNavigate } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-glow hero-glow-one"></div>
      <div className="hero-glow hero-glow-two"></div>

      <div className="hero-wrapper">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI hiring platform for skilled workers
          </div>

          <h1>
            AI Interviews for <span>Faster Hiring</span>
          </h1>

          <p>
            Help candidates complete interviews in Hindi, Kannada, or English.
            Employers get instant scores, fraud checks, and hiring insights.
          </p>

          <div className="hero-languages">
            <span>ಕನ್ನಡ</span>
            <span>हिंदी</span>
            <span>English</span>
          </div>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/register")}>
              Start Interview
            </button>

            <button className="secondary-btn" onClick={() => navigate("/admin")}>
              Employer Dashboard
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>2 min</strong>
              <span>AI interview</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Languages</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Scoring</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-card">
            <img
  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80"
  alt="Worker using mobile phone for interview"
/>
            <div className="floating-card score-card">
              <span>Candidate Score</span>
              <strong>82%</strong>
              <p>Job-ready</p>
            </div>

            <div className="floating-card voice-card">
              <span className="voice-dot"></span>
              Voice interview active
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;