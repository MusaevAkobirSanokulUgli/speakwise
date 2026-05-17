import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelSlug: string }>;
}) {
  const { levelSlug } = await params;
  const user = await getSession();

  const level = await prisma.level.findUnique({
    where: { slug: levelSlug },
  });
  if (!level) notFound();

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          vocabulary: { where: { levelId: level.id } },
          quizzes: { where: { levelId: level.id } },
          questions: { where: { levelId: level.id } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/levels"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 inline-block"
          >
            &larr; All Levels
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
              style={{ background: level.color }}
            >
              {level.order}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{level.name}</h1>
              <p className="text-gray-500">{level.description}</p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <h2 className="text-xl font-bold mb-4">
          Topics ({topics.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/levels/${levelSlug}/${topic.slug}`}
              className="card p-6 group hover:border-primary-200 border-2 border-transparent"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{topic.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <span>📚 {topic._count.vocabulary} words</span>
                <span>📝 {topic._count.quizzes} quizzes</span>
                <span>🗣️ {topic._count.questions} questions</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
