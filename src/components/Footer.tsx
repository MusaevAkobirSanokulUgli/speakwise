import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
                  <circle cx="9" cy="10" r="1.5" fill="white" />
                  <circle cx="15" cy="10" r="1.5" fill="white" />
                  <path d="M9 13.5q3 1.5 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <rect x="2" y="4" width="20" height="14" rx="4" stroke="white" strokeWidth="1.8" fill="none" />
                </svg>
              </div>
              <span className="text-lg font-bold gradient-text">SpeakWise</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              SpeakWise — Improve Your English Speaking Skills. Learn, practice, and grow with structured lessons and interactive quizzes.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Levels", href: "/levels" },
                { label: "Materials", href: "/materials" },
                { label: "Progress", href: "/progress" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            &copy; {year} SpeakWise. All rights reserved.
          </p>
          <p className="text-sm text-slate-400">
            Built to help you speak with confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}
