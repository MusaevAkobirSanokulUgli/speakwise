import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import BadgeCheckButton from "./BadgeCheckButton";

export default async function BadgesPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [allBadges, userBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
    }),
  ]);

  const earnedMap = new Map(
    userBadges.map((ub) => [ub.badgeId, ub.earnedAt])
  );

  const categories = [...new Set(allBadges.map((b) => b.category))];

  const categoryLabels: Record<string, string> = {
    achievement: "Achievement",
    streak: "Streak",
    competition: "Competition",
    vocabulary: "Vocabulary",
    speaking: "Speaking",
    reading: "Reading",
    writing: "Writing",
  };

  const categoryIcons: Record<string, string> = {
    achievement: "🏆",
    streak: "🔥",
    competition: "⚔️",
    vocabulary: "📚",
    speaking: "🗣️",
    reading: "📖",
    writing: "✍️",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your <span className="gradient-text">Badges</span>
          </h1>
          <p className="text-gray-500">
            Collect badges by completing milestones and challenges
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="badge text-sm">
              {earnedMap.size} / {allBadges.length} earned
            </span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="card p-5 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Badge Collection Progress
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {allBadges.length > 0
                ? Math.round((earnedMap.size / allBadges.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${
                  allBadges.length > 0
                    ? (earnedMap.size / allBadges.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Check for new badges */}
        <div className="mb-8 flex justify-end">
          <BadgeCheckButton />
        </div>

        {allBadges.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-gray-400 text-lg">No badges defined yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => {
              const badgesInCat = allBadges.filter(
                (b) => b.category === category
              );
              return (
                <section key={category} className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xl">
                      {categoryIcons[category] || "🎖️"}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                      {categoryLabels[category] || category}
                    </h2>
                    <span className="ml-2 text-xs text-gray-400">
                      {badgesInCat.filter((b) => earnedMap.has(b.id)).length} /{" "}
                      {badgesInCat.length} earned
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {badgesInCat.map((badge) => {
                      const earned = earnedMap.has(badge.id);
                      const earnedAt = earnedMap.get(badge.id);
                      return (
                        <div
                          key={badge.id}
                          className={`card p-5 text-center transition-all ${
                            earned
                              ? "ring-2 ring-amber-300 bg-amber-50/30"
                              : "opacity-50 grayscale"
                          }`}
                        >
                          <div className="text-4xl mb-3">{badge.icon}</div>
                          <h3
                            className={`font-bold text-sm mb-1 ${
                              earned ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {badge.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3 leading-snug">
                            {badge.description}
                          </p>
                          {earned ? (
                            <div>
                              <span className="inline-block badge text-xs bg-amber-100 text-amber-700 border-amber-300">
                                Earned
                              </span>
                              {earnedAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(earnedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="inline-block badge text-xs bg-gray-100 text-gray-400 border-gray-200">
                                Locked
                              </span>
                              <p className="text-xs text-gray-400 mt-2 italic">
                                {badge.criteria}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
