import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const where = filter === "checked"
    ? { checked: true }
    : filter === "unchecked"
      ? { checked: false }
      : {};

  const answers = await prisma.studentAnswer.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      question: { include: { topic: true, level: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const uncheckedCount = await prisma.studentAnswer.count({
    where: { checked: false },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Answers
          </h1>
          <p className="text-gray-500 mt-1">
            {uncheckedCount} answers waiting for review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "All", value: "" },
          { label: "Unchecked", value: "unchecked" },
          { label: "Checked", value: "checked" },
        ].map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/answers?filter=${f.value}` : "/admin/answers"}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (filter || "") === f.value
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        {answers.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            No answers found.
          </div>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className={`card p-5 ${!answer.checked ? "border-l-4 border-yellow-400" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {answer.user.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {answer.user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-gray-100 text-gray-600">
                      {answer.question.topic.name}
                    </span>
                    <span className="badge bg-gray-100 text-gray-600">
                      {answer.question.level.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(answer.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {answer.checked ? (
                    <span className="badge bg-green-100 text-green-700">
                      Score: {answer.score}/10
                    </span>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  )}
                  <Link
                    href={`/admin/answers/${answer.id}`}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {answer.checked ? "View" : "Review"}
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Question:
                </p>
                <p className="text-sm text-gray-700">
                  {answer.question.questionText}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                <strong>Answer:</strong>{" "}
                {answer.answerText.substring(0, 200)}
                {answer.answerText.length > 200 && "..."}
              </p>

              {answer.feedback && (
                <div className="mt-2 bg-primary-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary-600 mb-1">
                    Your Feedback:
                  </p>
                  <p className="text-sm text-primary-800">{answer.feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
