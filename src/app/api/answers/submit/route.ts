import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, answerText } = body;

    if (!questionId || !answerText) {
      return NextResponse.json(
        { error: "questionId and answerText are required" },
        { status: 400 }
      );
    }

    const question = await prisma.speakingQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const answer = await prisma.studentAnswer.create({
      data: {
        userId: session.id,
        questionId,
        answerText,
      },
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error("[answers/submit] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
