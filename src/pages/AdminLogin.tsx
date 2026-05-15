import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";

const text = {
  en: {
    title: "Admin Login",
    subtitle: "Secure AI recruitment dashboard access",
    adminId: "Admin ID",
    password: "Password",
    login: "Login as Admin",
    logging: "Signing in...",
    invalid: "Invalid admin credentials",
  },

  hi: {
    title: "एडमिन लॉगिन",
    subtitle: "सिक्योर AI भर्ती डैशबोर्ड एक्सेस",
    adminId: "एडमिन आईडी",
    password: "पासवर्ड",
    login: "एडमिन लॉगिन",
    logging: "लॉगिन हो रहा है...",
    invalid: "गलत एडमिन क्रेडेंशियल",
  },

  kn: {
    title: "ಅಡ್ಮಿನ್ ಲಾಗಿನ್",
    subtitle: "ಸುರಕ್ಷಿತ AI ನೇಮಕಾತಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶ",
    adminId: "ಅಡ್ಮಿನ್ ಐಡಿ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    login: "ಅಡ್ಮಿನ್ ಲಾಗಿನ್",
    logging: "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    invalid: "ತಪ್ಪಾದ ಅಡ್ಮಿನ್ ವಿವರಗಳು",
  },
};

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const t = text[language];

  const [formData, setFormData] = useState({
    adminId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    setTimeout(() => {
      // Demo credentials
      const validAdminId = "admin";
      const validPassword = "admin123";

      if (
        formData.adminId === validAdminId &&
        formData.password === validPassword
      ) {
        // clear candidate session
        logout();

        localStorage.removeItem("token");
        localStorage.removeItem("candidate");
        localStorage.removeItem("isAuthenticated");

        // set admin session
        localStorage.setItem(
          "adminLoggedIn",
          "true"
        );

        navigate("/admin", {
          replace: true,
        });
      } else {
        setError(t.invalid);
      }

      setLoading(false);
    }, 700);
  };

  return (
    <main
      className={`admin-login-page ${
        theme === "light"
          ? "admin-light"
          : "admin-dark"
      }`}
    >
      <section className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-badge">
            HireSmart AI
          </span>

          <h1>{t.title}</h1>

          <p>{t.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >
          <div className="form-group">
            <label>{t.adminId}</label>

            <input
              type="text"
              value={formData.adminId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adminId: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>{t.password}</label>

            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <button type="submit">
            {loading
              ? t.logging
              : t.login}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;