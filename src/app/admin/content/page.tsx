import { prisma } from "@/lib/prisma";

export default async function ContentPage() {
  const [levels, topics, vocabCount, quizCount, questionCount, discussionCount, materialCount] =
    await Promise.all([
      prisma.level.findMany({ orderBy: { order: "asc" } }),
      prisma.topic.findMany({ orderBy: { order: "asc" } }),
      prisma.vocabulary.count(),
      prisma.quiz.count(),
      prisma.speakingQuestion.count(),
      prisma.discussion.count(),
      prisma.speakingMaterial.count(),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Content Overview
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Vocabulary", value: vocabCount, icon: "📚" },
          { label: "Quizzes", value: quizCount, icon: "📝" },
          { label: "Speaking Questions", value: questionCount, icon: "🗣️" },
          { label: "Discussions", value: discussionCount, icon: "💬" },
          { label: "Materials", value: materialCount, icon: "📋" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Levels */}
      <h2 className="text-xl font-bold mb-4">Levels ({levels.length})</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {levels.map((level) => (
          <div
            key={level.id}
            className="card p-4 border-l-4"
            style={{ borderLeftColor: level.color }}
          >
            <h3 className="font-bold text-sm">{level.name}</h3>
            <p className="text-xs text-gray-500">{level.slug}</p>
          </div>
        ))}
      </div>

      {/* Topics */}
      <h2 className="text-xl font-bold mb-4">Topics ({topics.length})</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Topic
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{topic.order}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-sm">
                    {topic.icon} {topic.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {topic.slug}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-[300px] truncate">
                  {topic.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
