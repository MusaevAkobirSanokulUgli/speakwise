import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const examType = searchParams.get("examType") ?? undefined;

  const where = {
    ...(search ? { title: { contains: search } } : {}),
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    ...(examType ? { examType } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: [{ order: "asc" }, { title: "asc" }],
      skip,
      take: limit,
    }),
    prisma.resource.count({ where }),
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
    const { title, description, type, url, category, examType, thumbnail, order } = body;

    if (!title || !description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.resource.create({
      data: {
        title,
        description,
        type: type ?? "youtube",
        url,
        category: category ?? "general",
        examType: examType ?? "general",
        thumbnail: thumbnail ?? null,
        order: order ?? 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
