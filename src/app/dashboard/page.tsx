import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "admin" || user.role === "teacher") redirect("/admin");

  const [levels, progress, recentAnswers] = await Promise.all([
    prisma.level.findMany({ orderBy: { order: "asc" } }),
    prisma.studentProgress.findMany({
      where: { userId: user.id },
      include: { level: true, topic: true },
      orderBy: { lastAccessed: "desc" },
      take: 5,
    }),
    prisma.studentAnswer.findMany({
      where: { userId: user.id },
      include: { question: { include: { topic: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalVocab = progress.reduce((s, p) => s + p.vocabLearned, 0);
  const totalQuizzes = progress.reduce((s, p) => s + p.quizzesCompleted, 0);
  const totalAnswered = progress.reduce((s, p) => s + p.questionsAnswered, 0);
  const checkedAnswers = recentAnswers.filter((a) => a.checked);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-500 mt-1">
            Continue your English speaking journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Words Learned",
              value: totalVocab,
              icon: "📚",
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Quizzes Done",
              value: totalQuizzes,
              icon: "📝",
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Questions Answered",
              value: totalAnswered,
              icon: "🗣️",
              color: "bg-purple-50 text-purple-700",
            },
            {
              label: "Feedback Received",
              value: checkedAnswers.length,
              icon: "✅",
              color: "bg-amber-50 text-amber-700",
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Levels */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Your Levels</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {levels.map((level) => (
                <Link
                  key={level.id}
                  href={`/levels/${level.slug}`}
                  className="card p-5 flex items-center gap-4 border-l-4"
                  style={{ borderLeftColor: level.color }}
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{level.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {level.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold mt-8 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/levels"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">📖</span>
                <span className="text-sm font-medium">All Levels</span>
              </Link>
              <Link
                href="/leaderboard"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">🏆</span>
                <span className="text-sm font-medium">Leaderboard</span>
              </Link>
              <Link
                href="/badges"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">🎖️</span>
                <span className="text-sm font-medium">Badges</span>
              </Link>
              <Link
                href="/competitions"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">⚔️</span>
                <span className="text-sm font-medium">Competitions</span>
              </Link>
              <Link
                href="/materials"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">📋</span>
                <span className="text-sm font-medium">Materials</span>
              </Link>
              <Link
                href="/progress"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">📊</span>
                <span className="text-sm font-medium">Progress</span>
              </Link>
              <Link
                href="/levels/beginner"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">🚀</span>
                <span className="text-sm font-medium">Start Learning</span>
              </Link>
              <Link
                href="/materials"
                className="card p-4 text-center hover:bg-primary-50"
              >
                <span className="text-2xl block mb-1">📚</span>
                <span className="text-sm font-medium">Resources</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="card p-5 space-y-4">
              {progress.length === 0 && recentAnswers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No activity yet. Start learning to see your progress here!
                </p>
              ) : (
                <>
                  {recentAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          answer.checked
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {answer.checked ? "Checked" : "Pending"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {answer.question.topic.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {answer.answerText.substring(0, 60)}...
                        </p>
                        {answer.feedback && (
                          <p className="text-xs text-primary-600 mt-1">
                            Feedback: {answer.feedback.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
