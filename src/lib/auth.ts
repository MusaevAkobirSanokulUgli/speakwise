import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  level: string;
  canAccessReading: boolean;
  canAccessWriting: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;

  try {
    const decoded = Buffer.from(sessionCookie.value, "base64").toString();
    const session = JSON.parse(decoded) as SessionUser;
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
      canAccessReading: user.canAccessReading,
      canAccessWriting: user.canAccessWriting,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}
