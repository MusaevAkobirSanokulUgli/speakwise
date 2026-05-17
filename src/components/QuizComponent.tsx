"use client";

import { useState, useCallback } from "react";

type QuizType = "multiple_choice" | "gap_fill" | "sentence_build";

interface Quiz {
  id: string | number;
  type: QuizType;
  question: string;
  options?: string | string[]; // JSON string or array
  correctAnswer: string;
  explanation?: string;
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
  const options = parseOptions(quiz.options);
  const submitted = answer.submitted;

  return (
    <div className="animate-fade-in">
      {/* Question */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-indigo-100 text-indigo-700 text-xs">
            {quiz.type === "multiple_choice"
              ? "Multiple Choice"
              : quiz.type === "gap_fill"
              ? "Fill the Gap"
              : "Build a Sentence"}
          </span>
        </div>

        {quiz.type === "gap_fill" ? (
          <GapFillDisplay question={quiz.question} />
        ) : (
          <p className="text-slate-700 text-base leading-relaxed">{quiz.question}</p>
        )}
      </div>

      {/* Input area */}
      {quiz.type === "multiple_choice" && options.length > 0 ? (
        <div className="space-y-2 mb-4">
          {options.map((opt, i) => {
            const isSelected = answer.value === opt;
            const isCorrectOpt = normalizeAnswer(opt) === normalizeAnswer(quiz.correctAnswer);
            let optClass =
              "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ";
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
                ? "Type the missing word..."
                : "Type your sentence here..."
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
          className="btn-primary w-full sm:w-auto"
          onClick={onSubmit}
          disabled={!answer.value.trim()}
        >
          Submit Answer
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
              {answer.isCorrect ? "Correct!" : "Not quite right."}
            </p>
          </div>
          {!answer.isCorrect && (
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-medium">Correct answer:</span>{" "}
              <span className="font-semibold text-emerald-700">{quiz.correctAnswer}</span>
            </p>
          )}
          {quiz.explanation && (
            <p className="text-sm text-slate-500 italic">{quiz.explanation}</p>
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
        {passed ? "Great job!" : "Keep practicing!"}
      </h3>
      <p className="text-slate-500 mb-2">
        You scored <strong className="text-slate-700">{score}</strong> out of{" "}
        <strong className="text-slate-700">{total}</strong>
      </p>

      {/* Score bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="progress-bar mt-3">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary" onClick={onRetry}>
          Try Again
        </button>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuizComponent({ quizzes }: QuizComponentProps) {
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
            Question {current + 1} of {totalQuestions}
          </span>
          <span className="badge bg-indigo-100 text-indigo-700 text-xs">
            Score: {score}/{answeredCount > 0 ? answeredCount : "—"}
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
            className="btn-primary"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : current < totalQuestions - 1
              ? "Next Question →"
              : "Finish Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
