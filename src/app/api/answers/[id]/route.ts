import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const answer = await prisma.studentAnswer.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      question: {
        include: {
          topic: { select: { name: true } },
          level: { select: { name: true } },
        },
      },
    },
  });

  if (!answer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(answer);
}
