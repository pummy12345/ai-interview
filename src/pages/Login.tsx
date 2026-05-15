import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Login.css";

type UILanguage = "en" | "hi" | "kn";

type LoginForm = {
  aadharNumber: string;
};

const text = {
  en: {
    title: "Welcome Back",
    subtitle: "Login using your Aadhaar number",
    aadhar: "Aadhaar Number",
    login: "Login & Continue",
    logging: "Signing in...",
    newUser: "New candidate?",
    create: "Create account",
    invalidAadhar: "Enter a valid 12-digit Aadhaar number",
    failed: "Login failed. Please check your Aadhaar number.",
  },
  hi: {
    title: "वापस स्वागत है",
    subtitle: "अपने आधार नंबर से लॉगिन करें",
    aadhar: "आधार नंबर",
    login: "लॉगिन करें",
    logging: "लॉगिन हो रहा है...",
    newUser: "नए उम्मीदवार?",
    create: "अकाउंट बनाएं",
    invalidAadhar: "कृपया सही 12 अंकों का आधार नंबर डालें",
    failed: "लॉगिन फेल हुआ। कृपया आधार नंबर चेक करें।",
  },
  kn: {
    title: "ಮತ್ತೆ ಸ್ವಾಗತ",
    subtitle: "ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆಯಿಂದ ಲಾಗಿನ್ ಮಾಡಿ",
    aadhar: "ಆಧಾರ್ ಸಂಖ್ಯೆ",
    login: "ಲಾಗಿನ್ ಮಾಡಿ",
    logging: "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    newUser: "ಹೊಸ ಅಭ್ಯರ್ಥಿ?",
    create: "ಖಾತೆ ರಚಿಸಿ",
    invalidAadhar: "ಸರಿಯಾದ 12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    failed: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
  },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useLanguage();

  const uiLanguage = language as UILanguage;
  const t = text[uiLanguage];

  const [formData, setFormData] = useState<LoginForm>({
    aadharNumber: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<LoginForm>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    const token = localStorage.getItem("token");

    if (isAdminLoggedIn) {
      navigate("/admin-dashboard", { replace: true });
      return;
    }

    if (token) {
      navigate("/candidate-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/\D/g, "").slice(0, 12);

    setFormData({
      aadharNumber: cleanedValue,
    });

    setFieldErrors({});
    setError("");
  };

  const validateForm = () => {
    const errors: Partial<LoginForm> = {};

    if (formData.aadharNumber.length !== 12) {
      errors.aadharNumber = t.invalidAadhar;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await login({
        phone: "",
        aadharNumber: formData.aadharNumber,
      });

      if (user) {
        navigate("/candidate-dashboard", { replace: true });
      } else {
        setError(t.failed);
      }
    } catch {
      setError(t.failed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <span className="login-badge">HireSmart AI</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>{t.aadhar}</label>

            <div className="aadhar-input-wrap">
              <input
                type="text"
                name="aadharNumber"
                inputMode="numeric"
                placeholder={t.aadhar}
                value={formData.aadharNumber}
                onChange={handleChange}
                maxLength={12}
              />
              <span className="aadhar-input-icon">🪪</span>
            </div>

            {fieldErrors.aadharNumber && (
              <span className="field-error">{fieldErrors.aadharNumber}</span>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? t.logging : t.login}
          </button>
        </form>

        <div className="login-footer">
          <span>{t.newUser}</span>
          <Link to="/register">{t.create}</Link>
        </div>
      </section>
    </main>
  );
};

export default Login;