"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

type QuizType = "multiple_choice" | "gap_fill" | "sentence_build";

interface Quiz {
  id: string | number;
  type: QuizType;
  question: string;
  questionUz?: string;
  questionRu?: string;
  questionKo?: string;
  options?: string | string[]; // JSON string or array
  correctAnswer: string;
  explanation?: string;
  explanationUz?: string;
  explanationRu?: string;
  explanationKo?: string;
}

function pickLang(en: string, uz?: string, ru?: string, ko?: string, lang?: string): string {
  if (!lang || lang === "en") return en;
  const map: Record<string, string | undefined> = { uz, ru, ko };
  const val = map[lang];
  return val && val.trim() !== "" ? val : en;
}

interface QuizComponentProps {
  quizzes: Quiz[];
}

interface AnswerState {
  value: string;
  submitted: boolean;
  isCorrect: boolean;
}

function parseOptions(raw?: string | string[]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeAnswer(ans: string): string {
  return ans.trim().toLowerCase().replace(/\s+/g, " ");
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

// ── Question with blank rendering ────────────────────────────────────────────
function GapFillDisplay({ question }: { question: string }) {
  const parts = question.split("___");
  return (
    <p className="text-slate-700 text-base leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="inline-block w-24 border-b-2 border-indigo-400 align-bottom mx-1" aria-hidden="true" />
          )}
        </span>
      ))}
    </p>
  );
}

// ── Result icon ───────────────────────────────────────────────────────────────
function ResultIcon({ isCorrect }: { isCorrect: boolean }) {
  return isCorrect ? (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500 flex-shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#D1FAE5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" stroke="#059669" d="M7 13l3 3 7-7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FEE2E2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" stroke="#DC2626" d="M8 8l8 8m0-8l-8 8" />
    </svg>
  );
}

