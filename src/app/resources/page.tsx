import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

const STATIC_RESOURCES = [
  // IELTS Prep
  {
    id: "s1",
    title: "IELTS Official Practice Materials",
    description:
      "Free practice tests and sample papers directly from Cambridge English, the official IELTS provider.",
    type: "website",
    url: "https://www.ielts.org/study-and-prepare",
    category: "ielts",
    examType: "ielts",
    thumbnail: null,
  },
  {
    id: "s2",
    title: "IELTS Liz – Free Lessons & Tips",
    description:
      "One of the most trusted free IELTS resources. Covers all four skills with video lessons and sample answers.",
    type: "website",
    url: "https://ieltsliz.com",
    category: "ielts",
    examType: "ielts",
    thumbnail: null,
  },
  {
    id: "s3",
    title: "Cambridge IELTS Books (Archive)",
    description:
      "Download Cambridge IELTS practice books 1–17 for authentic exam preparation.",
    type: "pdf",
    url: "https://www.cambridgeenglish.org/exams-and-tests/ielts/",
    category: "ielts",
    examType: "ielts",
    thumbnail: null,
  },
  // TOEIC Prep
  {
    id: "s4",
    title: "ETS TOEIC Official Guide",
    description:
      "The official TOEIC Learning and Certification System with practice tests and score reports.",
    type: "website",
    url: "https://www.ets.org/toeic",
    category: "toeic",
    examType: "toeic",
    thumbnail: null,
  },
  {
    id: "s5",
    title: "TOEIC Test-Taking Strategies",
    description:
      "Comprehensive guide to TOEIC Listening & Reading Part 5–7 with 1000+ practice questions.",
    type: "pdf",
    url: "https://www.ets.org/toeic/test-takers/listening-reading/about/",
    category: "toeic",
    examType: "toeic",
    thumbnail: null,
  },
  // YouTube Channels
  {
    id: "s6",
    title: "IELTS Advantage – YouTube",
    description:
      "Top-rated YouTube channel with IELTS writing, speaking, reading & listening lessons.",
    type: "youtube",
    url: "https://www.youtube.com/@IELTSAdvantage",
    category: "youtube",
    examType: "ielts",
    thumbnail: null,
  },
  {
    id: "s7",
    title: "E2 IELTS – YouTube",
    description:
      "Daily IELTS lessons covering all sections. Great for beginners and advanced learners.",
    type: "youtube",
    url: "https://www.youtube.com/@E2IELTS",
    category: "youtube",
    examType: "ielts",
    thumbnail: null,
  },
  {
    id: "s8",
    title: "English with Lucy – YouTube",
    description:
      "British English vocabulary, grammar, and pronunciation lessons for all levels.",
    type: "youtube",
    url: "https://www.youtube.com/@EnglishWithLucy",
    category: "youtube",
    examType: "general",
    thumbnail: null,
  },
  {
    id: "s9",
    title: "VOA Learning English – YouTube",
    description:
      "Voice of America's English learning channel. News, stories, and lessons in slow, clear English.",
    type: "youtube",
    url: "https://www.youtube.com/@VOALearningEnglish",
    category: "youtube",
    examType: "general",
    thumbnail: null,
  },
  // Free Books / PDFs
  {
    id: "s10",
    title: "Oxford Word Skills (Basic to Advanced)",
    description:
      "Essential vocabulary building series from Oxford. Covers 2000+ must-know words.",
    type: "pdf",
    url: "https://www.oxfordlearnersbookshelf.com/",
    category: "books",
    examType: "general",
    thumbnail: null,
  },
  {
    id: "s11",
    title: "Grammar in Use (Raymond Murphy)",
    description:
      "The world's best-selling grammar series. Available as interactive ebook with exercises.",
    type: "pdf",
    url: "https://www.cambridge.org/gb/cambridgeenglish/catalog/grammar-vocabulary-and-pronunciation/english-grammar-use-5th-edition",
    category: "books",
    examType: "general",
    thumbnail: null,
  },
  // Useful Websites
  {
    id: "s12",
    title: "BBC Learning English",
    description:
      "Free English lessons from the BBC. Includes audio, video, grammar and vocabulary resources.",
    type: "website",
    url: "https://www.bbc.co.uk/learningenglish",
    category: "websites",
    examType: "general",
    thumbnail: null,
  },
  {
    id: "s13",
    title: "British Council LearnEnglish",
    description:
      "Hundreds of free resources for learning English from the British Council.",
    type: "website",
    url: "https://learnenglish.britishcouncil.org",
    category: "websites",
    examType: "general",
    thumbnail: null,
  },
  {
    id: "s14",
    title: "Quizlet – English Vocabulary Sets",
    description:
      "Use Quizlet flashcards to memorize IELTS Academic Word List and TOEIC vocabulary.",
    type: "website",
    url: "https://quizlet.com/subject/english/",
    category: "websites",
    examType: "general",
    thumbnail: null,
  },
];

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  examType: string;
  thumbnail: string | null;
};

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  youtube: { label: "YouTube", color: "bg-red-100 text-red-700 border-red-200", icon: "▶" },
  pdf: { label: "PDF / Book", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "📄" },
  website: { label: "Website", color: "bg-green-100 text-green-700 border-green-200", icon: "🌐" },
  video: { label: "Video", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "🎬" },
  audio: { label: "Audio", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "🎧" },
};

