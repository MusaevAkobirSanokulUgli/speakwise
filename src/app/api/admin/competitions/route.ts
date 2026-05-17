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
  const isActive = searchParams.get("isActive");

  const where = {
    ...(search ? { title: { contains: search } } : {}),
    ...(isActive !== null ? { isActive: isActive === "true" } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.competition.findMany({
      where,
      include: { _count: { select: { entries: true } } },
      orderBy: { startDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.competition.count({ where }),
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
    const { title, description, type, startDate, endDate, isActive, prize } = body;

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.competition.create({
      data: {
        title,
        description,
        type: type ?? "monthly",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        prize: prize ?? null,
      },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
