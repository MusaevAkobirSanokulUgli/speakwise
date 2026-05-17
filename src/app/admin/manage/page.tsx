import Link from "next/link";

const SECTIONS = [
  {
    title: "Content",
    items: [
      { label: "Vocabulary", href: "/admin/manage/vocabulary", icon: "📚", desc: "Words, definitions, and examples" },
      { label: "Quizzes", href: "/admin/manage/quizzes", icon: "📝", desc: "Multiple-choice and fill-in questions" },
      { label: "Speaking Questions", href: "/admin/manage/questions", icon: "🗣️", desc: "Prompts for speaking practice" },
      { label: "Reading Passages", href: "/admin/manage/reading", icon: "📖", desc: "Texts with comprehension questions" },
      { label: "Writing Tasks", href: "/admin/manage/writing", icon: "✍️", desc: "Essay and writing prompts" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Competitions", href: "/admin/manage/competitions", icon: "🏆", desc: "Monthly and weekly competitions" },
      { label: "Badges", href: "/admin/manage/badges", icon: "🎖️", desc: "Achievement badges and rewards" },
      { label: "Resources", href: "/admin/manage/resources", icon: "🔗", desc: "YouTube links, PDFs, and external materials" },
    ],
  },
];

export default function ManagePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
        <p className="mt-1 text-slate-500">Create, edit, and delete all learning content from one place.</p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card group flex items-start gap-4 hover:border-indigo-200 border border-transparent transition-all"
                >
                  <span className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 ml-auto flex-shrink-0 text-slate-300 group-hover:text-indigo-400 mt-1 transition-colors"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
