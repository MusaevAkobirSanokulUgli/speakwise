"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface AnswerDetail {
  id: string;
  answerText: string;
  checked: boolean;
  feedback: string | null;
  score: number | null;
  createdAt: string;
  user: { name: string; email: string };
  question: {
    questionText: string;
    templateAnswer: string | null;
    answerStructure: string | null;
    tips: string | null;
    topic: { name: string };
    level: { name: string };
  };
}

export default function ReviewAnswerPage() {
  const params = useParams();
  const router = useRouter();
  const [answer, setAnswer] = useState<AnswerDetail | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/answers/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setAnswer(data);
        if (data.feedback) setFeedback(data.feedback);
        if (data.score) setScore(data.score);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function submitFeedback() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/answers/${params.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, score }),
      });
      if (res.ok) {
        router.push("/admin/answers");
        router.refresh();
      }
    } catch {
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Answer not found.</p>
        <Link href="/admin/answers" className="btn-primary mt-4 inline-block">
          Back to Answers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/answers"
        className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
      >
        &larr; Back to Answers
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Review Student Answer
      </h1>

      {/* Student Info */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{answer.user.name}</p>
            <p className="text-sm text-gray-500">{answer.user.email}</p>
          </div>
          <div className="text-right">
            <span className="badge bg-gray-100 text-gray-600">
              {answer.question.topic.name}
            </span>
            <span className="badge bg-gray-100 text-gray-600 ml-2">
              {answer.question.level.name}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card p-5 mb-4 bg-blue-50 border-2 border-blue-200">
        <p className="text-xs font-semibold text-blue-600 mb-2">Question:</p>
        <p className="text-gray-900 font-medium">
          {answer.question.questionText}
        </p>
        {answer.question.answerStructure && (
          <p className="text-sm text-blue-700 mt-2">
            <strong>Structure:</strong> {answer.question.answerStructure}
          </p>
        )}
      </div>

      {/* Student Answer */}
      <div className="card p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Student&apos;s Answer:
        </p>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {answer.answerText}
        </p>
      </div>

      {/* Template Answer */}
      {answer.question.templateAnswer && (
        <div className="card p-5 mb-6 bg-green-50 border-2 border-green-200">
          <p className="text-xs font-semibold text-green-600 mb-2">
            Sample Answer (for reference):
          </p>
          <p className="text-sm text-green-800 leading-relaxed">
            {answer.question.templateAnswer}
          </p>
        </div>
      )}

      {/* Feedback Form */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">
          {answer.checked ? "Update Feedback" : "Give Feedback"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Score (1-10)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  score === n
                    ? "bg-primary-600 text-white scale-110"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Feedback
          </label>
          <textarea
            className="input min-h-[150px] resize-y"
            placeholder="Write your feedback for the student... Include what they did well and areas for improvement."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button
          onClick={submitFeedback}
          disabled={!feedback.trim() || submitting}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : answer.checked
              ? "Update Feedback"
              : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
