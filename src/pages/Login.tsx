import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Login.css";

type UILanguage = "en" | "hi" | "kn";

type LoginForm = {
  phone: string;
  aadharNumber: string;
};

const text = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to continue your AI interview",
    phone: "Phone Number",
    aadhar: "Aadhar Number",
    login: "Login & Continue",
    logging: "Signing in...",
    newUser: "New candidate?",
    create: "Create account",
    invalidPhone: "Enter a valid 10-digit phone number",
    invalidAadhar: "Enter a valid 12-digit Aadhar number",
    failed: "Login failed. Please check your details.",
  },
  hi: {
    title: "वापस स्वागत है",
    subtitle: "AI इंटरव्यू जारी रखने के लिए लॉगिन करें",
    phone: "फोन नंबर",
    aadhar: "आधार नंबर",
    login: "लॉगिन करें",
    logging: "लॉगिन हो रहा है...",
    newUser: "नए उम्मीदवार?",
    create: "अकाउंट बनाएं",
    invalidPhone: "कृपया सही 10 अंकों का फोन नंबर डालें",
    invalidAadhar: "कृपया सही 12 अंकों का आधार नंबर डालें",
    failed: "लॉगिन फेल हुआ। कृपया details चेक करें।",
  },
  kn: {
    title: "ಮತ್ತೆ ಸ್ವಾಗತ",
    subtitle: "AI ಸಂದರ್ಶನ ಮುಂದುವರಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    aadhar: "ಆಧಾರ್ ಸಂಖ್ಯೆ",
    login: "ಲಾಗಿನ್ ಮಾಡಿ",
    logging: "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    newUser: "ಹೊಸ ಅಭ್ಯರ್ಥಿ?",
    create: "ಖಾತೆ ರಚಿಸಿ",
    invalidPhone: "ಸರಿಯಾದ 10 ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    invalidAadhar: "ಸರಿಯಾದ 12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    failed: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
  },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
    useEffect(() => {
  const isAdminLoggedIn =
    localStorage.getItem("adminLoggedIn") === "true";

  const token = localStorage.getItem("token");

  if (isAdminLoggedIn) {
    navigate("/admin-dashboard", {
      replace: true,
    });

    return;
  }

  if (token) {
    navigate("/candidate-dashboard", {
      replace: true,
    });
  }
}, [navigate]);
  const { login } = useAuth();

  const { language: uiLanguage } = useLanguage();
  const [formData, setFormData] = useState<LoginForm>({
    phone: "",
    aadharNumber: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<LoginForm>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = text[uiLanguage];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const maxLength = name === "phone" ? 10 : 12;
    const cleanedValue = value.replace(/\D/g, "").slice(0, maxLength);

    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const errors: Partial<LoginForm> = {};

    if (formData.phone.length !== 10) {
      errors.phone = t.invalidPhone;
    }

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
      const user = await login(formData);

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
            <label>{t.phone}</label>
            <input
              type="text"
              name="phone"
              inputMode="numeric"
              placeholder={t.phone}
              value={formData.phone}
              onChange={handleChange}
            />
            {fieldErrors.phone && (
              <span className="field-error">{fieldErrors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label>{t.aadhar}</label>
            <input
              type="text"
              name="aadharNumber"
              inputMode="numeric"
              placeholder={t.aadhar}
              value={formData.aadharNumber}
              onChange={handleChange}
            />
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