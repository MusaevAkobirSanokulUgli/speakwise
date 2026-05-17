import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;

  const where = {
    ...(search ? { name: { contains: search } } : {}),
  };

  const items = await prisma.level.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items, total: items.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "teacher")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      name, slug, nameUz, nameRu, nameKo,
      order, description, descUz, descRu, descKo, color,
    } = body;

    if (!name || !slug || order === undefined || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.level.create({
      data: {
        name, slug,
        nameUz: nameUz ?? "",
        nameRu: nameRu ?? "",
        nameKo: nameKo ?? "",
        order,
        description,
        descUz: descUz ?? "",
        descRu: descRu ?? "",
        descKo: descKo ?? "",
        color: color ?? "#6366F1",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
