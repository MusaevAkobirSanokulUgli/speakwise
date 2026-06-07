"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ReadingQuestion {
  id: string;
  type: string;
  question: string;
  questionUz: string;
  questionRu: string;
  questionKo: string;
  options: string | null;
  correctAnswer: string;
  explanation: string | null;
  order: number;
}

interface Props {
  passageId: string;
  passageTitle: string;
  passageTitleUz: string;
  passageTitleRu: string;
  passageTitleKo: string;
  passageText: string;
  wordCount: number;
  questions: ReadingQuestion[];
}

function pick(en: string, uz: string, ru: string, ko: string, lang: string): string {
  const map: Record<string, string> = { en, uz, ru, ko };
  const val = map[lang];
  return val && val.trim() !== "" ? val : en;
}

export default function ReadingClient({
  passageTitle,
  passageTitleUz,
  passageTitleRu,
  passageTitleKo,
  passageText,
  wordCount,
  questions,
}: Props) {
  const { lang } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);
  const [activeTab, setActiveTab] = useState<"passage" | "questions">("passage");

  const localTitle = pick(passageTitle, passageTitleUz, passageTitleRu, passageTitleKo, lang);

  function handleSubmit() {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      if (userAnswer === correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    setActiveTab("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getAnswerStatus(q: ReadingQuestion) {
    if (!submitted) return null;
    const userAnswer = (answers[q.id] || "").trim().toLowerCase();
    const correctAnswer = q.correctAnswer.trim().toLowerCase();
    return userAnswer === correctAnswer ? "correct" : "incorrect";
  }

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Score Banner */}
      {submitted && (
        <div
          className={`card p-6 mb-6 border-2 text-center animate-fade-in ${
            percentage >= 80
              ? "border-green-300 bg-green-50"
              : percentage >= 60
              ? "border-amber-300 bg-amber-50"
              : "border-red-300 bg-red-50"
          }`}
        >
          <div className="text-5xl mb-2">
            {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📖"}
          </div>
          <h2
            className={`text-2xl font-bold mb-1 ${
              percentage >= 80
                ? "text-green-700"
                : percentage >= 60
                ? "text-amber-700"
                : "text-red-700"
            }`}
          >
            {score} / {questions.length} correct — {percentage}%
          </h2>
          <p className="text-sm text-gray-600">
            {percentage >= 80
              ? "Excellent reading comprehension!"
              : percentage >= 60
              ? "Good effort! Review the explanations below."
              : "Keep practicing — re-read the passage and try again."}
          </p>
          <div className="progress-bar mt-4 max-w-xs mx-auto">
            <div
              className="progress-bar-fill"
              style={{
                width: `${percentage}%`,
                background:
                  percentage >= 80
                    ? "#16a34a"
                    : percentage >= 60
                    ? "#d97706"
                    : "#dc2626",
              }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("passage")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "passage"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Reading Passage
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "questions"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* Passage Tab */}
      {activeTab === "passage" && (
        <div className="card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{localTitle}</h2>
            <span className="badge text-xs">{wordCount} words</span>
          </div>
          <div className="prose prose-gray max-w-none">
            {passageText.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-gray-700 leading-relaxed text-base mb-4 last:mb-0"
                style={{ textIndent: "1.5em", fontFamily: "Georgia, serif" }}
              >
                {paragraph.trim()}
              </p>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setActiveTab("questions")}
              className="btn-primary"
            >
              Proceed to Questions &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-5 animate-fade-in">
          {questions.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              No questions available for this passage yet.
            </div>
          ) : (
            <>
              {questions.map((q, idx) => {
                const status = getAnswerStatus(q);
                const localQuestion = pick(q.question, q.questionUz, q.questionRu, q.questionKo, lang);
                const options: string[] = q.options
                  ? (JSON.parse(q.options) as string[])
                  : [];

                return (
                  <div
                    key={q.id}
                    className={`card p-6 border-2 transition-all ${
                      status === "correct"
                        ? "border-green-200 bg-green-50/30"
                        : status === "incorrect"
                        ? "border-red-200 bg-red-50/30"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          status === "correct"
                            ? "bg-green-100 text-green-700"
                            : status === "incorrect"
                            ? "bg-red-100 text-red-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {status === "correct"
                          ? "✓"
                          : status === "incorrect"
                          ? "✗"
                          : idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {localQuestion}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">
                          {q.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Multiple Choice */}
                    {q.type === "multiple_choice" && options.length > 0 && (
                      <div className="space-y-2 ml-11">
                        {options.map((opt) => {
                          const isSelected = answers[q.id] === opt;
                          const isCorrectOpt =
                            submitted &&
                            opt.toLowerCase() ===
                              q.correctAnswer.toLowerCase();
                          const isWrongSelected =
                            submitted && isSelected && !isCorrectOpt;
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                                submitted
                                  ? isCorrectOpt
                                    ? "bg-green-50 border-green-300"
                                    : isWrongSelected
                                    ? "bg-red-50 border-red-300"
                                    : "bg-gray-50 border-gray-200 opacity-60"
                                  : isSelected
                                  ? "bg-indigo-50 border-indigo-300"
                                  : "bg-gray-50 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/40"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={isSelected}
                                disabled={submitted}
                                onChange={() =>
                                  setAnswers((p) => ({ ...p, [q.id]: opt }))
                                }
                                className="accent-indigo-600"
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                              {submitted && isCorrectOpt && (
                                <span className="ml-auto text-green-600 text-xs font-semibold">
                                  Correct
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False */}
                    {q.type === "true_false" && (
                      <div className="flex gap-3 ml-11">
                        {["True", "False"].map((opt) => {
                          const isSelected = answers[q.id] === opt;
                          const isCorrectOpt =
                            submitted &&
                            opt.toLowerCase() ===
                              q.correctAnswer.toLowerCase();
                          const isWrongSelected =
                            submitted && isSelected && !isCorrectOpt;
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer border font-medium text-sm transition-all ${
                                submitted
                                  ? isCorrectOpt
                                    ? "bg-green-50 border-green-300 text-green-700"
                                    : isWrongSelected
                                    ? "bg-red-50 border-red-300 text-red-700"
                                    : "bg-gray-50 border-gray-200 opacity-60"
                                  : isSelected
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={isSelected}
                                disabled={submitted}
                                onChange={() =>
                                  setAnswers((p) => ({ ...p, [q.id]: opt }))
                                }
                                className="accent-indigo-600"
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill in the blank */}
                    {(q.type === "fill_blank" || q.type === "short_answer") && (
                      <div className="ml-11">
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={answers[q.id] || ""}
                          disabled={submitted}
                          onChange={(e) =>
                            setAnswers((p) => ({
                              ...p,
                              [q.id]: e.target.value,
                            }))
                          }
                          className={`input w-full max-w-sm ${
                            submitted
                              ? status === "correct"
                                ? "border-green-400 bg-green-50 text-green-800"
                                : "border-red-400 bg-red-50 text-red-800"
                              : ""
                          }`}
                        />
                        {submitted && status === "incorrect" && (
                          <p className="text-sm text-green-700 mt-1.5 font-medium">
                            Correct answer: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {submitted && q.explanation && showExplanations && (
                      <div className="mt-4 ml-11 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit / Results */}
              {!submitted ? (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setActiveTab("passage")}
                    className="btn-secondary"
                  >
                    &larr; Re-read Passage
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length === 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    Submit Answers
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() =>
                      setShowExplanations((v) => !v)
                    }
                    className="btn-secondary"
                  >
                    {showExplanations ? "Hide" : "Show"} Explanations
                  </button>
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                      setShowExplanations(false);
                      setActiveTab("passage");
                    }}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
