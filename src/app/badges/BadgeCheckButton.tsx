"use client";

import { useState } from "react";

export default function BadgeCheckButton() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleCheck() {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch("/api/badges/check", { method: "POST" });
      const data = (await res.json()) as { awarded?: string[] };
      if (data.awarded && data.awarded.length > 0) {
        setResult(`New badges earned: ${data.awarded.join(", ")}!`);
      } else {
        setResult("No new badges yet. Keep learning!");
      }
    } catch {
      setResult("Failed to check badges.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-sm text-indigo-600 font-medium">{result}</span>
      )}
      <button
        onClick={handleCheck}
        disabled={checking}
        className="btn-secondary text-sm disabled:opacity-50"
      >
        {checking ? "Checking..." : "Check for New Badges"}
      </button>
    </div>
  );
}
