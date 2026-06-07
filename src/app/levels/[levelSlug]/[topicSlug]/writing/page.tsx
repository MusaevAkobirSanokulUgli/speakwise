import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import WritingClient from "./WritingClient";

export default async function WritingPage({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}) {
  const { levelSlug, topicSlug } = await params;
  const [user, lang] = await Promise.all([getSession(), getServerLang()]);

  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "teacher" && !user.canAccessWriting) {
    redirect(`/levels/${levelSlug}/${topicSlug}?denied=writing`);
  }

  const [level, topic] = await Promise.all([
    prisma.level.findUnique({ where: { slug: levelSlug } }),
    prisma.topic.findUnique({ where: { slug: topicSlug } }),
  ]);
  if (!level || !topic) notFound();

  const tasks = await prisma.writingTask.findMany({
    where: { levelId: level.id, topicId: topic.id },
  });

  const levelName = pick(level.name, level.nameUz, level.nameRu, level.nameKo, lang);
  const topicName = pick(topic.name, topic.nameUz, topic.nameRu, topic.nameKo, lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-indigo-600">
            {t(lang, "nav", "levels")}
          </Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}`} className="hover:text-indigo-600">
            {levelName}
          </Link>
          <span>/</span>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}`}
            className="hover:text-indigo-600"
          >
            {topicName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t(lang, "topics", "writing")}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">✍️</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {topicName} — <span className="gradient-text">{t(lang, "topics", "writing")}</span>
              </h1>
              <p className="text-gray-500 mt-0.5">
                {levelName} &middot; {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">✍️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t(lang, "common", "noData")}
            </h2>
            <Link
              href={`/levels/${levelSlug}/${topicSlug}`}
              className="btn-secondary mt-6 inline-block"
            >
              &larr; {t(lang, "topics", "backToTopic")}
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {tasks.map((task, idx) => (
              <section key={task.id}>
                {tasks.length > 1 && (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                  </div>
                )}
                <WritingClient
                  task={{
                    id: task.id,
                    title: task.title,
                    titleUz: task.titleUz,
                    titleRu: task.titleRu,
                    titleKo: task.titleKo,
                    instructions: task.instructions,
                    instructUz: task.instructUz,
                    instructRu: task.instructRu,
                    instructKo: task.instructKo,
                    type: task.type,
                    sampleAnswer: task.sampleAnswer,
                    tips: task.tips,
                    wordCountMin: task.wordCountMin,
                    wordCountMax: task.wordCountMax,
                  }}
                  isLoggedIn={!!user}
                />
              </section>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/reading`}
            className="btn-secondary"
          >
            &larr; {t(lang, "topics", "reading")}
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}`}
            className="btn-primary"
          >
            {t(lang, "topics", "backToTopic")}
          </Link>
        </div>
      </main>
    </div>
  );
}
