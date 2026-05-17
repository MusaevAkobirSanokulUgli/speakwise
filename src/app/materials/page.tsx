import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function MaterialsPage() {
  const user = await getSession();

  const materials = await prisma.speakingMaterial.findMany({
    orderBy: { order: "asc" },
  });

  const categories = [
    { key: "linking_words", label: "Linking Words", icon: "🔗", color: "bg-blue-50 border-blue-200" },
    { key: "templates", label: "Answer Templates", icon: "📋", color: "bg-green-50 border-green-200" },
    { key: "structures", label: "Answer Structures", icon: "🏗️", color: "bg-purple-50 border-purple-200" },
    { key: "tips", label: "Speaking Tips", icon: "💡", color: "bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Speaking <span className="gradient-text">Materials</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Essential resources to help you structure your answers, use linking words effectively, and improve your speaking skills.
          </p>
        </div>

        {categories.map((cat) => {
          const catMaterials = materials.filter((m) => m.category === cat.key);
          if (catMaterials.length === 0) return null;

          return (
            <div key={cat.key} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.label}
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {catMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className={`card p-6 border-2 ${cat.color}`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">
                      {mat.title}
                    </h3>
                    {mat.levelRange && (
                      <span className="text-xs text-gray-500 mb-3 inline-block">
                        Level: {mat.levelRange}
                      </span>
                    )}
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                      {mat.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {materials.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg">No materials available yet.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/levels" className="btn-primary">
            Start Practicing &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
