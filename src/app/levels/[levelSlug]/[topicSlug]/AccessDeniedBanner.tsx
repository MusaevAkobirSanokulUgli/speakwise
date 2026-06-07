"use client";

import { useRouter } from "next/navigation";

export default function AccessDeniedBanner({ type }: { type: string }) {
  const router = useRouter();
  const label = type === "reading" ? "Reading" : "Writing";

  return (
    <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
      <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">
          {label} access is restricted
        </p>
        <p className="text-xs text-amber-600">
          Your teacher or admin has not yet granted you access to the {label} section.
          Contact your teacher to request access.
        </p>
      </div>
      <button
        onClick={() => router.replace(window.location.pathname)}
        className="text-amber-500 hover:text-amber-700"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
