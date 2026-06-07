"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ── Sentence patterns for absolute beginners ─────────────────────────────────
const SENTENCE_PATTERNS = {
  en: {
    title: "Basic Sentence Patterns",
    subtitle: "Learn to build simple English sentences step by step",
    patterns: [
      {
        name: "Introducing Yourself",
        structure: "I am + [name/adjective]",
        examples: [
          { en: "I am a student.", uz: "Men talabaman." },
          { en: "I am from Uzbekistan.", uz: "Men O'zbekistondanman." },
          { en: "I am happy.", uz: "Men xursandman." },
          { en: "My name is Ali.", uz: "Mening ismim Ali." },
        ],
      },
      {
        name: "Talking About Likes",
        structure: "I like + [noun/verb+ing]",
        examples: [
          { en: "I like tea.", uz: "Men choyni yaxshi ko'raman." },
          { en: "I like reading books.", uz: "Men kitob o'qishni yaxshi ko'raman." },
          { en: "I like football.", uz: "Men futbolni yaxshi ko'raman." },
          { en: "I don't like cold weather.", uz: "Men sovuq ob-havoni yoqtirmayman." },
        ],
      },
      {
        name: "Daily Routines",
        structure: "I + [verb] + every day/morning/evening",
        examples: [
          { en: "I wake up at 7 o'clock.", uz: "Men soat 7 da uyg'onaman." },
          { en: "I go to school every day.", uz: "Men har kuni maktabga boraman." },
          { en: "I eat breakfast in the morning.", uz: "Men ertalab nonushta qilaman." },
          { en: "I sleep at 10 PM.", uz: "Men kechqurun soat 10 da uxlayman." },
        ],
      },
      {
        name: "Asking Questions",
        structure: "What/Where/How + is/are/do + ...?",
        examples: [
          { en: "What is your name?", uz: "Ismingiz nima?" },
          { en: "Where are you from?", uz: "Siz qayerdansiz?" },
          { en: "How are you?", uz: "Qalaysiz?" },
          { en: "Do you like English?", uz: "Ingliz tilini yaxshi ko'rasizmi?" },
        ],
      },
      {
        name: "Describing Things",
        structure: "It is + [adjective] / There is + [noun]",
        examples: [
          { en: "It is a big house.", uz: "Bu katta uy." },
          { en: "It is very cold today.", uz: "Bugun juda sovuq." },
          { en: "There is a book on the table.", uz: "Stolda kitob bor." },
          { en: "There are many students in class.", uz: "Sinfda ko'p o'quvchilar bor." },
        ],
      },
      {
        name: "Saying What You Want",
        structure: "I want to + [verb] / I need + [noun]",
        examples: [
          { en: "I want to learn English.", uz: "Men ingliz tilini o'rganmoqchiman." },
          { en: "I want to go home.", uz: "Men uyga bormoqchiman." },
          { en: "I need water.", uz: "Menga suv kerak." },
          { en: "I need help.", uz: "Menga yordam kerak." },
        ],
      },
      {
        name: "Talking About Ability",
        structure: "I can + [verb] / I can't + [verb]",
        examples: [
          { en: "I can speak a little English.", uz: "Men ozgina inglizcha gapira olaman." },
          { en: "I can swim.", uz: "Men suzishni bilaman." },
          { en: "I can't drive.", uz: "Men haydashni bilmayman." },
          { en: "Can you help me?", uz: "Menga yordam bera olasizmi?" },
        ],
      },
      {
        name: "Past Simple",
        structure: "I + [past verb] + yesterday/last week",
        examples: [
          { en: "I went to the market yesterday.", uz: "Men kecha bozorga bordim." },
          { en: "I ate rice for lunch.", uz: "Men tushlikda guruch yedim." },
          { en: "I watched a movie last night.", uz: "Men kecha kino ko'rdim." },
          { en: "I studied English last week.", uz: "Men o'tgan hafta ingliz tili o'rgandim." },
        ],
      },
    ],
  },
  uz: {
    title: "Oddiy gap tuzilmalari",
    subtitle: "Bosqichma-bosqich oddiy inglizcha gaplar tuzishni o'rganing",
  },
  ru: {
    title: "Базовые структуры предложений",
    subtitle: "Научитесь строить простые английские предложения шаг за шагом",
  },
  ko: {
    title: "기본 문장 패턴",
    subtitle: "단계별로 간단한 영어 문장 만들기를 배우세요",
  },
};

