import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export default async function ProgressPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [progress, quizResults, answers] = await Promise.all([
    prisma.studentProgress.findMany({
      where: { userId: user.id },
      include: { level: true, topic: true },
      orderBy: { lastAccessed: "desc" },
    }),
    prisma.quizResult.findMany({
      where: { userId: user.id },
      include: { quiz: { include: { topic: true, level: true } } },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
    prisma.studentAnswer.findMany({
      where: { userId: user.id },
      include: { question: { include: { topic: true, level: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalVocab = progress.reduce((s, p) => s + p.vocabLearned, 0);
  const totalQuizzes = progress.reduce((s, p) => s + p.quizzesCompleted, 0);
  const correctQuizzes = quizResults.filter((r) => r.isCorrect).length;
  const quizAccuracy = quizResults.length > 0
    ? Math.round((correctQuizzes / quizResults.length) * 100)
    : 0;
  const checkedAnswers = answers.filter((a) => a.checked);
  const avgScore = checkedAnswers.length > 0
    ? Math.round(checkedAnswers.reduce((s, a) => s + (a.score || 0), 0) / checkedAnswers.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your <span className="gradient-text">Progress</span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Words Learned", value: totalVocab, icon: "📚" },
            { label: "Quizzes Done", value: totalQuizzes, icon: "📝" },
            { label: "Quiz Accuracy", value: `${quizAccuracy}%`, icon: "🎯" },
            { label: "Answers Submitted", value: answers.length, icon: "🗣️" },
            { label: "Avg Score", value: avgScore ? `${avgScore}/10` : "N/A", icon: "⭐" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Quiz Results */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Quiz Results</h2>
            <div className="card p-5">
              {quizResults.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No quiz results yet. <Link href="/levels" className="text-primary-600">Take a quiz</Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {quizResults.slice(0, 10).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{r.quiz.topic.name}</p>
                        <p className="text-xs text-gray-500">{r.quiz.level.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        r.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {r.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Teacher Feedback */}
          <div>
            <h2 className="text-xl font-bold mb-4">Teacher Feedback</h2>
            <div className="card p-5">
              {answers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No answers submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {answers.slice(0, 10).map((a) => (
                    <div key={a.id} className="py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{a.question.topic.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          a.checked ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {a.checked ? `Score: ${a.score}/10` : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{a.answerText.substring(0, 80)}</p>
                      {a.feedback && (
                        <p className="text-xs text-primary-600 mt-1">{a.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
