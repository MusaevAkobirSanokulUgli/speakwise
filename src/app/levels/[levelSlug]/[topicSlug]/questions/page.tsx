import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import SpeakingQuestionsClient from "./SpeakingQuestionsClient";

export default async function QuestionsPage({
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

  const questions = await prisma.speakingQuestion.findMany({
    where: { levelId: level.id, topicId: topic.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-primary-600">Levels</Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}`} className="hover:text-primary-600">{level.name}</Link>
          <span>/</span>
          <Link href={`/levels/${levelSlug}/${topicSlug}`} className="hover:text-primary-600">{topic.name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Speaking Questions</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topic.name} — Speaking Questions
          </h1>
          <p className="text-gray-500 mt-1">
            {level.name} &middot; {questions.length} questions &middot; Write your answers and submit for teacher feedback
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">No speaking questions available yet.</p>
          </div>
        ) : (
          <SpeakingQuestionsClient
            questions={questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              templateAnswer: q.templateAnswer,
              linkingWords: q.linkingWords,
              answerStructure: q.answerStructure,
              tips: q.tips,
            }))}
            isLoggedIn={!!user}
          />
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link href={`/levels/${levelSlug}/${topicSlug}/quiz`} className="btn-secondary">
            &larr; Quiz
          </Link>
          <Link href={`/levels/${levelSlug}/${topicSlug}/discussion`} className="btn-primary">
            Discussion &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
