import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    studentCount,
    answerCount,
    uncheckedCount,
    quizResultCount,
    vocabCount,
    questionCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.studentAnswer.count(),
    prisma.studentAnswer.count({ where: { checked: false } }),
    prisma.quizResult.count(),
    prisma.vocabulary.count(),
    prisma.speakingQuestion.count(),
  ]);

  const recentAnswers = await prisma.studentAnswer.findMany({
    include: {
      user: { select: { name: true, email: true } },
      question: { include: { topic: true, level: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Teacher Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Students", value: studentCount, icon: "👩‍🎓", link: "/admin/students" },
          { label: "Unchecked Answers", value: uncheckedCount, icon: "📋", link: "/admin/answers", urgent: uncheckedCount > 0 },
          { label: "Total Answers", value: answerCount, icon: "🗣️", link: "/admin/answers" },
          { label: "Quiz Attempts", value: quizResultCount, icon: "📝", link: "/admin/quizzes" },
          { label: "Vocabulary Items", value: vocabCount, icon: "📚", link: "/admin/content" },
          { label: "Speaking Questions", value: questionCount, icon: "❓", link: "/admin/content" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className={`card p-5 hover:bg-gray-50 ${stat.urgent ? "border-2 border-red-300 bg-red-50" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Unchecked */}
      <h2 className="text-xl font-bold mb-4">
        Recent Student Answers
        {uncheckedCount > 0 && (
          <span className="ml-2 text-sm font-normal text-red-500">
            ({uncheckedCount} need review)
          </span>
        )}
      </h2>
      <div className="card">
        {recentAnswers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No student answers yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentAnswers.map((answer) => (
              <div
                key={answer.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{answer.user.name}</p>
                    <span className="text-xs text-gray-400">
                      {answer.user.email}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {answer.question.topic.name} ({answer.question.level.name})
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {answer.answerText.substring(0, 100)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`badge ${
                      answer.checked
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {answer.checked ? "Checked" : "Pending"}
                  </span>
                  <Link
                    href={`/admin/answers/${answer.id}`}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/answers" className="card p-4 text-center hover:bg-primary-50">
          <span className="text-2xl block mb-1">📋</span>
          <span className="text-sm font-medium">Review Answers</span>
        </Link>
        <Link href="/admin/students" className="card p-4 text-center hover:bg-primary-50">
          <span className="text-2xl block mb-1">👩‍🎓</span>
          <span className="text-sm font-medium">View Students</span>
        </Link>
        <Link href="/admin/lesson-plans" className="card p-4 text-center hover:bg-primary-50">
          <span className="text-2xl block mb-1">📖</span>
          <span className="text-sm font-medium">Lesson Plans</span>
        </Link>
        <Link href="/admin/quizzes" className="card p-4 text-center hover:bg-primary-50">
          <span className="text-2xl block mb-1">📊</span>
          <span className="text-sm font-medium">Quiz Results</span>
        </Link>
      </div>
    </div>
  );
}
