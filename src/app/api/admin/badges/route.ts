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
  const category = searchParams.get("category") ?? undefined;

  const where = {
    ...(search ? { name: { contains: search } } : {}),
    ...(category ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.badge.findMany({
      where,
      include: { _count: { select: { userBadges: true } } },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.badge.count({ where }),
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
      name, nameUz, nameRu, nameKo,
      description, descUz, descRu, descKo,
      icon, criteria, category,
    } = body;

    if (!name || !description || !icon || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.badge.create({
      data: {
        name,
        nameUz: nameUz ?? "",
        nameRu: nameRu ?? "",
        nameKo: nameKo ?? "",
        description,
        descUz: descUz ?? "",
        descRu: descRu ?? "",
        descKo: descKo ?? "",
        icon,
        criteria,
        category: category ?? "achievement",
      },
      include: { _count: { select: { userBadges: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
