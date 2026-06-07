"use client";

import { useState } from "react";

interface Props {
  studentId: string;
  field: "canAccessReading" | "canAccessWriting";
  initialValue: boolean;
}

export default function PermissionToggles({ studentId, field, initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const newValue = !enabled;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) {
        setEnabled(newValue);
      }
    } catch {
      // revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled ? "bg-indigo-600" : "bg-gray-300"
      } ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      role="switch"
      aria-checked={enabled}
      aria-label={`Toggle ${field === "canAccessReading" ? "reading" : "writing"} access`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
