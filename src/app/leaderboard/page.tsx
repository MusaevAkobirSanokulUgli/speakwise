import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "monthly" ? "monthly" : "alltime";
  const user = await getSession();

  // Fetch users with quiz results, badges, and progress
  const users = await prisma.user.findMany({
    where: { role: "student" },
    include: {
      quizResults: true,
      userBadges: true,
      progress: true,
    },
    orderBy: { points: "desc" },
    take: 50,
  });

  // For monthly: filter quiz results to current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  interface UserRow {
    id: string;
    name: string;
    points: number;
    badgeCount: number;
    quizTotal: number;
    quizCorrect: number;
    accuracy: number;
  }

  const rows: UserRow[] = users
    .map((u) => {
      const results =
        activeTab === "monthly"
          ? u.quizResults.filter((r) => new Date(r.completedAt) >= monthStart)
          : u.quizResults;
      const quizTotal = results.length;
      const quizCorrect = results.filter((r) => r.isCorrect).length;
      const accuracy =
        quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;
      const pts =
        activeTab === "monthly"
          ? quizCorrect * 10
          : u.points;
      return {
        id: u.id,
        name: u.name,
        points: pts,
        badgeCount: u.userBadges.length,
        quizTotal,
        quizCorrect,
        accuracy,
      };
    })
    .sort((a, b) => b.points - a.points);

  const medalColors = ["#f59e0b", "#94a3b8", "#b45309"];
  const medalLabels = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-gray-500">
            See how you rank among all SpeakWise learners
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
          <Link
            href="/leaderboard?tab=alltime"
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "alltime"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Time
          </Link>
          <Link
            href="/leaderboard?tab=monthly"
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "monthly"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            This Month
          </Link>
        </div>

        {/* Top 3 Podium */}
        {rows.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[rows[1], rows[0], rows[2]].map((row, i) => {
              const actualRank = i === 0 ? 1 : i === 1 ? 0 : 2;
              const rank = actualRank + 1;
              const heights = ["h-28", "h-36", "h-24"];
              return (
                <div
                  key={row.id}
                  className={`card p-4 text-center animate-fade-in flex flex-col items-center justify-end ${
                    rank === 1 ? "ring-2 ring-amber-300" : ""
                  }`}
                  style={{ minHeight: heights[i] === "h-36" ? 200 : i === 0 ? 170 : 155 }}
                >
                  <span className="text-3xl mb-1">{medalLabels[actualRank]}</span>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                    style={{ background: medalColors[actualRank] }}
                  >
                    {row.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-900 text-sm truncate max-w-[100px]">
                    {row.name}
                  </p>
                  <p
                    className="text-lg font-extrabold mt-1"
                    style={{ color: medalColors[actualRank] }}
                  >
                    {row.points.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-gray-400">{row.accuracy}% accuracy</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Table */}
        <div className="card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {activeTab === "monthly" ? "Monthly Rankings" : "All-Time Rankings"}
            </h2>
            {user && (
              <span className="text-xs text-gray-400">
                Your rank highlighted in blue
              </span>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No data yet. Be the first on the leaderboard!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-500 w-16">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-500">
                      Student
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-500">
                      Points
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-500 hidden sm:table-cell">
                      Badges
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-500 hidden md:table-cell">
                      Quiz Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const rank = idx + 1;
                    const isCurrentUser = user?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50 last:border-0 transition-colors ${
                          isCurrentUser
                            ? "bg-indigo-50 hover:bg-indigo-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {rank <= 3 ? (
                              <span className="text-xl">{medalLabels[rank - 1]}</span>
                            ) : (
                              <span
                                className={`font-bold ${
                                  isCurrentUser
                                    ? "text-indigo-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                                isCurrentUser ? "bg-indigo-600" : "bg-gray-400"
                              }`}
                            >
                              {row.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p
                                className={`font-semibold ${
                                  isCurrentUser
                                    ? "text-indigo-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {row.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                {row.quizTotal} quizzes
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900">
                            {row.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                            🏅 {row.badgeCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                            >
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${row.accuracy}%` }}
                              />
                            </div>
                            <span
                              className={`font-semibold text-xs w-10 text-right ${
                                row.accuracy >= 80
                                  ? "text-green-600"
                                  : row.accuracy >= 60
                                  ? "text-amber-600"
                                  : "text-red-500"
                              }`}
                            >
                              {row.accuracy}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!user && (
          <div className="mt-8 card p-6 text-center border-2 border-dashed border-indigo-200">
            <p className="text-gray-600 mb-3">
              Login to see your rank and track your progress!
            </p>
            <Link href="/login" className="btn-primary">
              Login to Compete
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
