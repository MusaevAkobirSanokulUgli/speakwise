import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const levelId = searchParams.get("levelId") ?? undefined;
  const topicId = searchParams.get("topicId") ?? undefined;
  const examType = searchParams.get("examType") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") ?? undefined;

  const where = {
    ...(levelId ? { levelId } : {}),
    ...(topicId ? { topicId } : {}),
    ...(examType ? { examType } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.readingPassage.findMany({
      where,
      include: {
        level: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        questions: { orderBy: { order: "asc" } },
      },
      orderBy: { title: "asc" },
      skip,
      take: limit,
    }),
    prisma.readingPassage.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      title, titleUz, titleRu, titleKo,
      passage, wordCount, examType, ageGroup,
      levelId, topicId, questions,
    } = body;

    if (!title || !passage || !levelId || !topicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.readingPassage.create({
      data: {
        title,
        titleUz: titleUz ?? "",
        titleRu: titleRu ?? "",
        titleKo: titleKo ?? "",
        passage,
        wordCount: wordCount ?? 0,
        examType: examType ?? "general",
        ageGroup: ageGroup ?? "all",
        levelId, topicId,
        ...(questions && Array.isArray(questions) && questions.length > 0
          ? {
              questions: {
                create: questions.map((q: Record<string, unknown>, i: number) => ({
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
              },
            }
          : {}),
      },
      include: {
        level: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        questions: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
