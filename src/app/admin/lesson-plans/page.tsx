import { prisma } from "@/lib/prisma";

export default async function LessonPlansPage() {
  const plans = await prisma.lessonPlan.findMany({
    include: { topic: true },
    orderBy: { topic: { order: "asc" } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Speaking Club Lesson Plans
        </h1>
        <p className="text-gray-500 mt-1">
          Complete 2-hour lesson plans for speaking club sessions
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          No lesson plans available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan, idx) => {
            const objectives = JSON.parse(plan.objectives) as string[];
            const materials = JSON.parse(plan.materials) as string[];

            return (
              <details
                key={plan.id}
                className="card overflow-hidden group"
              >
                <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {plan.topic.icon} {plan.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {plan.topic.name} &middot; {plan.duration}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      &#9660;
                    </span>
                  </div>
                </summary>

                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  {/* Objectives */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-1">
                      {objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">&#10003;</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Materials Needed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {materials.map((mat, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lesson Flow */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-bold text-amber-800 text-sm mb-2">
                        Warm Up (15 min)
                      </h4>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        {plan.warmUp}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 text-sm mb-2">
                        Main Activity (45 min)
                      </h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {plan.mainActivity}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 text-sm mb-2">
                        Practice (40 min)
                      </h4>
                      <p className="text-sm text-green-700 leading-relaxed">
                        {plan.practice}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-bold text-purple-800 text-sm mb-2">
                        Cool Down (20 min)
                      </h4>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        {plan.coolDown}
                      </p>
                    </div>
                  </div>

                  {plan.homework && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-700 text-sm mb-1">
                        Homework
                      </h4>
                      <p className="text-sm text-gray-600">{plan.homework}</p>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
