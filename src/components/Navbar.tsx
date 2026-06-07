"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

interface NavUser {
  name: string;
  role?: string;
}

interface NavbarProps {
  user?: NavUser | null;
}

const NAV_KEYS = [
  { key: "levels", href: "/levels" },
  { key: "leaderboard", href: "/leaderboard" },
  { key: "competitions", href: "/competitions" },
  { key: "resources", href: "/resources" },
  { key: "progress", href: "/progress" },
] as const;

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  // Map nav keys to translated labels (leaderboard/competitions/resources use their own namespace fallback to nav)
  function navLabel(key: string): string {
    // Try nav namespace first, which has levels, progress
    const navTranslation = t("nav", key);
    if (navTranslation !== key) return navTranslation;
    // Fallback: leaderboard namespace for "leaderboard", etc.
    if (key === "leaderboard") return t("leaderboard", "leaderboard");
    if (key === "competitions") return t("admin", "competitions");
    if (key === "resources") return t("admin", "resources");
    return key;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isAdmin = user?.role === "admin" || user?.role === "teacher";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="SpeakWise Home"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                aria-hidden="true"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="currentColor"
                />
                <path
                  d="M8 10.5C8 9.12 9.12 8 10.5 8S13 9.12 13 10.5 11.88 13 10.5 13 8 11.88 8 10.5z"
                  fill="none"
                />
                <path
                  d="M7 15s1-2 5-2 5 2 5 2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="10" r="1.5" fill="white" />
                <circle cx="15" cy="10" r="1.5" fill="white" />
                <path
                  d="M9 13.5q3 1.5 6 0"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">SpeakWise</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_KEYS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(href)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {navLabel(key)}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-50 text-amber-600"
                    : "text-amber-600 hover:bg-amber-50"
                }`}
              >
                {t("nav", "adminPanel")}
              </Link>
            )}
          </div>

          {/* Desktop user area */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-indigo-700 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-xs px-3 py-2 active:scale-[0.97]"
                >
                  {t("nav", "logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-xs px-4 py-2 active:scale-[0.97]">
                  {t("nav", "login")}
                </Link>
                <Link href="/register" className="btn-primary text-xs px-4 py-2 active:scale-[0.97]">
                  {t("nav", "signUp")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.95]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {NAV_KEYS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                  isActive(href)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {navLabel(key)}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all active:scale-[0.98]"
              >
                {t("nav", "adminPanel")}
              </Link>
            )}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <div className="mb-3 px-1">
                <LanguageSwitcher />
              </div>
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="btn-secondary text-xs px-3 py-2 active:scale-[0.97]"
                  >
                    {t("nav", "logout")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn-secondary flex-1 text-center text-sm active:scale-[0.97]"
                  >
                    {t("nav", "login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary flex-1 text-center text-sm active:scale-[0.97]"
                  >
                    {t("nav", "signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
