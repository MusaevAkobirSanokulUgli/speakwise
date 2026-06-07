import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import ReadingClient from "./ReadingClient";

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}) {
  const { levelSlug, topicSlug } = await params;
  const [user, lang] = await Promise.all([getSession(), getServerLang()]);

  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "teacher" && !user.canAccessReading) {
    redirect(`/levels/${levelSlug}/${topicSlug}?denied=reading`);
  }

  const [level, topic] = await Promise.all([
    prisma.level.findUnique({ where: { slug: levelSlug } }),
    prisma.topic.findUnique({ where: { slug: topicSlug } }),
  ]);
  if (!level || !topic) notFound();

  const passages = await prisma.readingPassage.findMany({
    where: { levelId: level.id, topicId: topic.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
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
          <span className="text-gray-900 font-medium">{t(lang, "topics", "reading")}</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📖</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {topicName} — <span className="gradient-text">{t(lang, "topics", "reading")}</span>
              </h1>
              <p className="text-gray-500 mt-0.5">
                {levelName} &middot; {passages.length} {passages.length === 1 ? "passage" : "passages"}
              </p>
            </div>
          </div>
        </div>

        {passages.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
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
            {passages.map((passage, idx) => (
              <section key={passage.id}>
                {passages.length > 1 && (
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold"
                    >
                      {idx + 1}
                    </span>
                  </div>
                )}
                <ReadingClient
                  passageId={passage.id}
                  passageTitle={passage.title}
                  passageTitleUz={passage.titleUz}
                  passageTitleRu={passage.titleRu}
                  passageTitleKo={passage.titleKo}
                  passageText={passage.passage}
                  wordCount={passage.wordCount}
                  questions={passage.questions.map((q) => ({
                    id: q.id,
                    type: q.type,
                    question: q.question,
                    questionUz: q.questionUz,
                    questionRu: q.questionRu,
                    questionKo: q.questionKo,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    order: q.order,
                  }))}
                />
              </section>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/discussion`}
            className="btn-secondary"
          >
            &larr; {t(lang, "topics", "discussion")}
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/writing`}
            className="btn-primary"
          >
            {t(lang, "topics", "writing")} &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
