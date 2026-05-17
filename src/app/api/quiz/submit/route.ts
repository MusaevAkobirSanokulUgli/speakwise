import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QuizResultInput {
  quizId: string;
  answer: string;
  isCorrect: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { results } = body as { results: QuizResultInput[] };

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "results must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate each result entry
    for (const r of results) {
      if (!r.quizId || r.answer === undefined || r.isCorrect === undefined) {
        return NextResponse.json(
          { error: "Each result must include quizId, answer, and isCorrect" },
          { status: 400 }
        );
      }
    }

    // Create QuizResult records
    const created = await prisma.$transaction(
      results.map((r) =>
        prisma.quizResult.create({
          data: {
            userId: session.id,
            quizId: r.quizId,
            answer: r.answer,
            isCorrect: r.isCorrect,
          },
        })
      )
    );

    const totalCount = created.length;
    const correctCount = created.filter((r) => r.isCorrect).length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // Fetch quiz details to get levelId and topicId for progress update
    // Use the first quiz's level/topic as representative (assumes single topic/level per submission)
    const firstQuiz = await prisma.quiz.findUnique({
      where: { id: results[0].quizId },
      select: { levelId: true, topicId: true },
    });

    if (firstQuiz) {
      const { levelId, topicId } = firstQuiz;

      const existingProgress = await prisma.studentProgress.findUnique({
        where: {
          userId_levelId_topicId: {
            userId: session.id,
            levelId,
            topicId,
          },
        },
      });

      if (existingProgress) {
        const totalPreviousQuizzes = existingProgress.quizzesCompleted;
        const newTotal = totalPreviousQuizzes + totalCount;
        const updatedScore =
          newTotal > 0
            ? (existingProgress.quizScore * totalPreviousQuizzes + score * totalCount) / newTotal
            : score;

        await prisma.studentProgress.update({
          where: {
            userId_levelId_topicId: {
              userId: session.id,
              levelId,
              topicId,
            },
          },
          data: {
            quizzesCompleted: { increment: totalCount },
            quizScore: updatedScore,
            lastAccessed: new Date(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        summary: {
          total: totalCount,
          correct: correctCount,
          score,
        },
        results: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[quiz/submit] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
