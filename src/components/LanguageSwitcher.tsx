"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, type Lang } from "@/context/LanguageContext";

interface LangOption {
  code: Lang;
  flag: string;
  label: string;
  nativeLabel: string;
}

const LANG_OPTIONS: LangOption[] = [
  { code: "en", flag: "🇬🇧", label: "English",  nativeLabel: "English"  },
  { code: "uz", flag: "🇺🇿", label: "Uzbek",    nativeLabel: "O'zbek"   },
  { code: "ru", flag: "🇷🇺", label: "Russian",  nativeLabel: "Русский"  },
  { code: "ko", flag: "🇰🇷", label: "Korean",   nativeLabel: "한국어"   },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANG_OPTIONS.find((o) => o.code === lang) ?? LANG_OPTIONS[0];

  // Close on outside click or Escape key
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleOutsideClick, handleKeyDown]);

  function handleSelect(code: Lang) {
    setLang(code);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={[
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
          "border-2 transition-all duration-150 select-none",
          open
            ? "bg-indigo-50 border-indigo-400 text-indigo-700"
            : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700",
        ].join(" ")}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
        {/* Chevron */}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className={[
            "absolute right-0 mt-2 w-44 rounded-xl",
            "bg-white border border-slate-100 shadow-lg shadow-slate-200/60",
            "overflow-hidden z-50",
            "animate-fade-in",
          ].join(" ")}
        >
          <div className="py-1">
            {LANG_OPTIONS.map((option) => {
              const isSelected = option.code === lang;
              return (
                <button
                  key={option.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.code)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100",
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {option.flag}
                  </span>
                  <span className="flex-1 text-left">{option.nativeLabel}</span>
                  {isSelected && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-indigo-600 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
