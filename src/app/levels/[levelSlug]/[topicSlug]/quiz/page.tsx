import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import QuizComponent from "@/components/QuizComponent";

export default async function QuizPage({
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

  const quizzes = await prisma.quiz.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <span className="text-gray-900 font-medium">Quiz</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topic.name} — Quiz
          </h1>
          <p className="text-gray-500 mt-1">
            {level.name} &middot; {quizzes.length} questions
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">
              No quizzes available for this level and topic yet.
            </p>
          </div>
        ) : (
          <QuizComponent
            quizzes={quizzes.map((q) => ({
              id: q.id,
              type: q.type as "multiple_choice" | "gap_fill" | "sentence_build",
              question: q.question,
              options: q.options ?? undefined,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation ?? undefined,
            }))}
          />
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/vocabulary`}
            className="btn-secondary"
          >
            &larr; Vocabulary
          </Link>
          <Link
            href={`/levels/${levelSlug}/${topicSlug}/questions`}
            className="btn-primary"
          >
            Speaking Questions &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
