import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import VocabCard from "@/components/VocabCard";

export default async function VocabularyPage({
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

  const vocabulary = await prisma.vocabulary.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { word: "asc" },
  });

  const levelName = pick(level.name, level.nameUz, level.nameRu, level.nameKo, lang);
  const topicName = pick(topic.name, topic.nameUz, topic.nameRu, topic.nameKo, lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <span className="text-gray-900 font-medium">{t(lang, "topics", "vocabulary")}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {topic.icon} {topicName} — {t(lang, "topics", "vocabulary")}
            </h1>
            <p className="text-gray-500 mt-1">
              {levelName} &middot; {vocabulary.length} {t(lang, "levels", "words").toLowerCase()}
            </p>
          </div>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/quiz`}
            className="btn-primary hidden sm:inline-flex"
          >
            {t(lang, "topics", "quiz")} &rarr;
          </Link>
        </div>

        {vocabulary.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">
              {t(lang, "common", "noData")}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {t(lang, "topics", "vocabulary")}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vocabulary.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  word={vocab.word}
                  definition={vocab.definition}
                  definitionUz={vocab.definitionUz}
                  definitionRu={vocab.definitionRu}
                  definitionKo={vocab.definitionKo}
                  exampleSentence={vocab.exampleSentence}
                  exampleUz={vocab.exampleUz}
                  exampleRu={vocab.exampleRu}
                  exampleKo={vocab.exampleKo}
                  pronunciation={vocab.pronunciation ?? undefined}
                  imageUrl={vocab.imageUrl ?? undefined}
                  partOfSpeech={vocab.partOfSpeech ?? undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link
            href={`/levels/${levelSlug}/${topicSlug}`}
            className="btn-secondary"
          >
            &larr; {t(lang, "topics", "backToTopic")}
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/quiz`}
            className="btn-primary"
          >
            {t(lang, "topics", "quiz")} &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
