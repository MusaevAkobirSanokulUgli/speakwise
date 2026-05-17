import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function CompetitionsPage() {
  const user = await getSession();

  const competitions = await prisma.competition.findMany({
    include: {
      entries: {
        include: { user: true },
        orderBy: { score: "desc" },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const now = new Date();
  const active = competitions.filter(
    (c) => c.isActive && new Date(c.endDate) > now
  );
  const past = competitions.filter(
    (c) => !c.isActive || new Date(c.endDate) <= now
  );

  const joinedCompetitions = user
    ? new Set(
        competitions
          .filter((c) => c.entries.some((e) => e.userId === user.id))
          .map((c) => c.id)
      )
    : new Set<string>();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="gradient-text">Competitions</span>
          </h1>
          <p className="text-gray-500">
            Compete with other learners and earn special badges and prizes
          </p>
        </div>

        {/* Active Competitions */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">⚔️</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Active Competitions
            </h2>
            {active.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {active.length} live
              </span>
            )}
          </div>

          {active.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-3">🏁</div>
              <p className="text-gray-500">
                No active competitions right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {active.map((comp) => {
                const hasJoined = joinedCompetitions.has(comp.id);
                const topEntries = comp.entries.slice(0, 3);
                const daysLeft = Math.ceil(
                  (new Date(comp.endDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={comp.id}
                    className="card p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {comp.title}
                        </h3>
                        <span className="text-xs text-gray-400 capitalize">
                          {comp.type} competition
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {daysLeft}d left
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {comp.description}
                    </p>

                    {comp.prize && (
                      <div className="flex items-center gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <span>🏆</span>
                        <span className="text-sm font-medium text-amber-800">
                          Prize: {comp.prize}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span>
                        {new Date(comp.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>→</span>
                      <span>
                        {new Date(comp.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="ml-auto">
                        {comp.entries.length} participants
                      </span>
                    </div>

                    {/* Top Scorers */}
                    {topEntries.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                          Top Scorers
                        </p>
                        <div className="space-y-1.5">
                          {topEntries.map((entry, i) => (
                            <div
                              key={entry.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-base">
                                {["🥇", "🥈", "🥉"][i]}
                              </span>
                              <span className="font-medium text-gray-700">
                                {entry.user.name}
                              </span>
                              <span className="ml-auto text-indigo-600 font-bold">
                                {entry.score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user ? (
                      hasJoined ? (
                        <div className="w-full py-2 text-center text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                          Joined
                        </div>
                      ) : (
                        <form action="/api/competitions/join" method="POST">
                          <input
                            type="hidden"
                            name="competitionId"
                            value={comp.id}
                          />
                          <button
                            type="submit"
                            className="btn-primary w-full text-sm"
                          >
                            Join Competition
                          </button>
                        </form>
                      )
                    ) : (
                      <Link
                        href="/login"
                        className="btn-secondary w-full text-sm text-center block"
                      >
                        Login to Join
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Competitions */}
        {past.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">📜</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Past Competitions
              </h2>
            </div>

            <div className="space-y-4">
              {past.map((comp) => {
                const winner = comp.entries[0];
                return (
                  <div
                    key={comp.id}
                    className="card p-5 opacity-80 hover:opacity-100 transition-all animate-fade-in"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{comp.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(comp.startDate).toLocaleDateString()} —{" "}
                          {new Date(comp.endDate).toLocaleDateString()} &middot;{" "}
                          {comp.entries.length} participants
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        Ended
                      </span>
                    </div>

                    {winner && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span>🏆</span>
                        <span className="text-gray-600">Winner:</span>
                        <span className="font-semibold text-amber-700">
                          {winner.user.name}
                        </span>
                        <span className="text-gray-400">
                          ({winner.score} pts)
                        </span>
                      </div>
                    )}

                    {comp.entries.length > 1 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {comp.entries.slice(0, 3).map((entry, i) => (
                          <div
                            key={entry.id}
                            className="text-center bg-gray-50 rounded-lg p-2"
                          >
                            <div className="text-lg">{["🥇", "🥈", "🥉"][i]}</div>
                            <p className="text-xs font-medium text-gray-700 truncate">
                              {entry.user.name}
                            </p>
                            <p className="text-xs text-indigo-600 font-bold">
                              {entry.score} pts
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {competitions.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Competitions Yet
            </h2>
            <p className="text-gray-400">
              Competitions will be created by your teachers. Stay tuned!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
