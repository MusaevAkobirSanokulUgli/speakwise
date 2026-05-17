import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const item = await prisma.readingPassage.findUnique({
    where: { id },
    include: {
      level: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    const fields = [
      "title", "titleUz", "titleRu", "titleKo",
      "passage", "wordCount", "examType", "ageGroup",
      "levelId", "topicId",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    // If questions array is provided, replace all questions
    if (body.questions && Array.isArray(body.questions)) {
      await prisma.readingQuestion.deleteMany({ where: { passageId: id } });
      data.questions = {
        create: body.questions.map((q: Record<string, unknown>, i: number) => ({
          type: q.type as string,
          question: q.question as string,
          questionUz: (q.questionUz as string) ?? "",
          questionRu: (q.questionRu as string) ?? "",
          questionKo: (q.questionKo as string) ?? "",
          options: (q.options as string) ?? null,
          correctAnswer: q.correctAnswer as string,
          explanation: (q.explanation as string) ?? null,
          order: (q.order as number) ?? i,
        })),
      };
    }

    const item = await prisma.readingPassage.update({
      where: { id },
      data,
      include: {
        level: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        questions: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.readingPassage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
