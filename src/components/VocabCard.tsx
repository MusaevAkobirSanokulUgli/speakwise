"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { vocabUz } from "@/lib/vocabUzTranslations";

interface VocabCardProps {
  word: string;
  definition: string;
  definitionUz: string;
  definitionRu: string;
  definitionKo: string;
  exampleSentence: string;
  exampleUz: string;
  exampleRu: string;
  exampleKo: string;
  pronunciation?: string;
  imageUrl?: string;
  partOfSpeech?: string;
}

const PART_OF_SPEECH_COLORS: Record<string, { bg: string; text: string }> = {
  noun:        { bg: "#EEF2FF", text: "#4F46E5" },
  verb:        { bg: "#F0FDF4", text: "#059669" },
  adjective:   { bg: "#FFF7ED", text: "#EA580C" },
  adverb:      { bg: "#FDF2F8", text: "#DB2777" },
  preposition: { bg: "#ECFEFF", text: "#0891B2" },
  conjunction: { bg: "#F5F3FF", text: "#7C3AED" },
  pronoun:     { bg: "#FEF2F2", text: "#DC2626" },
  interjection:{ bg: "#FEFCE8", text: "#CA8A04" },
  phrase:      { bg: "#F0FDFA", text: "#0D9488" },
};

function getPartColors(pos?: string) {
  if (!pos) return { bg: "#F1F5F9", text: "#64748B" };
  return PART_OF_SPEECH_COLORS[pos.toLowerCase()] ?? { bg: "#F1F5F9", text: "#64748B" };
}

function pickLang(en: string, uz: string, ru: string, ko: string, lang: string): string {
  const map: Record<string, string> = { en, uz, ru, ko };
  const val = map[lang];
  return val && val.trim() !== "" ? val : en;
}

/** Get Uzbek definition — DB field first, then frontend dictionary, then empty */
function getUzDef(word: string, dbUz: string): string {
  if (dbUz && dbUz.trim() !== "") return dbUz;
  const lookup = vocabUz[word.toLowerCase()];
  return lookup?.def ?? "";
}

export default function VocabCard({
  word,
  definition,
  definitionUz,
  definitionRu,
  definitionKo,
  exampleSentence,
  exampleUz,
  exampleRu,
  exampleKo,
  pronunciation,
  imageUrl,
  partOfSpeech,
}: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);
  const { lang } = useLanguage();
  const colors = getPartColors(partOfSpeech);

  // Resolve Uzbek from DB or frontend dictionary
  const resolvedDefUz = getUzDef(word, definitionUz);
  const resolvedExUz = (exampleUz && exampleUz.trim() !== "")
    ? exampleUz
    : (vocabUz[word.toLowerCase()]?.ex ?? "");

  const localDef = pickLang(definition, resolvedDefUz, definitionRu, definitionKo, lang);
  const localExample = pickLang(exampleSentence, resolvedExUz, exampleRu, exampleKo, lang);

  const defLabel = lang === "uz" ? "Ta'rif" : lang === "ru" ? "Определение" : lang === "ko" ? "정의" : "Definition";
  const exLabel = lang === "uz" ? "Misol" : lang === "ru" ? "Пример" : lang === "ko" ? "예문" : "Example";
  const tapToSee = lang === "uz" ? "Ta'rifni ko'rish uchun bosing" : lang === "ru" ? "Нажмите, чтобы увидеть определение" : lang === "ko" ? "정의를 보려면 탭하세요" : "Tap to see definition";
  const tapBack = lang === "uz" ? "Ortga qaytish uchun bosing" : lang === "ru" ? "Нажмите, чтобы перевернуть" : lang === "ko" ? "뒤로 탭하세요" : "Tap to flip back";

  // Always show Uzbek translation under the word on the front (helps Uzbek-speaking learners)
  const uzTranslation = resolvedDefUz;

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1000px", minHeight: "280px" }}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
      tabIndex={0}
      role="button"
      aria-label={`Vocabulary card for "${word}". Press to flip.`}
      aria-pressed={flipped}
    >
      <div
        style={{
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "280px",
        }}
      >
        {/* ---- FRONT ---- */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {imageUrl ? (
            <div className="relative w-full h-36 bg-slate-100 flex-shrink-0">
              <Image
                src={imageUrl}
                alt={word}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-24 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
              <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-indigo-200" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" />
                <path d="M8 10a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" fill="white" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          )}

          <div className="flex-1 flex flex-col p-4">
            {partOfSpeech && (
              <span
                className="badge self-start mb-1.5 text-xs"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {partOfSpeech}
              </span>
            )}
            <h3 className="text-2xl font-bold text-slate-800 mb-0.5">{word}</h3>
            {pronunciation && (
              <p className="text-sm text-slate-400 font-mono mb-1">/{pronunciation}/</p>
            )}

            {/* Uzbek translation — always shown under the word */}
            {uzTranslation && (
              <p className="text-sm text-indigo-600 font-medium mb-2 leading-snug">
                <span className="text-xs text-indigo-400 mr-1">UZ:</span>
                {uzTranslation}
              </p>
            )}

            <div className="mt-auto flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{tapToSee}</span>
            </div>
          </div>
        </div>

        {/* ---- BACK ---- */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-md overflow-hidden flex flex-col p-5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-indigo-200 text-sm font-semibold">{word}</span>
            {partOfSpeech && (
              <span className="badge bg-white/20 text-white text-xs">{partOfSpeech}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              {defLabel}
            </p>
            <p className="text-white text-base font-medium leading-snug mb-3">{localDef}</p>

            {/* Show Uzbek translation on back too when not already in Uzbek mode */}
            {lang !== "uz" && uzTranslation && (
              <div className="mb-3 bg-white/10 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-0.5">
                  O&apos;zbekcha
                </p>
                <p className="text-indigo-100 text-sm leading-snug">{uzTranslation}</p>
              </div>
            )}

            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              {exLabel}
            </p>
            <blockquote className="text-indigo-100 text-sm italic leading-relaxed border-l-2 border-indigo-400 pl-3">
              &ldquo;{localExample}&rdquo;
            </blockquote>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{tapBack}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
