import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "en" | "hi" | "kn";

type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem("app-language") as AppLanguage) || "kn";
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};