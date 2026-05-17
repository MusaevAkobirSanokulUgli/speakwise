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
  const item = await prisma.vocabulary.findUnique({
    where: { id },
    include: { level: { select: { id: true, name: true } }, topic: { select: { id: true, name: true } } },
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
    const item = await prisma.vocabulary.update({
      where: { id },
      data: {
        ...(body.word !== undefined ? { word: body.word } : {}),
        ...(body.definition !== undefined ? { definition: body.definition } : {}),
        ...(body.definitionUz !== undefined ? { definitionUz: body.definitionUz } : {}),
        ...(body.definitionRu !== undefined ? { definitionRu: body.definitionRu } : {}),
        ...(body.definitionKo !== undefined ? { definitionKo: body.definitionKo } : {}),
        ...(body.exampleSentence !== undefined ? { exampleSentence: body.exampleSentence } : {}),
        ...(body.exampleUz !== undefined ? { exampleUz: body.exampleUz } : {}),
        ...(body.exampleRu !== undefined ? { exampleRu: body.exampleRu } : {}),
        ...(body.exampleKo !== undefined ? { exampleKo: body.exampleKo } : {}),
        ...(body.pronunciation !== undefined ? { pronunciation: body.pronunciation } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
        ...(body.partOfSpeech !== undefined ? { partOfSpeech: body.partOfSpeech } : {}),
        ...(body.ageGroup !== undefined ? { ageGroup: body.ageGroup } : {}),
        ...(body.examType !== undefined ? { examType: body.examType } : {}),
        ...(body.levelId !== undefined ? { levelId: body.levelId } : {}),
        ...(body.topicId !== undefined ? { topicId: body.topicId } : {}),
      },
      include: { level: { select: { id: true, name: true } }, topic: { select: { id: true, name: true } } },
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
    await prisma.vocabulary.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
