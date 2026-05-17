import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function DiscussionPage({
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

  const discussions = await prisma.discussion.findMany({
    where: { levelId: level.id, topicId: topic.id },
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
          <span className="text-gray-900 font-medium">Discussion</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topic.name} — Discussion
          </h1>
          <p className="text-gray-500 mt-1">
            {level.name} &middot; Practice speaking with these discussion prompts
          </p>
        </div>

        {discussions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">No discussion topics available yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {discussions.map((disc) => {
              const prompts = JSON.parse(disc.prompts) as string[];
              return (
                <div key={disc.id} className="card p-6 animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    💬 {disc.title}
                  </h2>
                  <p className="text-gray-500 mb-4">{disc.description}</p>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Discussion Prompts:
                    </p>
                    {prompts.map((prompt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-primary-900">{prompt}</p>
                      </div>
                    ))}
                  </div>

                  {disc.tips && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      <strong>Tips:</strong> {disc.tips}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <Link href={`/levels/${levelSlug}/${topicSlug}/questions`} className="btn-secondary">
            &larr; Speaking Questions
          </Link>
          <Link href={`/levels/${levelSlug}/${topicSlug}`} className="btn-primary">
            Back to Topic
          </Link>
        </div>
      </main>
    </div>
  );
}
