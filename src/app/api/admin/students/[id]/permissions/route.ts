import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    canAccessReading?: boolean;
    canAccessWriting?: boolean;
  };

  const updateData: Record<string, boolean> = {};
  if (typeof body.canAccessReading === "boolean") {
    updateData.canAccessReading = body.canAccessReading;
  }
  if (typeof body.canAccessWriting === "boolean") {
    updateData.canAccessWriting = body.canAccessWriting;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      canAccessReading: true,
      canAccessWriting: true,
    },
  });

  return NextResponse.json(updated);
}
