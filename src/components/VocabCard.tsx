"use client";

import { useState } from "react";
import Image from "next/image";

interface VocabCardProps {
  word: string;
  definition: string;
  exampleSentence: string;
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
};

function getPartColors(pos?: string) {
  if (!pos) return { bg: "#F1F5F9", text: "#64748B" };
  return PART_OF_SPEECH_COLORS[pos.toLowerCase()] ?? { bg: "#F1F5F9", text: "#64748B" };
}

export default function VocabCard({
  word,
  definition,
  exampleSentence,
  pronunciation,
  imageUrl,
  partOfSpeech,
}: VocabCardProps) {
  const [flipped, setFlipped] = useState(false);
  const colors = getPartColors(partOfSpeech);

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: "1000px", minHeight: "260px" }}
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
          minHeight: "260px",
        }}
      >
        {/* ---- FRONT ---- */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Image area */}
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
            <div className="w-full h-28 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
              <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 text-indigo-200" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" />
                <path d="M8 10a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" fill="white" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col p-4">
            {partOfSpeech && (
              <span
                className="badge self-start mb-2 text-xs"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {partOfSpeech}
              </span>
            )}
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{word}</h3>
            {pronunciation && (
              <p className="text-sm text-slate-400 font-mono mb-2">/{pronunciation}/</p>
            )}
            <div className="mt-auto flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Tap to see definition</span>
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
          {/* Word reminder */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-indigo-200 text-sm font-semibold">{word}</span>
            {partOfSpeech && (
              <span className="badge bg-white/20 text-white text-xs">{partOfSpeech}</span>
            )}
          </div>

          {/* Definition */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              Definition
            </p>
            <p className="text-white text-base font-medium leading-snug mb-4">{definition}</p>

            {/* Example */}
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              Example
            </p>
            <blockquote className="text-indigo-100 text-sm italic leading-relaxed border-l-2 border-indigo-400 pl-3">
              &ldquo;{exampleSentence}&rdquo;
            </blockquote>
          </div>

          {/* Flip back hint */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}
