import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import "./Navbar.css";

const navText = {
  en: {
    dark: "🌙 Dark",
    light: "☀️ Light",
    signin: "Sign in",
    join: "Join now",
    logout: "Logout",
    admin: "Admin Dashboard",
    language: "Language",
  },
  hi: {
    dark: "🌙 डार्क",
    light: "☀️ लाइट",
    signin: "लॉगिन",
    join: "खाता बनाएं",
    logout: "लॉगआउट",
    admin: "एडमिन डैशबोर्ड",
    language: "भाषा",
  },
  kn: {
    dark: "🌙 ಡಾರ್ಕ್",
    light: "☀️ ಲೈಟ್",
    signin: "ಲಾಗಿನ್",
    join: "ಖಾತೆ ತೆರೆಯಿರಿ",
    logout: "ಲಾಗ್‌ಔಟ್",
    admin: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    language: "ಭಾಷೆ",
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, candidate, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const t = navText[language];
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const changeLanguage = (selectedLang: "en" | "hi" | "kn") => {
    setLanguage(selectedLang);
    localStorage.setItem("language", selectedLang);
    window.dispatchEvent(new Event("languagechange"));
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("candidate");
    localStorage.removeItem("isAuthenticated");
    closeMobileMenu();
    navigate("/");
  };

  const handleCandidateLoginClick = () => {
    localStorage.removeItem("adminLoggedIn");
    closeMobileMenu();
    navigate("/login");
  };

  const handleCandidateRegisterClick = () => {
    localStorage.removeItem("adminLoggedIn");
    closeMobileMenu();
    navigate("/register");
  };

  const initial = candidate?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <NavLink to="/" className="nav-logo" onClick={closeMobileMenu}>
            <span className="logo-mark">H</span>
            <span>HireSmart AI</span>
          </NavLink>

          <div className={`nav-actions ${mobileMenuOpen ? "active" : ""}`}>
            <select
              className="language-dropdown"
              value={language}
              onChange={(e) =>
                changeLanguage(e.target.value as "en" | "hi" | "kn")
              }
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            <div className="mobile-language-panel">
              <span>{t.language}</span>

              <div className="mobile-language-buttons">
                <button
                  type="button"
                  className={language === "en" ? "selected" : ""}
                  onClick={() => changeLanguage("en")}
                >
                  English
                </button>

                <button
                  type="button"
                  className={language === "hi" ? "selected" : ""}
                  onClick={() => changeLanguage("hi")}
                >
                  हिंदी
                </button>

                <button
                  type="button"
                  className={language === "kn" ? "selected" : ""}
                  onClick={() => changeLanguage("kn")}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => {
                toggleTheme();
                setTimeout(() => {
                  window.dispatchEvent(new Event("themechange"));
                  window.dispatchEvent(new Event("theme-change"));
                }, 0);
              }}
            >
              {theme === "light" ? t.dark : t.light}
            </button>

            {isAdminLoggedIn ? (
              <>
                <NavLink
                  to="/admin-dashboard"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  {t.admin}
                </NavLink>

                <button
                  type="button"
                  className="nav-link signin-link"
                  onClick={handleCandidateLoginClick}
                >
                  {t.signin}
                </button>

                <button
                  type="button"
                  className="nav-logout"
                  onClick={handleLogout}
                >
                  {t.logout}
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <div className="avatar">{initial}</div>

                <button
                  type="button"
                  className="nav-logout"
                  onClick={handleLogout}
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="nav-link signin-link"
                  onClick={handleCandidateLoginClick}
                >
                  {t.signin}
                </button>

                <button
                  type="button"
                  className="nav-cta"
                  onClick={handleCandidateRegisterClick}
                >
                  {t.join}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className={`hamburger-menu ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <button
          type="button"
          className="drawer-backdrop"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default Navbar;