// ── Common everyday phrases ──────────────────────────────────────────────────
const EVERYDAY_PHRASES = [
  { en: "Hello! How are you?", uz: "Salom! Qalaysiz?" },
  { en: "I'm fine, thank you.", uz: "Yaxshiman, rahmat." },
  { en: "Good morning!", uz: "Xayrli tong!" },
  { en: "Good evening!", uz: "Xayrli kech!" },
  { en: "Goodbye! See you later.", uz: "Xayr! Keyinroq ko'rishguncha." },
  { en: "Please.", uz: "Iltimos." },
  { en: "Thank you very much.", uz: "Katta rahmat." },
  { en: "You're welcome.", uz: "Arzimaydi." },
  { en: "Excuse me.", uz: "Kechirasiz." },
  { en: "I'm sorry.", uz: "Uzr so'rayman." },
  { en: "Yes / No", uz: "Ha / Yo'q" },
  { en: "I don't understand.", uz: "Men tushunmadim." },
  { en: "Can you repeat, please?", uz: "Iltimos, qayta aytasizmi?" },
  { en: "How much is this?", uz: "Bu qancha turadi?" },
  { en: "Where is the toilet?", uz: "Hojatxona qayerda?" },
  { en: "I am lost.", uz: "Men yo'limni yo'qotdim." },
  { en: "Can you help me?", uz: "Menga yordam bera olasizmi?" },
  { en: "I don't speak English well.", uz: "Men inglizchani yaxshi gapirmayman." },
  { en: "What time is it?", uz: "Soat nechchi?" },
  { en: "I am a beginner.", uz: "Men boshlovchiman." },
];

export default function BeginnerSentenceGuide() {
  const { lang } = useLanguage();
  const [openPattern, setOpenPattern] = useState<number | null>(0);
  const [showPhrases, setShowPhrases] = useState(false);

  const titleData = SENTENCE_PATTERNS[lang as keyof typeof SENTENCE_PATTERNS] || SENTENCE_PATTERNS.en;
  const title = "title" in titleData ? titleData.title : SENTENCE_PATTERNS.en.title;
  const subtitle = "subtitle" in titleData ? titleData.subtitle : SENTENCE_PATTERNS.en.subtitle;
  const patterns = SENTENCE_PATTERNS.en.patterns; // patterns always use en data with uz translations

  const phrasesTitle = lang === "uz" ? "Kundalik iboralar" : lang === "ru" ? "Повседневные фразы" : lang === "ko" ? "일상 표현" : "Everyday Phrases";
  const practiceNote = lang === "uz"
    ? "Har bir gapni ovoz chiqarib o'qing va eslab qoling!"
    : lang === "ru"
    ? "Читайте каждое предложение вслух и запоминайте!"
    : lang === "ko"
    ? "각 문장을 소리 내어 읽고 외우세요!"
    : "Read each sentence aloud and memorize it!";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-static bg-gradient-to-r from-emerald-50 to-indigo-50 border-2 border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" aria-hidden="true">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{practiceNote}</p>
          </div>
        </div>
      </div>

      {/* Sentence Patterns — Accordion */}
      <div className="space-y-2">
        {patterns.map((pattern, idx) => {
          const isOpen = openPattern === idx;
          return (
            <div key={idx} className="card-static border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left active:scale-[0.99] transition-all"
                onClick={() => setOpenPattern(isOpen ? null : idx)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{pattern.name}</p>
                    <p className="text-xs text-indigo-500 font-mono mt-0.5">{pattern.structure}</p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="space-y-2">
                    {pattern.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-slate-50 rounded-xl"
                      >
                        <p className="text-sm font-semibold text-slate-800 flex-1">
                          {ex.en}
                        </p>
                        <p className="text-sm text-indigo-600 flex-1">
                          <span className="text-xs text-indigo-400 mr-1">UZ:</span>
                          {ex.uz}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Everyday Phrases Toggle */}
      <div className="card-static border border-slate-200">
        <button
          className="w-full flex items-center justify-between p-4 text-left active:scale-[0.99] transition-all"
          onClick={() => setShowPhrases(!showPhrases)}
          aria-expanded={showPhrases}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800 text-sm">{phrasesTitle}</p>
            <span className="badge bg-amber-100 text-amber-700 text-xs">{EVERYDAY_PHRASES.length}</span>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={`w-5 h-5 text-slate-400 transition-transform ${showPhrases ? "rotate-180" : ""}`}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPhrases && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="grid gap-2">
              {EVERYDAY_PHRASES.map((phrase, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100"
                >
                  <p className="text-sm font-semibold text-slate-800 flex-1">{phrase.en}</p>
                  <p className="text-sm text-amber-700 flex-1">
                    <span className="text-xs text-amber-500 mr-1">UZ:</span>
                    {phrase.uz}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
