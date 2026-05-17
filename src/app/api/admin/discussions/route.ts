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
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") ?? undefined;

  const where = {
    ...(levelId ? { levelId } : {}),
    ...(topicId ? { topicId } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.discussion.findMany({
      where,
      include: {
        level: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
      orderBy: { title: "asc" },
      skip,
      take: limit,
    }),
    prisma.discussion.count({ where }),
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
      description, descUz, descRu, descKo,
      prompts, tips, levelId, topicId,
    } = body;

    if (!title || !description || !prompts || !levelId || !topicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.discussion.create({
      data: {
        title,
        titleUz: titleUz ?? "",
        titleRu: titleRu ?? "",
        titleKo: titleKo ?? "",
        description,
        descUz: descUz ?? "",
        descRu: descRu ?? "",
        descKo: descKo ?? "",
        prompts,
        tips: tips ?? null,
        levelId, topicId,
      },
      include: {
        level: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
