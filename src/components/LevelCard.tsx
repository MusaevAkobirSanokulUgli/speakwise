import Link from "next/link";

interface LevelCardProps {
  name: string;
  slug: string;
  description: string;
  color: string;
  order: number;
  topicCount: number;
}

// Map level color strings to Tailwind-compatible inline styles
// Using inline styles so arbitrary colors work without purging issues
function getBorderColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: "#10B981",
    blue: "#3B82F6",
    indigo: "#6366F1",
    purple: "#8B5CF6",
    orange: "#F97316",
    red: "#EF4444",
    yellow: "#EAB308",
    teal: "#14B8A6",
    pink: "#EC4899",
    cyan: "#06B6D4",
  };
  // If the color looks like a hex or CSS value, use it directly
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  return colorMap[color.toLowerCase()] ?? "#6366F1";
}

function getBgColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: "#F0FDF4",
    blue: "#EFF6FF",
    indigo: "#EEF2FF",
    purple: "#F5F3FF",
    orange: "#FFF7ED",
    red: "#FEF2F2",
    yellow: "#FEFCE8",
    teal: "#F0FDFA",
    pink: "#FDF2F8",
    cyan: "#ECFEFF",
  };
  if (color.startsWith("#") || color.startsWith("rgb")) return color + "15";
  return colorMap[color.toLowerCase()] ?? "#EEF2FF";
}

function getTextColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: "#059669",
    blue: "#2563EB",
    indigo: "#4F46E5",
    purple: "#7C3AED",
    orange: "#EA580C",
    red: "#DC2626",
    yellow: "#CA8A04",
    teal: "#0D9488",
    pink: "#DB2777",
    cyan: "#0891B2",
  };
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  return colorMap[color.toLowerCase()] ?? "#4F46E5";
}

export default function LevelCard({
  name,
  slug,
  description,
  color,
  order,
  topicCount,
}: LevelCardProps) {
  const borderColor = getBorderColor(color);
  const bgColor = getBgColor(color);
  const textColor = getTextColor(color);

  return (
    <Link href={`/levels/${slug}`} className="block group" aria-label={`Go to ${name} level`}>
      <div
        className="card relative overflow-hidden cursor-pointer"
        style={{ borderLeft: `4px solid ${borderColor}` }}
      >
        {/* Order badge */}
        <div
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {order}
        </div>

        {/* Level label */}
        <div className="mb-3">
          <span
            className="badge text-xs"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            Level {order}
          </span>
        </div>

        {/* Name */}
        <h3
          className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity"
          style={{ color: textColor }}
        >
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>
              <strong className="font-semibold text-slate-700">{topicCount}</strong>{" "}
              {topicCount === 1 ? "topic" : "topics"}
            </span>
          </div>

          <div
            className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
            style={{ color: textColor }}
          >
            <span>Explore</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
