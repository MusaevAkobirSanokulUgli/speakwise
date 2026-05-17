"use client";

import { useState } from "react";

interface Question {
  id: string;
  questionText: string;
  templateAnswer: string | null;
  linkingWords: string | null;
  answerStructure: string | null;
  tips: string | null;
}

export default function SpeakingQuestionsClient({
  questions,
  isLoggedIn,
}: {
  questions: Question[];
  isLoggedIn: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showTemplate, setShowTemplate] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function submitAnswer(questionId: string) {
    if (!isLoggedIn) {
      alert("Please login to submit answers");
      return;
    }
    const text = answers[questionId];
    if (!text?.trim()) return;

    setSubmitting(questionId);
    try {
      const res = await fetch("/api/answers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answerText: text }),
      });
      if (res.ok) {
        setSubmitted((p) => ({ ...p, [questionId]: true }));
      }
    } catch {
      alert("Failed to submit");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => {
        const linkingWords = q.linkingWords
          ? (JSON.parse(q.linkingWords) as string[])
          : [];

        return (
          <div key={q.id} className="card p-6 animate-fade-in">
            {/* Question header */}
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {q.questionText}
                </h3>
              </div>
            </div>

            {/* Tips */}
            {q.tips && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
                <strong>Tip:</strong> {q.tips}
              </div>
            )}

            {/* Answer Structure */}
            {q.answerStructure && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                <strong>How to answer:</strong> {q.answerStructure}
              </div>
            )}

            {/* Linking Words */}
            {linkingWords.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Useful linking words:
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkingWords.map((w) => (
                    <span
                      key={w}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Answer:
              </label>
              {submitted[q.id] ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <p className="font-semibold mb-1">Answer submitted!</p>
                  <p className="text-sm">
                    Your teacher will review and provide feedback.
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    className="input min-h-[120px] resize-y"
                    placeholder="Write your answer here... Try to use the linking words and follow the answer structure above."
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => submitAnswer(q.id)}
                      disabled={
                        !answers[q.id]?.trim() || submitting === q.id
                      }
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {submitting === q.id ? "Submitting..." : "Submit Answer"}
                    </button>
                    {q.templateAnswer && (
                      <button
                        onClick={() =>
                          setShowTemplate((p) => ({
                            ...p,
                            [q.id]: !p[q.id],
                          }))
                        }
                        className="btn-secondary text-sm"
                      >
                        {showTemplate[q.id]
                          ? "Hide Sample Answer"
                          : "Show Sample Answer"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Template Answer */}
            {showTemplate[q.id] && q.templateAnswer && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Sample Answer:
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {q.templateAnswer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
