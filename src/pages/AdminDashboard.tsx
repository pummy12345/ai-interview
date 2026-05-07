import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import "./AdminDashboard.css";

type AppLang = "en" | "hi" | "kn";
type AppTheme = "light" | "dark";

type CandidateRecord = {
  id: string;
  candidate?: {
    name?: string;
    phone?: string;
    district?: string;
    trade?: string;
    skill?: string;
    language?: string;
  };

  name?: string;
  phone?: string;
  district?: string;
  trade?: string;
  skill?: string;
  language?: string;

  averageScore: number;
  confidenceScore: number;
  confidenceBand?: string;

  category?: string;
  skillCategory?: string;

  flaggedReasons?: string[];

  repeatedAttempt?: boolean;
  attemptCount?: number;

  decision?: string;

  submittedAt?: string;
};

type Summary = {
  totalCandidates: number;
  flaggedCases: number;
  districts: string[];
  skills: string[];
  languages: string[];
  categories: string[];
};

const getNavbarLang = (): AppLang => {
  const saved = localStorage.getItem("language");

  if (saved === "hi") return "hi";
  if (saved === "kn") return "kn";

  return "en";
};

const getNavbarTheme = (): AppTheme => {
  return localStorage.getItem("theme") === "light"
    ? "light"
    : "dark";
};

