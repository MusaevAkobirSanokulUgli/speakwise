import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

// CSS-only bar chart component
function BarChart({
  data,
  label,
  maxValue,
  color = "#6366f1",
}: {
  data: { label: string; value: number }[];
  label: string;
  maxValue: number;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        {label}
      </p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 text-right truncate flex-shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0}%`,
                  background: color,
                  minWidth: item.value > 0 ? "4px" : "0",
                }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 w-10 text-right flex-shrink-0">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [progress, quizResults, speakingAnswers, writingSubmissions, badges] =
    await Promise.all([
      prisma.studentProgress.findMany({
        where: { userId: user.id },
        include: { level: true, topic: true },
        orderBy: { lastAccessed: "desc" },
      }),
      prisma.quizResult.findMany({
        where: { userId: user.id },
        include: { quiz: { include: { topic: true, level: true } } },
        orderBy: { completedAt: "asc" },
      }),
      prisma.studentAnswer.findMany({
        where: { userId: user.id },
        include: { question: { include: { topic: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.writingSubmission.findMany({
        where: { userId: user.id },
        include: { task: { include: { topic: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
    ]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalVocab = progress.reduce((s, p) => s + p.vocabLearned, 0);
  const totalQuizzes = progress.reduce((s, p) => s + p.quizzesCompleted, 0);
  const correctQuizzes = quizResults.filter((r) => r.isCorrect).length;
  const quizAccuracy =
    quizResults.length > 0
      ? Math.round((correctQuizzes / quizResults.length) * 100)
      : 0;

  const checkedAnswers = speakingAnswers.filter((a) => a.checked && a.score !== null);
  const avgSpeakingScore =
    checkedAnswers.length > 0
      ? Math.round(
          checkedAnswers.reduce((s, a) => s + (a.score ?? 0), 0) /
            checkedAnswers.length
        )
      : 0;

  const checkedWriting = writingSubmissions.filter(
    (w) => w.checked && w.score !== null
  );
  const avgWritingScore =
    checkedWriting.length > 0
      ? Math.round(
          checkedWriting.reduce((s, w) => s + (w.score ?? 0), 0) /
            checkedWriting.length
        )
      : 0;

  // ── Quiz accuracy over last 10 quiz sessions ──────────────────────────────
  const last10Quizzes = quizResults.slice(-10);
  const quizAccuracyData = last10Quizzes.map((r, i) => ({
    label: `Q${i + 1}`,
    value: r.isCorrect ? 100 : 0,
  }));

  // ── Vocabulary learned per topic ──────────────────────────────────────────
  const vocabByTopic = progress
    .filter((p) => p.vocabLearned > 0)
    .slice(0, 8)
    .map((p) => ({
      label: p.topic.name.length > 10 ? p.topic.name.slice(0, 10) + "…" : p.topic.name,
      value: p.vocabLearned,
    }));
  const maxVocab = Math.max(...vocabByTopic.map((d) => d.value), 1);

  // ── Speaking scores ────────────────────────────────────────────────────────
  const speakingScoreData = checkedAnswers.slice(0, 8).map((a, i) => ({
    label: `Ans ${i + 1}`,
    value: a.score ?? 0,
  }));

  // ── Reading vs Writing ────────────────────────────────────────────────────
  const avgReading =
    progress.length > 0
      ? Math.round(
          progress.reduce((s, p) => s + p.readingScore, 0) / progress.length
        )
      : 0;
  const avgWriting =
    progress.length > 0
      ? Math.round(
          progress.reduce((s, p) => s + p.writingScore, 0) / progress.length
        )
      : 0;
  const rwData = [
    { label: "Reading", value: avgReading },
    { label: "Writing", value: avgWriting },
    { label: "Quiz %", value: quizAccuracy },
    { label: "Speaking", value: avgSpeakingScore * 10 },
  ];

  // ── Trend ─────────────────────────────────────────────────────────────────
  let trend: "improving" | "declining" | "stable" = "stable";
  if (quizResults.length >= 4) {
    const half = Math.floor(quizResults.length / 2);
    const firstHalf = quizResults.slice(0, half);
    const secondHalf = quizResults.slice(half);
    const firstAcc =
      firstHalf.filter((r) => r.isCorrect).length / firstHalf.length;
    const secondAcc =
      secondHalf.filter((r) => r.isCorrect).length / secondHalf.length;
    if (secondAcc - firstAcc > 0.05) trend = "improving";
    else if (firstAcc - secondAcc > 0.05) trend = "declining";
  }

  const trendConfig = {
    improving: { icon: "📈", label: "Improving", color: "text-green-600", bg: "bg-green-50 border-green-200" },
    declining: { icon: "📉", label: "Needs Attention", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    stable: { icon: "➡️", label: "Stable", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  };
  const trendInfo = trendConfig[trend];

  // ── Strengths & Weaknesses ────────────────────────────────────────────────
  const skills = [
    { name: "Vocabulary", score: Math.min(100, totalVocab / 5), desc: `${totalVocab} words learned` },
    { name: "Quiz Performance", score: quizAccuracy, desc: `${quizAccuracy}% accuracy` },
    { name: "Speaking", score: avgSpeakingScore * 10, desc: `Avg ${avgSpeakingScore}/10` },
    { name: "Writing", score: avgWritingScore * 10, desc: `Avg ${avgWritingScore}/10` },
    { name: "Consistency", score: Math.min(100, progress.length * 10), desc: `${progress.length} topics active` },
  ].sort((a, b) => b.score - a.score);

  const strengths = skills.filter((s) => s.score >= 60);
  const weaknesses = skills.filter((s) => s.score < 60);

  // ── Recent Activity ────────────────────────────────────────────────────────
  type ActivityItem = {
    id: string;
    type: string;
    description: string;
    time: Date;
    icon: string;
  };

  const recentActivity: ActivityItem[] = [
    ...quizResults.slice(-5).map((r) => ({
      id: r.id,
      type: "quiz",
      description: `${r.isCorrect ? "Correct" : "Incorrect"} answer — ${r.quiz.topic.name} (${r.quiz.level.name})`,
      time: new Date(r.completedAt),
      icon: r.isCorrect ? "✅" : "❌",
    })),
    ...speakingAnswers.slice(0, 5).map((a) => ({
      id: a.id,
      type: "speaking",
      description: `Speaking answer submitted — ${a.question.topic.name}`,
      time: new Date(a.createdAt),
      icon: "🗣️",
    })),
    ...writingSubmissions.slice(0, 3).map((w) => ({
      id: w.id,
      type: "writing",
      description: `Writing submitted — ${w.task.topic.name} (${w.wordCount} words)`,
      time: new Date(w.createdAt),
      icon: "✍️",
    })),
    ...badges.slice(0, 3).map((ub) => ({
      id: ub.id,
      type: "badge",
      description: `Badge earned: ${ub.badge.name} ${ub.badge.icon}`,
      time: new Date(ub.earnedAt),
      icon: "🏅",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Your <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-gray-500">
            Deep dive into your learning performance and progress
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-fade-in">
          {[
            { label: "Words Learned", value: totalVocab.toLocaleString(), icon: "📚", color: "text-blue-600" },
            { label: "Quizzes Done", value: totalQuizzes.toLocaleString(), icon: "📝", color: "text-green-600" },
            { label: "Quiz Accuracy", value: `${quizAccuracy}%`, icon: "🎯", color: "text-indigo-600" },
            { label: "Speaking Avg", value: avgSpeakingScore > 0 ? `${avgSpeakingScore}/10` : "N/A", icon: "🗣️", color: "text-purple-600" },
            { label: "Badges Earned", value: badges.length.toString(), icon: "🏅", color: "text-amber-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-4 text-center">
              <span className="text-2xl">{kpi.icon}</span>
              <p className={`text-2xl font-extrabold mt-1 ${kpi.color}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Trend Banner */}
        <div
          className={`card p-4 mb-8 border-2 flex items-center gap-4 animate-fade-in ${trendInfo.bg}`}
        >
          <span className="text-3xl">{trendInfo.icon}</span>
          <div>
            <p className={`font-bold ${trendInfo.color}`}>
              Performance Trend: {trendInfo.label}
            </p>
            <p className="text-sm text-gray-600">
              {trend === "improving"
                ? "Great job! Your recent results are better than your earlier ones."
                : trend === "declining"
                ? "Your recent scores are lower. Consider reviewing vocabulary and practicing more quizzes."
                : "Your performance is consistent. Keep up the steady effort!"}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quiz Accuracy Over Time */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Quiz Accuracy (Last 10)
            </h3>
            {quizAccuracyData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No quiz data yet.{" "}
                <Link href="/levels" className="text-indigo-500">
                  Take a quiz
                </Link>
              </p>
            ) : (
              <BarChart
                data={quizAccuracyData}
                label="Correct (%) per quiz"
                maxValue={100}
                color="#6366f1"
              />
            )}
          </div>

          {/* Vocab Per Topic */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Vocabulary Learned Per Topic
            </h3>
            {vocabByTopic.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No vocabulary tracked yet.
              </p>
            ) : (
              <BarChart
                data={vocabByTopic}
                label="Words learned"
                maxValue={maxVocab}
                color="#3b82f6"
              />
            )}
          </div>

          {/* Speaking Scores */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Speaking Answer Scores
            </h3>
            {speakingScoreData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No graded speaking answers yet.
              </p>
            ) : (
              <BarChart
                data={speakingScoreData}
                label="Score out of 10"
                maxValue={10}
                color="#8b5cf6"
              />
            )}
          </div>

          {/* Reading vs Writing vs Quiz */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Skills Overview
            </h3>
            <BarChart
              data={rwData}
              label="Performance (0–100)"
              maxValue={100}
              color="#10b981"
            />
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">💪</span> Strengths
            </h3>
            {strengths.length === 0 ? (
              <p className="text-sm text-gray-400">
                Keep practicing to build your strengths!
              </p>
            ) : (
              <div className="space-y-3">
                {strengths.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {Math.round(s.score)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-400">🎯</span> Areas to Improve
            </h3>
            {weaknesses.length === 0 ? (
              <p className="text-sm text-gray-400">
                Excellent! No major weaknesses detected.
              </p>
            ) : (
              <div className="space-y-3">
                {weaknesses.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">
                      {Math.round(s.score)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card p-6 animate-fade-in">
          <h3 className="text-base font-bold text-gray-900 mb-5">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">
                No activity yet. Start learning!
              </p>
              <Link href="/levels" className="btn-primary text-sm">
                Go to Levels
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-lg flex-shrink-0 z-10">
                      {item.icon}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-sm text-gray-800">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.time.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
