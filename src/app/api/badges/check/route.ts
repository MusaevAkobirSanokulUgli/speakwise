import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BadgeCriteria {
  slug: string;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  quizCount: number;
  perfectScoreQuizzes: number;
  vocabCount: number;
  speakingAnswers: number;
  streak: number;
  wonCompetition: boolean;
}

const BADGE_CRITERIA: BadgeCriteria[] = [
  {
    slug: "first_quiz",
    check: (s) => s.quizCount >= 1,
  },
  {
    slug: "quiz_master",
    check: (s) => s.quizCount >= 50,
  },
  {
    slug: "vocab_100",
    check: (s) => s.vocabCount >= 100,
  },
  {
    slug: "vocab_500",
    check: (s) => s.vocabCount >= 500,
  },
  {
    slug: "speaking_star",
    check: (s) => s.speakingAnswers >= 20,
  },
  {
    slug: "perfect_score",
    check: (s) => s.perfectScoreQuizzes >= 1,
  },
  {
    slug: "streak_7",
    check: (s) => s.streak >= 7,
  },
  {
    slug: "streak_30",
    check: (s) => s.streak >= 30,
  },
  {
    slug: "competition_winner",
    check: (s) => s.wonCompetition,
  },
];

export async function POST() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gather user stats
  const [
    quizResults,
    progress,
    speakingAnswers,
    dbUser,
    competitionEntries,
    existingBadges,
    allBadges,
  ] = await Promise.all([
    prisma.quizResult.findMany({ where: { userId: user.id } }),
    prisma.studentProgress.findMany({ where: { userId: user.id } }),
    prisma.studentAnswer.findMany({ where: { userId: user.id } }),
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.competitionEntry.findMany({
      where: { userId: user.id },
      include: { competition: true },
      orderBy: { score: "desc" },
    }),
    prisma.userBadge.findMany({ where: { userId: user.id } }),
    prisma.badge.findMany(),
  ]);

  // Compute per-quiz session correct counts to detect perfect scores
  // Group quiz results by quiz session (approximate: by date groupings)
  // For "perfect score on a quiz", check if user got 100% on any quiz set
  const quizCount = quizResults.length;
  const vocabCount = progress.reduce((s, p) => s + p.vocabLearned, 0);
  const streak = dbUser?.streak ?? 0;

  // Perfect score: check if user answered all questions correctly in a session
  // We approximate: if user has any quiz result with isCorrect=true on ≥10 quizzes in a quiz set
  // Simpler approach: check if all results for a given quizId are correct grouped by topic+level combo
  const correctCount = quizResults.filter((r) => r.isCorrect).length;
  const perfectScoreQuizzes =
    quizCount > 0 && correctCount === quizCount ? 1 : 0;

  // Competition winner: check if user is ranked #1 in any competition
  let wonCompetition = false;
  for (const entry of competitionEntries) {
    const allEntries = await prisma.competitionEntry.findMany({
      where: { competitionId: entry.competitionId },
      orderBy: { score: "desc" },
      take: 1,
    });
    if (allEntries[0]?.userId === user.id && entry.score > 0) {
      wonCompetition = true;
      break;
    }
  }

  const stats: UserStats = {
    quizCount,
    perfectScoreQuizzes,
    vocabCount,
    speakingAnswers: speakingAnswers.length,
    streak,
    wonCompetition,
  };

  const existingBadgeIds = new Set(existingBadges.map((ub) => ub.badgeId));
  const newlyAwarded: string[] = [];

  for (const criteria of BADGE_CRITERIA) {
    if (!criteria.check(stats)) continue;

    // Find the badge by criteria field (stored as the slug/criteria text)
    const badge = allBadges.find(
      (b) =>
        b.criteria.toLowerCase().includes(criteria.slug.replace("_", " ")) ||
        b.name.toLowerCase().replace(/\s+/g, "_") === criteria.slug ||
        b.criteria === criteria.slug
    );

    if (!badge) continue;
    if (existingBadgeIds.has(badge.id)) continue;

    await prisma.userBadge.create({
      data: { userId: user.id, badgeId: badge.id },
    });
    newlyAwarded.push(badge.name);
  }

  return NextResponse.json(
    {
      awarded: newlyAwarded,
      stats,
    },
    { status: 200 }
  );
}

// GET is not supported — badge checks must be done via POST
export async function GET() {
  return NextResponse.json(
    { error: "Use POST to check badges" },
    { status: 405 }
  );
}
