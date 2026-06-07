import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import QuizComponent from "@/components/QuizComponent";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}) {
  const { levelSlug, topicSlug } = await params;
  const [user, lang] = await Promise.all([getSession(), getServerLang()]);

  const [level, topic] = await Promise.all([
    prisma.level.findUnique({ where: { slug: levelSlug } }),
    prisma.topic.findUnique({ where: { slug: topicSlug } }),
  ]);
  if (!level || !topic) notFound();

  const quizzes = await prisma.quiz.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { order: "asc" },
  });

  const levelName = pick(level.name, level.nameUz, level.nameRu, level.nameKo, lang);
  const topicName = pick(topic.name, topic.nameUz, topic.nameRu, topic.nameKo, lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-primary-600">
            {t(lang, "nav", "levels")}
          </Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}`} className="hover:text-primary-600">
            {levelName}
          </Link>
          <span>/</span>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}`}
            className="hover:text-primary-600"
          >
            {topicName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t(lang, "topics", "quiz")}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topicName} — {t(lang, "topics", "quiz")}
          </h1>
          <p className="text-gray-500 mt-1">
            {levelName} &middot; {quizzes.length} {t(lang, "levels", "questions").toLowerCase()}
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">
              {t(lang, "common", "noData")}
            </p>
          </div>
        ) : (
          <QuizComponent
            quizzes={quizzes.map((q) => ({
              id: q.id,
              type: q.type as "multiple_choice" | "gap_fill" | "sentence_build",
              question: q.question,
              questionUz: q.questionUz,
              questionRu: q.questionRu,
              questionKo: q.questionKo,
              options: q.options ?? undefined,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation ?? undefined,
              explanationUz: q.explanationUz,
              explanationRu: q.explanationRu,
              explanationKo: q.explanationKo,
            }))}
          />
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/vocabulary`}
            className="btn-secondary"
          >
            &larr; {t(lang, "topics", "vocabulary")}
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/questions`}
            className="btn-primary"
          >
            {t(lang, "topics", "speakingQuestions")} &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
