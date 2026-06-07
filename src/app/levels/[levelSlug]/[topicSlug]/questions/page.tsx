import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import SpeakingQuestionsClient from "./SpeakingQuestionsClient";

export default async function QuestionsPage({
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

  const questions = await prisma.speakingQuestion.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { order: "asc" },
  });

  const levelName = pick(level.name, level.nameUz, level.nameRu, level.nameKo, lang);
  const topicName = pick(topic.name, topic.nameUz, topic.nameRu, topic.nameKo, lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-primary-600">
            {t(lang, "nav", "levels")}
          </Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}`} className="hover:text-primary-600">
            {levelName}
          </Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}/${topicSlug}`} className="hover:text-primary-600">
            {topicName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t(lang, "topics", "speakingQuestions")}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topicName} — {t(lang, "topics", "speakingQuestions")}
          </h1>
          <p className="text-gray-500 mt-1">
            {levelName} &middot; {questions.length} {t(lang, "levels", "questions").toLowerCase()}
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">{t(lang, "speaking", "noQuestions")}</p>
          </div>
        ) : (
          <SpeakingQuestionsClient
            questions={questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              questionUz: q.questionUz,
              questionRu: q.questionRu,
              questionKo: q.questionKo,
              templateAnswer: q.templateAnswer,
              linkingWords: q.linkingWords,
              answerStructure: q.answerStructure,
              tips: q.tips,
              tipsUz: q.tipsUz,
              tipsRu: q.tipsRu,
              tipsKo: q.tipsKo,
            }))}
            isLoggedIn={!!user}
          />
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link href={`/levels/${levelSlug}/${topicSlug}/quiz`} className="btn-secondary">
            &larr; {t(lang, "topics", "quiz")}
          </Link>
          <Link href={`/levels/${levelSlug}/${topicSlug}/discussion`} className="btn-primary">
            {t(lang, "topics", "discussion")} &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
