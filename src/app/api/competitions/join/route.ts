import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let competitionId: string | undefined;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { competitionId?: string };
    competitionId = body.competitionId;
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await req.formData();
    competitionId = formData.get("competitionId")?.toString();
  }

  if (!competitionId) {
    return NextResponse.json(
      { error: "competitionId is required" },
      { status: 400 }
    );
  }

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
  });
  if (!competition) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 }
    );
  }
  if (!competition.isActive) {
    return NextResponse.json(
      { error: "Competition is not active" },
      { status: 400 }
    );
  }

  // Check if already joined
  const existing = await prisma.competitionEntry.findUnique({
    where: { userId_competitionId: { userId: user.id, competitionId } },
  });
  if (existing) {
    // Return the existing entry — not an error
    if (contentType.includes("application/json")) {
      return NextResponse.json({ entry: existing, alreadyJoined: true });
    }
    return NextResponse.redirect(new URL("/competitions", req.url));
  }

  const entry = await prisma.competitionEntry.create({
    data: { userId: user.id, competitionId },
  });

  if (contentType.includes("application/json")) {
    return NextResponse.json({ entry }, { status: 201 });
  }

  // Redirect back for form submissions
  return NextResponse.redirect(new URL("/competitions", req.url));
}
