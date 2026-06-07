import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServerLang, pick } from "@/lib/serverLang";
import { t } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import AccessDeniedBanner from "./AccessDeniedBanner";
import BeginnerSentenceGuide from "@/components/BeginnerSentenceGuide";

export default async function TopicOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ levelSlug: string; topicSlug: string }>;
  searchParams: Promise<{ denied?: string }>;
}) {
  const { levelSlug, topicSlug } = await params;
  const { denied } = await searchParams;
  const [user, lang] = await Promise.all([getSession(), getServerLang()]);

  const [level, topic] = await Promise.all([
    prisma.level.findUnique({ where: { slug: levelSlug } }),
    prisma.topic.findUnique({ where: { slug: topicSlug } }),
  ]);
  if (!level || !topic) notFound();

  const [vocabCount, quizCount, questionCount, discussionCount, readingCount, writingCount] =
    await Promise.all([
      prisma.vocabulary.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
      prisma.quiz.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
      prisma.speakingQuestion.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
      prisma.discussion.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
      prisma.readingPassage.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
      prisma.writingTask.count({
        where: { levelId: level.id, topicId: topic.id },
      }),
    ]);

  const levelName = pick(level.name, level.nameUz, level.nameRu, level.nameKo, lang);
  const topicName = pick(topic.name, topic.nameUz, topic.nameRu, topic.nameKo, lang);
  const topicDesc = pick(topic.description, topic.descUz, topic.descRu, topic.descKo, lang);

  const sections = [
    {
      title: t(lang, "topics", "vocabulary"),
      icon: "📚",
      count: vocabCount,
      href: `/levels/${levelSlug}/${topicSlug}/vocabulary`,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: t(lang, "topics", "quiz"),
      icon: "📝",
      count: quizCount,
      href: `/levels/${levelSlug}/${topicSlug}/quiz`,
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      title: t(lang, "topics", "speakingQuestions"),
      icon: "🗣️",
      count: questionCount,
      href: `/levels/${levelSlug}/${topicSlug}/questions`,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: t(lang, "topics", "reading"),
      icon: "📖",
      count: readingCount,
      href: `/levels/${levelSlug}/${topicSlug}/reading`,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      title: t(lang, "topics", "writing"),
      icon: "✍️",
      count: writingCount,
      href: `/levels/${levelSlug}/${topicSlug}/writing`,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      title: t(lang, "topics", "discussion"),
      icon: "💬",
      count: discussionCount,
      href: `/levels/${levelSlug}/${topicSlug}/discussion`,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Access denied banner */}
        {denied && <AccessDeniedBanner type={denied} />}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/levels" className="hover:text-primary-600">
            {t(lang, "nav", "levels")}
          </Link>
          <span>/</span>
          <Link
            href={`/levels/${levelSlug}`}
            className="hover:text-primary-600"
          >
            {levelName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{topicName}</span>
        </div>

        {/* Topic Header */}
        <div className="card p-8 mb-8 animate-fade-in border-l-4" style={{ borderLeftColor: level.color }}>
          <div className="flex items-center gap-5">
            <span className="text-6xl">{topic.icon}</span>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: level.color }}
                >
                  {levelName}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {topicName}
              </h1>
              <p className="text-gray-500 mt-1">{topicDesc}</p>
            </div>
          </div>
        </div>

        {/* Beginner sentence guide */}
        {(levelSlug === "beginner" || levelSlug === "elementary") && (
          <div className="mb-8">
            <BeginnerSentenceGuide />
          </div>
        )}

        {/* Sections */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className={`card p-6 border-2 hover:scale-[1.02] transition-all ${section.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{section.icon}</span>
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <span className="text-sm opacity-75">
                    {section.count} {t(lang, "topics", "items")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
