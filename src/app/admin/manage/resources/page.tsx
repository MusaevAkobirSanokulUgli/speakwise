"use client";

import { useState, useEffect, useCallback } from "react";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
  examType: string;
  thumbnail: string | null;
  order: number;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "youtube",
  url: "",
  category: "general",
  examType: "general",
  thumbnail: "",
  order: 0,
};

const RESOURCE_TYPES = ["youtube", "pdf", "website", "guide", "article", "audio"];
const CATEGORIES = ["general", "grammar", "vocabulary", "listening", "speaking", "reading", "writing", "exam-prep"];
const EXAM_TYPES = ["general", "ielts", "toefl", "toeic"];

const TYPE_COLORS: Record<string, string> = {
  youtube: "bg-red-50 text-red-700",
  pdf: "bg-orange-50 text-orange-700",
  website: "bg-blue-50 text-blue-700",
  guide: "bg-green-50 text-green-700",
  article: "bg-purple-50 text-purple-700",
  audio: "bg-teal-50 text-teal-700",
};

const TYPE_ICONS: Record<string, string> = {
  youtube: "▶",
  pdf: "📄",
  website: "🌐",
  guide: "📋",
  article: "📰",
  audio: "🔊",
};

function formatCategory(cat: string) {
  return cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ResourcesManagePage() {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const LIMIT = 20;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(search ? { search } : {}),
      ...(filterType ? { type: filterType } : {}),
      ...(filterCategory ? { category: filterCategory } : {}),
      ...(filterExam ? { examType: filterExam } : {}),
    });
    const res = await fetch(`/api/admin/resources?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterType, filterCategory, filterExam]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setError(""); setModalOpen(true); }

  function openEdit(item: ResourceItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url,
      category: item.category,
      examType: item.examType,
      thumbnail: item.thumbnail ?? "",
      order: item.order,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.url.trim()) {
      setError("Title, description, and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/resources/${editing.id}` : "/api/admin/resources",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            thumbnail: form.thumbnail || null,
            order: Number(form.order),
          }),
        }
      );
      if (!res.ok) { setError((await res.json()).error ?? "Save failed"); return; }
      setModalOpen(false);
      setPage(1);
      fetchItems();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if ((await fetch(`/api/admin/resources/${id}`, { method: "DELETE" })).ok) {
      setDeleteId(null);
      fetchItems();
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total resources</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Resource</button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="input" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select className="input" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
          <select className="input" value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
            <option value="">All Exam Types</option>
            {EXAM_TYPES.map((e) => (
              <option key={e} value={e}>{e.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">🔗</span>
            <p className="font-medium">No resources found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new resource.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Resource</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">URL</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-10 h-8 rounded object-cover flex-shrink-0 bg-slate-100"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-10 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-base">
                            {TYPE_ICONS[item.type] ?? "🔗"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${TYPE_COLORS[item.type] ?? "bg-slate-100 text-slate-600"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600">{formatCategory(item.category)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-indigo-50 text-indigo-700 uppercase">{item.examType}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.order}</td>
                    <td className="px-4 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate block max-w-[120px]"
                        title={item.url}
                      >
                        {item.url.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {page} of {totalPages} &mdash; {total} results</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="btn-secondary text-xs px-3 py-1.5" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Resource" : "Add Resource"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. IELTS Writing Band 9 Tips" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the resource..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">URL *</label>
                  <input className="input" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{formatCategory(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
                  <select className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    {EXAM_TYPES.map((e) => (
                      <option key={e} value={e}>{e.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
                  <input type="number" className="input" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Thumbnail URL</label>
                  <input className="input" type="url" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://... (optional)" />
                </div>
                {form.thumbnail && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Preview</p>
                    <img
                      src={form.thumbnail}
                      alt="thumbnail preview"
                      className="h-20 rounded-lg object-cover bg-slate-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Resource</h2>
            <p className="text-sm text-slate-600 mb-6">This action cannot be undone. The resource will be permanently deleted.</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
