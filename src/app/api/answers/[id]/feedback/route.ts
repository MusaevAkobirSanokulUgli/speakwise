import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin" && session.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await req.json();
    const { feedback, score } = body;

    if (feedback === undefined && score === undefined) {
      return NextResponse.json(
        { error: "At least one of feedback or score is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.studentAnswer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Student answer not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.studentAnswer.update({
      where: { id },
      data: {
        ...(feedback !== undefined && { feedback }),
        ...(score !== undefined && { score }),
        checked: true,
      },
    });

    return NextResponse.json({ answer: updated }, { status: 200 });
  } catch (error) {
    console.error("[answers/[id]/feedback] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