const TEXT = {
  en: {
    eyebrow: "AI Hiring Command Center",
    title:
      "AI-powered workforce screening dashboard for smarter hiring decisions.",
    desc:
      "Review AI interview scores, confidence, fraud signals, language performance and final hiring decisions.",

    refresh: "Refresh live data",
    export: "Export report",

    total: "Total Candidates",
    avg: "Average Score",
    flagged: "Flagged Cases",
    matched: "Matched Records",

    totalDesc: "All completed interviews",
    avgDesc: "Overall interview quality",
    flaggedDesc: "Needs manual attention",
    matchedDesc: "After selected filters",

    search: "Search candidate",
    district: "District",
    skill: "Skill",
    language: "Language",
    category: "Category",

    allDistricts: "All districts",
    allSkills: "All skills",
    allLanguages: "All languages",
    allCategories: "All categories",

    flaggedOnly: "Flagged only",
    reset: "Reset",

    sortBy: "Sort by",
    direction: "Direction",
    pageSize: "Page size",

    interviewScore: "Interview score",
    confidenceScore: "Confidence score",

    highLow: "High to low",
    lowHigh: "Low to high",

    loading: "Loading dashboard...",
    noRecords:
      "No candidate records match the selected filters.",

    previous: "Previous",
    next: "Next",

    page: "Page",
    of: "of",

    confidence: "Confidence",
    currentDecision: "Current decision",
  },

  hi: {
    eyebrow: "एआई हायरिंग कमांड सेंटर",
    title:
      "स्मार्ट हायरिंग निर्णयों के लिए एआई-पावर्ड वर्कफोर्स स्क्रीनिंग डैशबोर्ड।",
    desc:
      "इंटरव्यू स्कोर, कॉन्फिडेंस और अंतिम निर्णय देखें।",

    refresh: "लाइव डेटा रीफ्रेश करें",
    export: "रिपोर्ट एक्सपोर्ट करें",

    total: "कुल उम्मीदवार",
    avg: "औसत स्कोर",
    flagged: "फ्लैग केस",
    matched: "मैच रिकॉर्ड",

    totalDesc: "सभी पूरे हुए इंटरव्यू",
    avgDesc: "कुल इंटरव्यू गुणवत्ता",
    flaggedDesc: "मैनुअल ध्यान चाहिए",
    matchedDesc: "फिल्टर के बाद",

    search: "उम्मीदवार खोजें",
    district: "जिला",
    skill: "स्किल",
    language: "भाषा",
    category: "कैटेगरी",

    allDistricts: "सभी जिले",
    allSkills: "सभी स्किल",
    allLanguages: "सभी भाषाएं",
    allCategories: "सभी कैटेगरी",

    flaggedOnly: "केवल फ्लैग",
    reset: "रीसेट",

    sortBy: "सॉर्ट करें",
    direction: "दिशा",
    pageSize: "पेज साइज",

    interviewScore: "इंटरव्यू स्कोर",
    confidenceScore: "कॉन्फिडेंस स्कोर",

    highLow: "ज्यादा से कम",
    lowHigh: "कम से ज्यादा",

    loading: "डैशबोर्ड लोड हो रहा है...",
    noRecords:
      "चुने गए फिल्टर से कोई रिकॉर्ड नहीं मिला।",

    previous: "पिछला",
    next: "अगला",

    page: "पेज",
    of: "का",

    confidence: "कॉन्फिडेंस",
    currentDecision: "वर्तमान निर्णय",
  },

  kn: {
    eyebrow: "ಎಐ ಹೈರಿಂಗ್ ಕಮಾಂಡ್ ಸೆಂಟರ್",
    title:
      "ಸ್ಮಾರ್ಟ್ ನೇಮಕಾತಿ ನಿರ್ಧಾರಗಳಿಗಾಗಿ ಎಐ ಆಧಾರಿತ ವರ್ಕ್‌ಫೋರ್ಸ್ ಸ್ಕ್ರೀನಿಂಗ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.",
    desc:
      "ಸಂದರ್ಶನ ಸ್ಕೋರ್ ಮತ್ತು ಅಂತಿಮ ನಿರ್ಧಾರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",

    refresh: "ಲೈವ್ ಡೇಟಾ ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    export: "ರಿಪೋರ್ಟ್ ಎಕ್ಸ್‌ಪೋರ್ಟ್ ಮಾಡಿ",

    total: "ಒಟ್ಟು ಅಭ್ಯರ್ಥಿಗಳು",
    avg: "ಸರಾಸರಿ ಸ್ಕೋರ್",
    flagged: "ಫ್ಲ್ಯಾಗ್ ಪ್ರಕರಣಗಳು",
    matched: "ಹೊಂದಿದ ದಾಖಲೆಗಳು",

    totalDesc: "ಪೂರ್ಣಗೊಂಡ ಸಂದರ್ಶನಗಳು",
    avgDesc: "ಒಟ್ಟು ಸಂದರ್ಶನ ಗುಣಮಟ್ಟ",
    flaggedDesc: "ಮ್ಯಾನುಯಲ್ ಗಮನ ಬೇಕು",
    matchedDesc: "ಫಿಲ್ಟರ್ ನಂತರ",

    search: "ಅಭ್ಯರ್ಥಿಯನ್ನು ಹುಡುಕಿ",
    district: "ಜಿಲ್ಲೆ",
    skill: "ಕೌಶಲ್ಯ",
    language: "ಭಾಷೆ",
    category: "ವರ್ಗ",

    allDistricts: "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು",
    allSkills: "ಎಲ್ಲಾ ಕೌಶಲ್ಯಗಳು",
    allLanguages: "ಎಲ್ಲಾ ಭಾಷೆಗಳು",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",

    flaggedOnly: "ಫ್ಲ್ಯಾಗ್ ಮಾತ್ರ",
    reset: "ರೀಸೆಟ್",

    sortBy: "ಸೋರ್ಟ್ ಮಾಡಿ",
    direction: "ದಿಕ್ಕು",
    pageSize: "ಪೇಜ್ ಗಾತ್ರ",

    interviewScore: "ಸಂದರ್ಶನ ಸ್ಕೋರ್",
    confidenceScore: "ವಿಶ್ವಾಸ ಸ್ಕೋರ್",

    highLow: "ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ",
    lowHigh: "ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು",

    loading: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noRecords:
      "ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ದಾಖಲೆಗಳಿಲ್ಲ.",

    previous: "ಹಿಂದಿನದು",
    next: "ಮುಂದಿನದು",

    page: "ಪುಟ",
    of: "ರಲ್ಲಿ",

    confidence: "ವಿಶ್ವಾಸ",
    currentDecision: "ಪ್ರಸ್ತುತ ನಿರ್ಧಾರ",
  },
};

