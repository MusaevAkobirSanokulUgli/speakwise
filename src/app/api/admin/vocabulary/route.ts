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
    ...(search
      ? {
          OR: [
            { word: { contains: search } },
            { definition: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.vocabulary.findMany({
      where,
      include: { level: { select: { id: true, name: true } }, topic: { select: { id: true, name: true } } },
      orderBy: { word: "asc" },
      skip,
      take: limit,
    }),
    prisma.vocabulary.count({ where }),
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
      word, definition, definitionUz, definitionRu, definitionKo,
      exampleSentence, exampleUz, exampleRu, exampleKo,
      pronunciation, imageUrl, partOfSpeech, ageGroup, examType,
      levelId, topicId,
    } = body;

    if (!word || !definition || !exampleSentence || !levelId || !topicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.vocabulary.create({
      data: {
        word, definition,
        definitionUz: definitionUz ?? "",
        definitionRu: definitionRu ?? "",
        definitionKo: definitionKo ?? "",
        exampleSentence,
        exampleUz: exampleUz ?? "",
        exampleRu: exampleRu ?? "",
        exampleKo: exampleKo ?? "",
        pronunciation: pronunciation ?? null,
        imageUrl: imageUrl ?? null,
        partOfSpeech: partOfSpeech ?? null,
        ageGroup: ageGroup ?? "all",
        examType: examType ?? "general",
        levelId, topicId,
      },
      include: { level: { select: { id: true, name: true } }, topic: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
