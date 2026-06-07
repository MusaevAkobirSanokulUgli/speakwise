import { cookies } from "next/headers";

export async function getServerLang(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("lang")?.value ?? "en";
}

export function pick(en: string, uz: string, ru: string, ko: string, lang: string): string {
  const map: Record<string, string> = { en, uz, ru, ko };
  const val = map[lang];
  return val && val.trim() !== "" ? val : en;
}
