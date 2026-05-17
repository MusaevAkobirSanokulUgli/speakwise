"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SubItem { label: string; href: string; }
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: SubItem[];
}

const ICON = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: ICON("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"),
  },
  {
    label: "Review Answers",
    href: "/admin/answers",
    icon: ICON("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4"),
  },
  {
    label: "Quiz Results",
    href: "/admin/quizzes",
    icon: ICON("M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"),
  },
  {
    label: "Lesson Plans",
    href: "/admin/lesson-plans",
    icon: ICON("M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"),
  },
  {
    label: "Manage Content",
    href: "/admin/manage",
    icon: ICON("M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"),
    children: [
      { label: "Vocabulary", href: "/admin/manage/vocabulary" },
      { label: "Quizzes", href: "/admin/manage/quizzes" },
      { label: "Questions", href: "/admin/manage/questions" },
      { label: "Reading", href: "/admin/manage/reading" },
      { label: "Writing", href: "/admin/manage/writing" },
    ],
  },
  {
    label: "Competitions",
    href: "/admin/manage/competitions",
    icon: ICON("M8 21h8M12 17v4M17 3H7l-1 9h10L15 3zM6 3C6 3 4 5 4 7a4 4 0 004 4m10-8s2 2 2 4a4 4 0 01-4 4"),
  },
  {
    label: "Badges",
    href: "/admin/manage/badges",
    icon: ICON("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"),
  },
  {
    label: "Resources",
    href: "/admin/manage/resources",
    icon: ICON("M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m6.828-6.829a4 4 0 015.656 0l-4 4a4 4 0 01-5.656-5.656l1.1 1.1"),
  },
  {
    label: "Content Overview",
    href: "/admin/content",
    icon: ICON("M4 6h16M4 10h16M4 14h16M4 18h16"),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const isSubmenuOpen = (item: NavItem): boolean => {
    if (openSubmenus[item.href] !== undefined) return openSubmenus[item.href];
    return item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  };

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Logo / brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
            <circle cx="9" cy="10" r="1.5" fill="white" />
            <circle cx="15" cy="10" r="1.5" fill="white" />
            <path d="M9 13.5q3 1.5 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <rect x="2" y="4" width="20" height="14" rx="4" stroke="white" strokeWidth="1.8" fill="none" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-slate-800 text-sm leading-none block">SpeakWise</span>
            <span className="text-xs text-slate-400 leading-none">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const { label, href, icon, children } = item;
          const active = isActive(href);
          const hasChildren = !!children?.length;
          const submenuOpen = hasChildren && isSubmenuOpen(item);

          return (
            <div key={href}>
              {hasChildren ? (
                <button
                  onClick={() => { if (!collapsed) toggleSubmenu(href); }}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    active || submenuOpen
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <span className={`flex-shrink-0 ${active || submenuOpen ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{label}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className={`w-4 h-4 flex-shrink-0 transition-transform text-slate-400 ${submenuOpen ? "rotate-90" : ""}`}
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={href}
                  onClick={onLinkClick}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <span className={`flex-shrink-0 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {icon}
                  </span>
                  {!collapsed && <span className="flex-1">{label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                  )}
                </Link>
              )}

              {/* Submenu */}
              {hasChildren && submenuOpen && !collapsed && (
                <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l-2 border-indigo-100 pl-3">
                  {children!.map((child) => {
                    const childActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onLinkClick}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          childActive
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${childActive ? "bg-indigo-500" : "bg-slate-300"}`} aria-hidden="true" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: actions */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all w-full ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Back to Site" : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button
          onClick={() => { onLinkClick?.(); handleLogout(); }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all w-full ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all w-full hidden lg:flex ${collapsed ? "justify-center" : ""}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar trigger */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
        <span className="font-semibold text-slate-700 text-sm">Admin Panel</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin sidebar"
      >
        <div className="flex items-center justify-end px-4 pt-4 pb-2">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <SidebarContent onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-100 h-full transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
        aria-label="Admin sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
