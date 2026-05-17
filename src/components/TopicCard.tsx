import Link from "next/link";

interface TopicCardProps {
  name: string;
  slug: string;
  icon: string;
  description: string;
  levelSlug: string;
  vocabCount: number;
  quizCount: number;
  questionCount: number;
}

interface StatPillProps {
  label: string;
  count: number;
  icon: React.ReactNode;
}

function StatPill({ label, count, icon }: StatPillProps) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-semibold text-slate-700">{count}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function TopicCard({
  name,
  slug,
  icon,
  description,
  levelSlug,
  vocabCount,
  quizCount,
  questionCount,
}: TopicCardProps) {
  return (
    <Link
      href={`/levels/${levelSlug}/${slug}`}
      className="block group"
      aria-label={`Go to topic: ${name}`}
    >
      <div className="card h-full flex flex-col">
        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
              {name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          <StatPill
            label="vocab"
            count={vocabCount}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatPill
            label="quizzes"
            count={quizCount}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatPill
            label="questions"
            count={questionCount}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* CTA */}
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:gap-2 transition-all">
          <span>Start learning</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