const CATEGORIES = [
  { key: "all", label: "All Resources", icon: "📚" },
  { key: "ielts", label: "IELTS Prep", icon: "🎯" },
  { key: "toeic", label: "TOEIC Prep", icon: "📋" },
  { key: "youtube", label: "YouTube Channels", icon: "▶️" },
  { key: "books", label: "Books & PDFs", icon: "📖" },
  { key: "websites", label: "Useful Websites", icon: "🌐" },
];

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const typeInfo = TYPE_LABELS[resource.type] || {
    label: resource.type,
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "🔗",
  };

  const examBadge =
    resource.examType !== "general"
      ? resource.examType.toUpperCase()
      : null;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 flex flex-col gap-3 hover:scale-[1.02] hover:shadow-lg transition-all animate-fade-in group"
    >
      {/* Top badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`badge text-xs border ${typeInfo.color}`}
        >
          {typeInfo.icon} {typeInfo.label}
        </span>
        {examBadge && (
          <span className="badge text-xs bg-indigo-50 text-indigo-600 border border-indigo-200">
            {examBadge}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
        {resource.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed flex-1">
        {resource.description}
      </p>

      {/* Link indicator */}
      <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium mt-auto">
        <span>Open resource</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </a>
  );
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const { category, type } = await searchParams;
  const user = await getSession();

  // Fetch DB resources
  const dbResources = await prisma.resource.findMany({
    orderBy: { order: "asc" },
  });

  // Merge static + DB resources
  const allResources: ResourceItem[] = [
    ...STATIC_RESOURCES,
    ...dbResources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      url: r.url,
      category: r.category,
      examType: r.examType,
      thumbnail: r.thumbnail,
    })),
  ];

  const activeCategory = category || "all";
  const activeType = type || "all";

  const filtered = allResources.filter((r) => {
    const catMatch =
      activeCategory === "all" || r.category === activeCategory;
    const typeMatch = activeType === "all" || r.type === activeType;
    return catMatch && typeMatch;
  });

  const TYPES = [
    { key: "all", label: "All Types" },
    { key: "youtube", label: "YouTube" },
    { key: "website", label: "Websites" },
    { key: "pdf", label: "PDFs & Books" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Learning <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-gray-500">
            Curated collection of IELTS, TOEIC, and English learning resources
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-5 justify-center">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.key}
              href={`/resources?category=${cat.key}${activeType !== "all" ? `&type=${activeType}` : ""}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {cat.icon} {cat.label}
            </a>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {TYPES.map((t) => (
            <a
              key={t.key}
              href={`/resources?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}type=${t.key}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                activeType === t.key
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-5 text-sm text-gray-400">
          Showing {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">
              No resources found for this filter.
            </p>
            <a href="/resources" className="btn-secondary mt-4 inline-block">
              Clear Filters
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
