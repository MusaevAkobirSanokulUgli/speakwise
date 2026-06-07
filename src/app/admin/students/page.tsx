import { prisma } from "@/lib/prisma";
import PermissionToggles from "./PermissionToggles";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      level: true,
      canAccessReading: true,
      canAccessWriting: true,
      createdAt: true,
      _count: {
        select: {
          studentAnswers: true,
          quizResults: true,
        },
      },
      quizResults: {
        where: { isCorrect: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
      <p className="text-gray-500 mb-8">
        Manage student accounts and control access to Reading & Writing sections.
      </p>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Level
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Answers
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Quizzes
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Accuracy
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                Reading Access
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                Writing Access
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                  No students registered yet.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const accuracy =
                  student._count.quizResults > 0
                    ? Math.round(
                        (student.quizResults.length /
                          student._count.quizResults) *
                          100
                      )
                    : 0;
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-primary-100 text-primary-700">
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {student._count.studentAnswers}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {student._count.quizResults}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {accuracy}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PermissionToggles
                        studentId={student.id}
                        field="canAccessReading"
                        initialValue={student.canAccessReading}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PermissionToggles
                        studentId={student.id}
                        field="canAccessWriting"
                        initialValue={student.canAccessWriting}
                      />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