// ── Individual quiz item ──────────────────────────────────────────────────────
function QuizItem({
  quiz,
  index,
  answer,
  onChange,
  onSubmit,
}: {
  quiz: Quiz;
  index: number;
  answer: AnswerState;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { lang, t } = useLanguage();
  const options = parseOptions(quiz.options);
  const submitted = answer.submitted;
  const localQuestion = pickLang(quiz.question, quiz.questionUz, quiz.questionRu, quiz.questionKo, lang);
  const localExplanation = quiz.explanation ? pickLang(quiz.explanation, quiz.explanationUz, quiz.explanationRu, quiz.explanationKo, lang) : undefined;

  return (
    <div className="animate-fade-in">
      {/* Question */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-indigo-100 text-indigo-700 text-xs">
            {quiz.type === "multiple_choice"
              ? t("quiz", "multipleChoice")
              : quiz.type === "gap_fill"
              ? t("quiz", "fillTheGap")
              : t("quiz", "buildSentence")}
          </span>
        </div>

        {quiz.type === "gap_fill" ? (
          <GapFillDisplay question={localQuestion} />
        ) : (
          <p className="text-slate-700 text-base leading-relaxed">{localQuestion}</p>
        )}
      </div>

      {/* Input area */}
      {quiz.type === "multiple_choice" && options.length > 0 ? (
        <div className="space-y-2 mb-4">
          {options.map((opt, i) => {
            const isSelected = answer.value === opt;
            const isCorrectOpt = normalizeAnswer(opt) === normalizeAnswer(quiz.correctAnswer);
            let optClass =
              "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] ";
            if (!submitted) {
              optClass += isSelected
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50";
            } else {
              if (isCorrectOpt) optClass += "border-emerald-400 bg-emerald-50";
              else if (isSelected && !isCorrectOpt) optClass += "border-red-400 bg-red-50";
              else optClass += "border-slate-200 bg-white opacity-60";
            }

            return (
              <label key={i} className={optClass}>
                <input
                  type="radio"
                  name={`quiz-${quiz.id}`}
                  value={opt}
                  checked={isSelected}
                  disabled={submitted}
                  onChange={() => !submitted && onChange(opt)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    submitted && isCorrectOpt
                      ? "text-emerald-700"
                      : submitted && isSelected && !isCorrectOpt
                      ? "text-red-700"
                      : "text-slate-700"
                  }`}
                >
                  {opt}
                </span>
                {submitted && isCorrectOpt && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-500 ml-auto" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" stroke="currentColor" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mb-4">
          <input
            type="text"
            className="input"
            placeholder={
              quiz.type === "gap_fill"
                ? t("quiz", "typeMissing")
                : t("quiz", "typeSentence")
            }
            value={answer.value}
            onChange={(e) => !submitted && onChange(e.target.value)}
            disabled={submitted}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitted && answer.value.trim()) onSubmit();
            }}
          />
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          className="btn-primary w-full sm:w-auto py-3 active:scale-[0.97]"
          onClick={onSubmit}
          disabled={!answer.value.trim()}
        >
          {t("quiz", "submitAnswer")}
        </button>
      )}

      {/* Feedback */}
      {submitted && (
        <div
          className={`mt-4 p-4 rounded-xl border animate-fade-in ${
            answer.isCorrect
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-2 mb-2">
            <ResultIcon isCorrect={answer.isCorrect} />
            <p
              className={`font-semibold text-sm ${
                answer.isCorrect ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {answer.isCorrect ? t("quiz", "correct") : t("quiz", "incorrect")}
            </p>
          </div>
          {!answer.isCorrect && (
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-medium">{t("quiz", "correctAnswer")}:</span>{" "}
              <span className="font-semibold text-emerald-700">{quiz.correctAnswer}</span>
            </p>
          )}
          {localExplanation && (
            <p className="text-sm text-slate-500 italic">{localExplanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({
  score,
  total,
  onRetry,
}: {
  score: number;
  total: number;
  onRetry: () => void;
}) {
  const { t } = useLanguage();
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;

  return (
    <div className="flex flex-col items-center py-8 animate-fade-in text-center">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${
          passed ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        <span className={`text-4xl font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>
          {pct}%
        </span>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-1">
        {passed ? t("quiz", "wellDone") : t("quiz", "keepPracticing")}
      </h3>
      <p className="text-slate-500 mb-2">
        {t("quiz", "yourScore")}: <strong className="text-slate-700">{score}</strong> / <strong className="text-slate-700">{total}</strong>
      </p>

      {/* Score bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="progress-bar mt-3">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary py-3 active:scale-[0.97]" onClick={onRetry}>
          {t("quiz", "tryAgain")}
        </button>
        <a href="/" className="btn-primary py-3 active:scale-[0.97]">
          {t("quiz", "backToHome")}
        </a>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuizComponent({ quizzes }: QuizComponentProps) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const quiz = quizzes[current];
  const totalQuestions = quizzes.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((current + (answers[current]?.submitted ? 1 : 0)) / totalQuestions) * 100);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() && !answers[current]?.value) return;
    const value = quiz.type === "multiple_choice"
      ? (answers[current]?.value ?? inputValue)
      : inputValue;
    if (!value.trim()) return;

    const isCorrect = checkAnswer(value, quiz.correctAnswer);
    setAnswers((prev) => ({
      ...prev,
      [current]: { value, submitted: true, isCorrect },
    }));
  }, [current, quiz, inputValue, answers]);

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (quiz.type === "multiple_choice") {
        setAnswers((prev) => ({
          ...prev,
          [current]: { value, submitted: false, isCorrect: false },
        }));
      }
    },
    [current, quiz.type]
  );

  const handleNext = async () => {
    if (current < totalQuestions - 1) {
      setCurrent((c) => c + 1);
      setInputValue("");
    } else {
      // All done — submit results
      const score = Object.values(answers).filter((a) => a.isCorrect).length;
      setSubmitting(true);
      try {
        await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            results: quizzes.map((q, i) => ({
              quizId: q.id,
              answer: answers[i]?.value ?? "",
              isCorrect: answers[i]?.isCorrect ?? false,
            })),
            score,
            total: totalQuestions,
          }),
        });
      } catch {
        // Non-blocking — still show results
      } finally {
        setSubmitting(false);
        setFinished(true);
      }
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setAnswers({});
    setInputValue("");
    setFinished(false);
  };

  const score = Object.values(answers).filter((a) => a.isCorrect).length;
  const currentAnswer = answers[current];

  if (finished) {
    return (
      <div className="card max-w-2xl mx-auto">
        <ResultsScreen score={score} total={totalQuestions} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-500">
            {t("quiz", "question")} {current + 1} {t("quiz", "of")} {totalQuestions}
          </span>
          <span className="badge bg-indigo-100 text-indigo-700 text-xs">
            {t("quiz", "score")}: {score}/{answeredCount > 0 ? answeredCount : "\u2014"}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Quiz item */}
      <QuizItem
        quiz={quiz}
        index={current}
        answer={currentAnswer ?? { value: inputValue, submitted: false, isCorrect: false }}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Next button */}
      {currentAnswer?.submitted && (
        <div className="mt-5 flex justify-end animate-fade-in">
          <button
            className="btn-primary py-3 active:scale-[0.97]"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? t("quiz", "submitting")
              : current < totalQuestions - 1
              ? t("quiz", "nextQuestion") + " \u2192"
              : t("quiz", "finishQuiz")}
          </button>
        </div>
      )}
    </div>
  );
}
