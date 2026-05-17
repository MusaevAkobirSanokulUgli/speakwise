import { prisma } from "@/lib/prisma";

export default async function AdminQuizzesPage() {
  const results = await prisma.quizResult.findMany({
    include: {
      user: { select: { name: true, email: true } },
      quiz: { include: { topic: true, level: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  const totalResults = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = totalResults > 0 ? Math.round((correctCount / totalResults) * 100) : 0;

  // Group by student
  const byStudent = results.reduce(
    (acc, r) => {
      if (!acc[r.userId]) {
        acc[r.userId] = { name: r.user.name, email: r.user.email, total: 0, correct: 0 };
      }
      acc[r.userId].total++;
      if (r.isCorrect) acc[r.userId].correct++;
      return acc;
    },
    {} as Record<string, { name: string; email: string; total: number; correct: number }>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Quiz Results</h1>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-primary-600">{totalResults}</p>
          <p className="text-sm text-gray-500">Total Attempts</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{correctCount}</p>
          <p className="text-sm text-gray-500">Correct Answers</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{accuracy}%</p>
          <p className="text-sm text-gray-500">Overall Accuracy</p>
        </div>
      </div>

      {/* Per Student */}
      <h2 className="text-xl font-bold mb-4">Student Performance</h2>
      <div className="card overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Correct</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(byStudent).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No quiz results yet.
                </td>
              </tr>
            ) : (
              Object.entries(byStudent).map(([id, s]) => (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-3 text-sm">{s.total}</td>
                  <td className="px-6 py-3 text-sm text-green-600 font-medium">{s.correct}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.round((s.correct / s.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((s.correct / s.total) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Results */}
      <h2 className="text-xl font-bold mb-4">Recent Quiz Attempts</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Topic</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Answer</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Result</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.slice(0, 30).map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm">{r.user.name}</td>
                <td className="px-6 py-3 text-sm">{r.quiz.topic.name}</td>
                <td className="px-6 py-3">
                  <span className="badge bg-gray-100 text-gray-600">{r.quiz.level.name}</span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                  {r.answer}
                </td>
                <td className="px-6 py-3">
                  <span className={`badge ${r.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.isCorrect ? "Correct" : "Wrong"}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs text-gray-400">
                  {new Date(r.completedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
