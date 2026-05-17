"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, t as rawT, type Lang } from "@/lib/i18n";

const SUPPORTED_LANGS: Lang[] = ["en", "uz", "ru", "ko"];
const STORAGE_KEY = "speakwise_lang";
const COOKIE_NAME = "lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (category: string, key: string) => string;
  supportedLangs: Lang[];
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (category, key) => rawT("en", category, key),
  supportedLangs: SUPPORTED_LANGS,
});

function readStoredLang(): Lang {
  // 1. Try cookie first (works in both SSR and CSR contexts)
  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (cookie) {
      const cookieVal = cookie.split("=")[1] as Lang;
      if (SUPPORTED_LANGS.includes(cookieVal)) return cookieVal;
    }
  }

  // 2. Fall back to localStorage
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  }

  return "en";
}

function persistLang(lang: Lang): void {
  // Cookie — 1 year, accessible across pages, SameSite=Lax
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE_NAME}=${lang}; max-age=${maxAge}; path=/; SameSite=Lax`;
  }

  // localStorage for fast reads on next mount
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read persisted language after hydration
  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== lang) {
      setLangState(stored);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    setLangState(newLang);
    persistLang(newLang);
  }, []);

  const translate = useCallback(
    (category: string, key: string): string => rawT(lang, category, key),
    [lang]
  );

  const value: LanguageContextValue = {
    lang,
    setLang,
    t: translate,
    supportedLangs: SUPPORTED_LANGS,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside a <LanguageProvider>");
  }
  return ctx;
}

// Re-export for convenience
export { translations, type Lang };
