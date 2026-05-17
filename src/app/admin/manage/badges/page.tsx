"use client";

import { useState, useEffect, useCallback } from "react";

interface BadgeItem {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  nameKo: string;
  description: string;
  descUz: string;
  descRu: string;
  descKo: string;
  icon: string;
  criteria: string;
  category: string;
  _count: { userBadges: number };
}

const EMPTY_FORM = {
  name: "",
  nameUz: "",
  nameRu: "",
  nameKo: "",
  description: "",
  descUz: "",
  descRu: "",
  descKo: "",
  icon: "",
  criteria: "",
  category: "achievement",
};

const CATEGORIES = ["achievement", "streak", "level", "social", "competition", "special", "quiz", "speaking", "reading", "writing"];

const CATEGORY_COLORS: Record<string, string> = {
  achievement: "bg-amber-50 text-amber-700",
  streak: "bg-orange-50 text-orange-700",
  level: "bg-indigo-50 text-indigo-700",
  social: "bg-green-50 text-green-700",
  competition: "bg-blue-50 text-blue-700",
  special: "bg-purple-50 text-purple-700",
  quiz: "bg-cyan-50 text-cyan-700",
  speaking: "bg-teal-50 text-teal-700",
  reading: "bg-emerald-50 text-emerald-700",
  writing: "bg-rose-50 text-rose-700",
};

export default function BadgesManagePage() {
  const [items, setItems] = useState<BadgeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BadgeItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const LIMIT = 24;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(search ? { search } : {}),
      ...(filterCategory ? { category: filterCategory } : {}),
    });
    const res = await fetch(`/api/admin/badges?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setError(""); setModalOpen(true); }

  function openEdit(item: BadgeItem) {
    setEditing(item);
    setForm({
      name: item.name,
      nameUz: item.nameUz ?? "",
      nameRu: item.nameRu ?? "",
      nameKo: item.nameKo ?? "",
      description: item.description,
      descUz: item.descUz ?? "",
      descRu: item.descRu ?? "",
      descKo: item.descKo ?? "",
      icon: item.icon,
      criteria: item.criteria,
      category: item.category,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.description.trim() || !form.icon.trim() || !form.criteria.trim()) {
      setError("Name, description, icon, and criteria are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/badges/${editing.id}` : "/api/admin/badges",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
    if ((await fetch(`/api/admin/badges/${id}`, { method: "DELETE" })).ok) {
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
          <h1 className="text-2xl font-bold text-slate-900">Badges</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total badges</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Table
            </button>
          </div>
          <button className="btn-primary" onClick={openCreate}>+ Add Badge</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Search badges..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="input" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="text-sm text-slate-500 flex items-center">
            Showing {items.length} of {total}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
          <span className="text-4xl mb-3">🎖️</span>
          <p className="font-medium">No badges found</p>
          <p className="text-sm mt-1">Create your first badge to reward learners.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid / Card View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-static flex flex-col items-center text-center p-4 hover:shadow-md transition-shadow group"
            >
              <div className="text-4xl mb-2 leading-none">{item.icon}</div>
              <p className="font-semibold text-slate-800 text-sm truncate w-full">{item.name}</p>
              <span className={`badge mt-1.5 text-xs capitalize ${CATEGORY_COLORS[item.category] ?? "bg-slate-100 text-slate-600"}`}>
                {item.category}
              </span>
              <p className="text-xs text-slate-400 mt-1">{item._count.userBadges} earned</p>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-0.5 rounded hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Badge</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Criteria</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Earned By</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${CATEGORY_COLORS[item.category] ?? "bg-slate-100 text-slate-600"}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                      <p className="truncate">{item.criteria}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{item._count.userBadges} users</td>
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-slate-500">Page {page} of {totalPages} &mdash; {total} results</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="btn-secondary text-xs px-3 py-1.5" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Badge" : "Add Badge"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              {/* Preview */}
              {form.icon && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-4xl">{form.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{form.name || "Badge Name"}</p>
                    <span className={`badge text-xs capitalize ${CATEGORY_COLORS[form.category] ?? "bg-slate-100 text-slate-600"}`}>{form.category}</span>
                  </div>
                </div>
              )}

              {/* Icon & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Icon (emoji) *</label>
                  <input className="input text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🏆" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Criteria *</label>
                  <input className="input" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} placeholder="e.g. Complete 10 lessons in a row" />
                </div>
              </div>

              {/* Names */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Names</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">English *</label>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Badge name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Uzbek</label>
                    <input className="input" value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} placeholder="Nomi (UZ)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Russian</label>
                    <input className="input" value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} placeholder="Название (RU)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Korean</label>
                    <input className="input" value={form.nameKo} onChange={(e) => setForm({ ...form, nameKo: e.target.value })} placeholder="이름 (KO)" />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descriptions</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">English *</label>
                    <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this badge represents" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Uzbek</label>
                    <textarea className="input resize-none" rows={2} value={form.descUz} onChange={(e) => setForm({ ...form, descUz: e.target.value })} placeholder="Tavsif (UZ)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Russian</label>
                    <textarea className="input resize-none" rows={2} value={form.descRu} onChange={(e) => setForm({ ...form, descRu: e.target.value })} placeholder="Описание (RU)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Korean</label>
                    <textarea className="input resize-none" rows={2} value={form.descKo} onChange={(e) => setForm({ ...form, descKo: e.target.value })} placeholder="설명 (KO)" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Badge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Badge</h2>
            <p className="text-sm text-slate-600 mb-6">
              This will remove the badge from all users who earned it. This action cannot be undone.
            </p>
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
