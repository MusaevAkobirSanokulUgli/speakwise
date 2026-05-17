"use client";

import { useState } from "react";

interface WritingTask {
  id: string;
  title: string;
  instructions: string;
  type: string;
  sampleAnswer: string | null;
  tips: string | null;
  wordCountMin: number;
  wordCountMax: number;
}

interface Props {
  task: WritingTask;
  isLoggedIn: boolean;
}

export default function WritingClient({ task, isLoggedIn }: Props) {
  const [text, setText] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const meetsMin = wordCount >= task.wordCountMin;
  const meetsMax = wordCount <= task.wordCountMax;
  const inRange = meetsMin && meetsMax;

  const wordCountColor =
    wordCount === 0
      ? "text-gray-400"
      : !meetsMin
      ? "text-red-500"
      : !meetsMax
      ? "text-amber-500"
      : "text-green-600";

  async function handleSubmit() {
    if (!isLoggedIn) {
      setError("Please login to submit your writing.");
      return;
    }
    if (!inRange) {
      setError(
        `Your response must be between ${task.wordCountMin} and ${task.wordCountMax} words.`
      );
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/writing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, text }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-10 text-center animate-fade-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Writing Submitted!
        </h2>
        <p className="text-gray-600 mb-1">
          Your response ({wordCount} words) has been submitted for review.
        </p>
        <p className="text-sm text-gray-400">
          Your teacher will review it and provide feedback soon.
        </p>
        <button
          onClick={() => {
            setText("");
            setSubmitted(false);
          }}
          className="btn-secondary mt-6"
        >
          Write Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Task Card */}
      <div className="card p-6 border-l-4 border-indigo-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge text-xs uppercase tracking-wide">
            {task.type.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-400">
            {task.wordCountMin}–{task.wordCountMax} words required
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h2>
        <p className="text-gray-700 leading-relaxed">{task.instructions}</p>
      </div>

      {/* Tips */}
      {task.tips && (
        <div className="card p-4">
          <button
            onClick={() => setShowTips((v) => !v)}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className="text-amber-500 text-lg">💡</span>
            <span className="font-semibold text-gray-800 text-sm">
              Writing Tips
            </span>
            <span className="ml-auto text-gray-400 text-sm">
              {showTips ? "▲ Hide" : "▼ Show"}
            </span>
          </button>
          {showTips && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-amber-800 bg-amber-50 rounded-lg p-4 animate-fade-in">
              {task.tips}
            </div>
          )}
        </div>
      )}

      {/* Writing Area */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Your Response
          </label>
          <span className={`text-sm font-semibold tabular-nums ${wordCountColor}`}>
            {wordCount} / {task.wordCountMax} words
            {wordCount > 0 && !meetsMin && (
              <span className="ml-2 text-xs font-normal text-red-400">
                (need {task.wordCountMin - wordCount} more)
              </span>
            )}
            {meetsMin && !meetsMax && (
              <span className="ml-2 text-xs font-normal text-amber-500">
                (too long by {wordCount - task.wordCountMax})
              </span>
            )}
          </span>
        </div>

        <textarea
          className="input w-full min-h-[280px] resize-y leading-relaxed text-base"
          placeholder={`Write your ${task.type.replace("_", " ")} here. Aim for ${task.wordCountMin}–${task.wordCountMax} words.`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
        />

        {/* Word count bar */}
        <div className="progress-bar mt-3">
          <div
            className="progress-bar-fill transition-all duration-300"
            style={{
              width: `${Math.min(100, (wordCount / task.wordCountMax) * 100)}%`,
              background: inRange
                ? "#16a34a"
                : wordCount > task.wordCountMax
                ? "#d97706"
                : "#6366f1",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span className="text-gray-500 font-medium">
            Min: {task.wordCountMin}
          </span>
          <span>Max: {task.wordCountMax}</span>
        </div>
      </div>

      {/* Sample Answer */}
      {task.sampleAnswer && (
        <div className="card p-4">
          <button
            onClick={() => setShowSample((v) => !v)}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className="text-indigo-500 text-lg">📄</span>
            <span className="font-semibold text-gray-800 text-sm">
              Sample Answer
            </span>
            <span className="ml-auto text-gray-400 text-sm">
              {showSample ? "▲ Hide" : "▼ Show"}
            </span>
          </button>
          {showSample && (
            <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
              <div
                className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {task.sampleAnswer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          {isLoggedIn
            ? "Your response will be reviewed by your teacher."
            : "Login to submit your writing for feedback."}
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting || text.trim().length === 0}
          className="btn-primary disabled:opacity-50 min-w-[140px]"
        >
          {submitting ? "Submitting..." : "Submit Writing"}
        </button>
      </div>
    </div>
  );
}
