import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            SpeakWise
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium hidden sm:block"
                >
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 mb-6 border border-white/20">
              Speaking &bull; Reading &bull; Writing &bull; IELTS &bull; TOEIC &bull; CEFR
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-balance">
              Master English Skills
              <br />
              <span className="text-accent-300">From Beginner to IELTS</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Build vocabulary, practice speaking, improve reading and writing — get feedback from your teacher. Available in English, O&apos;zbek, Русский, 한국어.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-accent-500/30"
              >
                Start Learning Free
              </Link>
              <Link
                href="/levels"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition-all backdrop-blur-sm border border-white/20"
              >
                Explore Levels
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "7", label: "Levels (A1-IELTS)" },
              { value: "25+", label: "Topics" },
              { value: "3,000+", label: "Vocabulary Words" },
              { value: "4", label: "Languages" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Three Core Skills, <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Develop all the English skills you need for exams and real-life communication.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🗣️",
                title: "Speaking",
                desc: "Practice with 2,000+ questions. Get answer templates, linking words, and teacher feedback. Prepare for IELTS Speaking Parts 1-3.",
                color: "from-purple-500 to-indigo-600",
              },
              {
                icon: "📖",
                title: "Reading",
                desc: "Read engaging passages at every level. Answer comprehension questions, build vocabulary, and prepare for reading exams.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: "✍️",
                title: "Writing",
                desc: "Practice essays, letters, and reports. Get word count tracking, sample answers, and detailed teacher feedback.",
                color: "from-emerald-500 to-teal-600",
              },
            ].map((skill) => (
              <div key={skill.title} className="card p-8 text-center group">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform`}
                >
                  {skill.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{skill.title}</h3>
                <p className="text-gray-500 leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📚", title: "Rich Vocabulary", desc: "3,000+ words with images, translations in Uzbek, Russian, and Korean. Level-appropriate from A1 to C2." },
              { icon: "📝", title: "Interactive Quizzes", desc: "Multiple choice, gap filling, sentence building, and word matching. Track your accuracy and improve." },
              { icon: "💬", title: "Discussion Topics", desc: "Practice conversations with structured prompts for speaking clubs and partner practice." },
              { icon: "🏆", title: "Competitions & Leaderboard", desc: "Join monthly challenges, earn badges, and compete with other students on the leaderboard." },
              { icon: "👩‍🏫", title: "Teacher Feedback", desc: "Submit speaking and writing answers. Get personalized scores and detailed feedback." },
              { icon: "🎯", title: "Multi-Exam Prep", desc: "Prepare for IELTS, TOEIC, TESOL, and CEFR exams with targeted vocabulary and practice materials." },
              { icon: "👶", title: "All Ages Welcome", desc: "From kindergarten-age learners to adults — age-appropriate materials with fun images and activities." },
              { icon: "📊", title: "Performance Analytics", desc: "Track your progress with detailed statistics. See where you're improving and what needs more work." },
              { icon: "🌐", title: "4 Languages", desc: "Interface and translations in English, O'zbek tili, Русский, and 한국어 for better understanding." },
            ].map((f, i) => (
              <div
                key={i}
                className="card p-8 hover:border-primary-200 border-2 border-transparent"
              >
                <span className="text-4xl block mb-4">{f.icon}</span>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Preview */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Choose Your <span className="gradient-text">Level</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: "Beginner (A1)", color: "#22C55E", slug: "beginner" },
              { name: "Elementary (A2)", color: "#3B82F6", slug: "elementary" },
              { name: "Pre-Intermediate (B1)", color: "#8B5CF6", slug: "pre-intermediate" },
              { name: "Intermediate (B2)", color: "#F59E0B", slug: "intermediate" },
              { name: "Upper-Intermediate (C1)", color: "#EF4444", slug: "upper-intermediate" },
              { name: "Advanced (C2)", color: "#EC4899", slug: "advanced" },
              { name: "IELTS", color: "#14B8A6", slug: "ielts" },
            ].map((level) => (
              <Link
                key={level.slug}
                href={`/levels/${level.slug}`}
                className="card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
              >
                <div
                  className="w-3 h-12 rounded-full flex-shrink-0"
                  style={{ background: level.color }}
                />
                <div>
                  <h3 className="font-bold text-gray-900">{level.name}</h3>
                  <p className="text-xs text-gray-500">25 Topics</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            25+ Engaging <span className="gradient-text">Topics</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-lg mx-auto">
            From Travel to Technology — learn vocabulary and practice on topics that matter.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              "✈️ Travel", "🍳 Cooking", "👨‍👩‍👧‍👦 Family", "📖 Education",
              "💪 Health", "💻 Technology", "🌿 Environment", "💼 Career",
              "🎨 Hobbies", "⚽ Sports", "🛍️ Shopping", "🎵 Music",
              "🏛️ Culture", "🏠 Home", "🚗 Transport", "🌤️ Weather",
              "🐾 Animals", "🎭 Art", "💰 Finance", "📱 Social Media",
              "📚 Books", "🎬 Movies", "🎉 Celebrations", "🏙️ City Life",
              "🌟 Dreams",
            ].map((t) => (
              <span
                key={t}
                className="px-5 py-2.5 bg-primary-50 text-primary-700 rounded-full font-medium text-sm hover:bg-primary-100 transition-colors cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Prep */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            Prepare for <span className="gradient-text">Any Exam</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "IELTS", desc: "Academic & General Training", color: "bg-red-50 border-red-200 text-red-700" },
              { name: "TOEIC", desc: "Business English Test", color: "bg-blue-50 border-blue-200 text-blue-700" },
              { name: "TESOL", desc: "Teaching English", color: "bg-green-50 border-green-200 text-green-700" },
              { name: "CEFR", desc: "European Framework A1-C2", color: "bg-purple-50 border-purple-200 text-purple-700" },
            ].map((exam) => (
              <div
                key={exam.name}
                className={`card p-6 border-2 ${exam.color} text-center`}
              >
                <h3 className="text-2xl font-extrabold mb-1">{exam.name}</h3>
                <p className="text-sm opacity-75">{exam.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Improve Your English?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of students improving their English every day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-accent-500/30"
          >
            Get Started Now — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-xl font-bold text-white mb-2">SpeakWise</p>
              <p className="text-sm leading-relaxed">
                Improve your English speaking, reading, and writing skills — from Beginner to IELTS.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-3">Learn</p>
              <div className="space-y-2 text-sm">
                <Link href="/levels" className="block hover:text-white transition-colors">Levels & Topics</Link>
                <Link href="/materials" className="block hover:text-white transition-colors">Speaking Materials</Link>
                <Link href="/resources" className="block hover:text-white transition-colors">Resources & Books</Link>
                <Link href="/leaderboard" className="block hover:text-white transition-colors">Leaderboard</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-3">Exams</p>
              <div className="space-y-2 text-sm">
                <span className="block">IELTS Preparation</span>
                <span className="block">TOEIC Preparation</span>
                <span className="block">CEFR Levels</span>
                <span className="block">TESOL Resources</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} SpeakWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
