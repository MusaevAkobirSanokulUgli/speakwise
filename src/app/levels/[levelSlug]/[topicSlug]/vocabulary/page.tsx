import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import VocabCard from "@/components/VocabCard";

export default async function VocabularyPage({
  params,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
}) {
  const { levelSlug, topicSlug } = await params;
  const user = await getSession();

  const [level, topic] = await Promise.all([
    prisma.level.findUnique({ where: { slug: levelSlug } }),
    prisma.topic.findUnique({ where: { slug: topicSlug } }),
  ]);
  if (!level || !topic) notFound();

  const vocabulary = await prisma.vocabulary.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { word: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-primary-600">
            Levels
          </Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}`} className="hover:text-primary-600">
            {level.name}
          </Link>
          <span>/</span>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}`}
            className="hover:text-primary-600"
          >
            {topic.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Vocabulary</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {topic.icon} {topic.name} — Vocabulary
            </h1>
            <p className="text-gray-500 mt-1">
              {level.name} &middot; {vocabulary.length} words to learn
            </p>
          </div>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/quiz`}
            className="btn-primary hidden sm:inline-flex"
          >
            Take Quiz &rarr;
          </Link>
        </div>

        {vocabulary.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">
              No vocabulary available for this level and topic yet.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              Click on a card to flip it and see the definition and example sentence.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vocabulary.map((vocab) => (
                <VocabCard
                  key={vocab.id}
                  word={vocab.word}
                  definition={vocab.definition}
                  exampleSentence={vocab.exampleSentence}
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
            &larr; Back to Topic
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/quiz`}
            className="btn-primary"
          >
            Take Quiz &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
