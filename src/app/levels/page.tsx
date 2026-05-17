import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function LevelsPage() {
  const user = await getSession();
  const levels = await prisma.level.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          vocabulary: true,
          quizzes: true,
          questions: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your <span className="gradient-text">Level</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Select your current English level to access vocabulary, quizzes, and
            speaking practice tailored to your ability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/levels/${level.slug}`}
              className="card p-6 border-l-4 hover:scale-[1.02] transition-all group"
              style={{ borderLeftColor: level.color }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ background: level.color }}
              >
                {level.order}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {level.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4">{level.description}</p>
              <div className="flex gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  📚 {level._count.vocabulary} words
                </span>
                <span className="flex items-center gap-1">
                  📝 {level._count.quizzes} quizzes
                </span>
                <span className="flex items-center gap-1">
                  🗣️ {level._count.questions} questions
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