const AdminDashboard = () => {
  const [lang, setLang] =
    useState<AppLang>(getNavbarLang());

  const [theme, setTheme] =
    useState<AppTheme>(getNavbarTheme());

  const t = TEXT[lang];

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [candidates, setCandidates] = useState<
    CandidateRecord[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    district: "",
    skill: "",
    language: "",
    category: "",
    flagged: false,
  });

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [sortKey, setSortKey] = useState<
    "averageScore" | "confidenceScore"
  >("averageScore");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("desc");

  useEffect(() => {
    const syncNavbarSettings = () => {
      setLang(getNavbarLang());
      setTheme(getNavbarTheme());
    };

    window.addEventListener(
      "storage",
      syncNavbarSettings
    );

    window.addEventListener(
      "languagechange",
      syncNavbarSettings
    );

    window.addEventListener(
      "language-change",
      syncNavbarSettings
    );

    window.addEventListener(
      "themechange",
      syncNavbarSettings
    );

    window.addEventListener(
      "theme-change",
      syncNavbarSettings
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncNavbarSettings
      );

      window.removeEventListener(
        "languagechange",
        syncNavbarSettings
      );

      window.removeEventListener(
        "language-change",
        syncNavbarSettings
      );

      window.removeEventListener(
        "themechange",
        syncNavbarSettings
      );

      window.removeEventListener(
        "theme-change",
        syncNavbarSettings
      );
    };
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const summaryRes = await fetch(
        `${API_BASE_URL}/api/admin/summary`
      );

      const candidateRes = await fetch(
        `${API_BASE_URL}/api/admin/candidates`
      );

      const summaryData = await summaryRes.json();

      const candidateData = await candidateRes.json();

      setSummary(summaryData);

      setCandidates(candidateData.candidates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((candidate) => {
        const candidateName =
          candidate.candidate?.name ||
          candidate.name ||
          "";

        const district =
          candidate.candidate?.district ||
          candidate.district ||
          "";

        const skill =
          candidate.candidate?.skill ||
          candidate.skill ||
          "";

        const language =
          candidate.candidate?.language ||
          candidate.language ||
          "";

        const category =
          candidate.category || "";

        const searchText = `${candidateName} ${district} ${skill}`
          .toLowerCase();

        const matchesSearch = searchText.includes(
          searchTerm.toLowerCase()
        );

        const matchesDistrict =
          !filters.district ||
          district === filters.district;

        const matchesSkill =
          !filters.skill ||
          skill === filters.skill;

        const matchesLanguage =
          !filters.language ||
          language === filters.language;

        const matchesCategory =
          !filters.category ||
          category === filters.category;

        const matchesFlag =
          !filters.flagged ||
          (candidate.flaggedReasons || []).length > 0;

        return (
          matchesSearch &&
          matchesDistrict &&
          matchesSkill &&
          matchesLanguage &&
          matchesCategory &&
          matchesFlag
        );
      })

      .sort((a, b) => {
        const valueA = a[sortKey] || 0;
        const valueB = b[sortKey] || 0;

        return sortDirection === "desc"
          ? valueB - valueA
          : valueA - valueB;
      });
  }, [
    candidates,
    filters,
    searchTerm,
    sortKey,
    sortDirection,
  ]);

  const paginatedCandidates =
    filteredCandidates.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  const totalPages = Math.ceil(
    filteredCandidates.length / pageSize
  );

  return (
    <div
      className={`dashboard-shell ${
        theme === "light"
          ? "dashboard-light"
          : "dashboard-dark"
      }`}
    >
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">
              {t.eyebrow}
            </p>

            <h1>{t.title}</h1>

            <p>{t.desc}</p>

            <div className="hero-actions">
              <button onClick={loadDashboard}>
                {t.refresh}
              </button>

              <button
  className="ghost-btn"
  onClick={() => {
    if (!filteredCandidates.length) return;

    const header = [
      "Name",
      "District",
      "Skill",
      "Language",
      "Average Score",
      "Confidence Score",
      "Category",
      "Decision",
    ];

    const rows = filteredCandidates.map((candidate) => {
      const name =
        candidate.candidate?.name ||
        candidate.name ||
        "";

      const district =
        candidate.candidate?.district ||
        candidate.district ||
        "";

      const skill =
        candidate.candidate?.skill ||
        candidate.skill ||
        "";

      const language =
        candidate.candidate?.language ||
        candidate.language ||
        "";

      return [
        name,
        district,
        skill,
        language,
        candidate.averageScore,
        candidate.confidenceScore,
        candidate.category || "",
        candidate.decision || "",
      ];
    });

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `hire-smart-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }}
>
  {t.export}
</button>
            </div>
          </div>
        </section>

        <section className="insight-grid">
          <div className="insight-card primary">
            <span>{t.total}</span>

            <strong>
              {summary?.totalCandidates || 0}
            </strong>

            <p>{t.totalDesc}</p>
          </div>

          <div className="insight-card">
            <span>{t.avg}</span>

            <strong>
              {Math.round(
                candidates.reduce(
                  (sum, c) => sum + c.averageScore,
                  0
                ) /
                  (candidates.length || 1)
              )}
              %
            </strong>

            <p>{t.avgDesc}</p>
          </div>

          <div className="insight-card warning">
            <span>{t.flagged}</span>

            <strong>
              {summary?.flaggedCases || 0}
            </strong>

            <p>{t.flaggedDesc}</p>
          </div>

          <div className="insight-card">
            <span>{t.matched}</span>

            <strong>
              {filteredCandidates.length}
            </strong>

            <p>{t.matchedDesc}</p>
          </div>
        </section>

        <section className="dashboard-filters">
          <label>
            <span>{t.search}</span>

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder={t.search}
            />
          </label>

          <label>
            <span>{t.district}</span>

            <select
              value={filters.district}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  district: e.target.value,
                })
              }
            >
              <option value="">
                {t.allDistricts}
              </option>

              {summary?.districts?.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t.skill}</span>

            <select
              value={filters.skill}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  skill: e.target.value,
                })
              }
            >
              <option value="">
                {t.allSkills}
              </option>

              {summary?.skills?.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t.language}</span>

            <select
  value={filters.language}
  onChange={(e) =>
    setFilters({
      ...filters,
      language: e.target.value,
    })
  }
>
  <option value="">
    {t.allLanguages}
  </option>

  {summary?.languages?.map((l) => {
    let displayLanguage = l;

    if (
      l === "en" ||
      l === "en-IN" ||
      l === "English"
    ) {
      displayLanguage = "English";
    }

    if (
      l === "hi" ||
      l === "hi-IN" ||
      l === "Hindi"
    ) {
      displayLanguage = "Hindi";
    }

    if (
      l === "kn" ||
      l === "kn-IN" ||
      l === "Kannada"
    ) {
      displayLanguage = "Kannada";
    }

    return (
      <option key={l} value={l}>
        {displayLanguage}
      </option>
    );
  })}
</select>
          </label>

          <label>
            <span>{t.category}</span>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category: e.target.value,
                })
              }
            >
              <option value="">
                {t.allCategories}
              </option>

              {summary?.categories?.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <div className="dashboard-loading">
            {t.loading}
          </div>
        ) : (
          <section className="candidate-list">
            {paginatedCandidates.length === 0 ? (
              <div className="dashboard-empty">
                {t.noRecords}
              </div>
            ) : (
              paginatedCandidates.map((candidate) => {
                const name =
                  candidate.candidate?.name ||
                  candidate.name;

                const district =
                  candidate.candidate?.district ||
                  candidate.district;

                const skill =
                  candidate.candidate?.skill ||
                  candidate.skill;

                const language =
                  candidate.candidate?.language ||
                  candidate.language;

                return (
                  <article
                    key={candidate.id}
                    className="candidate-card"
                  >
                    <div className="candidate-topline">
                      <div>
                        <h2>{name}</h2>

                        <p>
                          {district} · {skill} ·{" "}
                          {language}
                        </p>
                      </div>

                      <div className="candidate-badges">
                        <span className="badge category">
                          {candidate.category}
                        </span>

                        <span className="badge confidence">
                          {
                            candidate.confidenceBand
                          }{" "}
                          {t.confidence}
                        </span>
                      </div>
                    </div>

                    <div className="candidate-metrics">
                      <div>
                        <span>
                          {t.interviewScore}
                        </span>

                        <strong>
                          {candidate.averageScore}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          {t.confidenceScore}
                        </span>

                        <strong>
                          {
                            candidate.confidenceScore
                          }
                          %
                        </strong>
                      </div>
                    </div>

                    <div className="candidate-footer">
                      <div>
                        <span className="footer-label">
                          {t.currentDecision}
                        </span>

                        <strong>
                          {candidate.decision}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {totalPages > 1 && (
          <div className="pagination-row">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
            >
              {t.previous}
            </button>

            <span>
              {t.page} {page} {t.of}{" "}
              {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) => p + 1)
              }
            >
              {t.next}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;