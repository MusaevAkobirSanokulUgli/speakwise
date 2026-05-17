import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { taskId?: string; text?: string };
  try {
    body = (await req.json()) as { taskId?: string; text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { taskId, text } = body;
  if (!taskId || !text?.trim()) {
    return NextResponse.json(
      { error: "taskId and text are required" },
      { status: 400 }
    );
  }

  const task = await prisma.writingTask.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const wordCount = text.trim().split(/\s+/).length;

  const submission = await prisma.writingSubmission.create({
    data: {
      userId: user.id,
      taskId,
      text: text.trim(),
      wordCount,
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}
