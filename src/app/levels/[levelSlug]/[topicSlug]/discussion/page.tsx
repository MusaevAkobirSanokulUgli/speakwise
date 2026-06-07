import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";

export default async function DiscussionPage({
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

  const discussions = await prisma.discussion.findMany({
    where: { levelId: level.id, topicId: topic.id },
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
          <span className="text-gray-900 font-medium">{t(lang, "topics", "discussion")}</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {topic.icon} {topicName} — {t(lang, "topics", "discussion")}
          </h1>
          <p className="text-gray-500 mt-1">
            {levelName}
          </p>
        </div>

        {discussions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">{t(lang, "common", "noData")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {discussions.map((disc) => {
              const prompts = JSON.parse(disc.prompts) as string[];
              const localTitle = pick(disc.title, disc.titleUz, disc.titleRu, disc.titleKo, lang);
              const localDesc = pick(disc.description, disc.descUz, disc.descRu, disc.descKo, lang);
              return (
                <div key={disc.id} className="card p-6 animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    💬 {localTitle}
                  </h2>
                  <p className="text-gray-500 mb-4">{localDesc}</p>

                  <div className="space-y-3">
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
            &larr; {t(lang, "topics", "speakingQuestions")}
          </Link>
          <Link href={`/levels/${levelSlug}/${topicSlug}`} className="btn-primary">
            {t(lang, "topics", "backToTopic")}
          </Link>
        </div>
      </main>
    </div>
  );
}
