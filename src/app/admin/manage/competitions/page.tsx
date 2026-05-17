"use client";

import { useState, useEffect, useCallback } from "react";

interface CompetitionItem {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  prize: string | null;
  _count: { entries: number };
}

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "monthly",
  startDate: "",
  endDate: "",
  isActive: true,
  prize: "",
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function toDateInput(iso: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}

function getStatus(item: CompetitionItem) {
  const now = new Date();
  const start = new Date(item.startDate);
  const end = new Date(item.endDate);
  if (!item.isActive) return { label: "Inactive", cls: "bg-slate-100 text-slate-500" };
  if (now < start) return { label: "Upcoming", cls: "bg-blue-50 text-blue-700" };
  if (now > end) return { label: "Ended", cls: "bg-red-50 text-red-600" };
  return { label: "Active", cls: "bg-green-50 text-green-700" };
}

export default function CompetitionsManagePage() {
  const [items, setItems] = useState<CompetitionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompetitionItem | null>(null);
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
      ...(filterActive !== "" ? { isActive: filterActive } : {}),
    });
    const res = await fetch(`/api/admin/competitions?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterActive]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setError(""); setModalOpen(true); }

  function openEdit(item: CompetitionItem) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      isActive: item.isActive,
      prize: item.prize ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.endDate) {
      setError("Title, description, start date, and end date are required.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("End date must be after start date.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/competitions/${editing.id}` : "/api/admin/competitions",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, prize: form.prize || null }),
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
    if ((await fetch(`/api/admin/competitions/${id}`, { method: "DELETE" })).ok) {
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
          <h1 className="text-2xl font-bold text-slate-900">Competitions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total competitions</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Competition</button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Search competitions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="input" value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div className="text-sm text-slate-500 flex items-center">
            Showing {items.length} of {total}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">🏆</span>
            <p className="font-medium">No competitions found</p>
            <p className="text-sm mt-1">Create your first competition to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Entries</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Prize</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-indigo-50 text-indigo-700 capitalize">{item.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <p>{formatDate(item.startDate)}</p>
                        <p className="text-slate-400">to {formatDate(item.endDate)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-slate-100 text-slate-600">{item._count.entries}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-[120px]">
                        {item.prize
                          ? <span className="text-amber-600 truncate block">{item.prize}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(item)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                          <button onClick={() => setDeleteId(item.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Competition" : "Add Competition"}</h2>
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
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. March Writing Championship" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this competition is about" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prize</label>
                  <input className="input" value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} placeholder="e.g. Gift card, certificate" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
                  <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date *</label>
                  <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="col-span-2 flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Active (visible to students)
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Competition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Competition</h2>
            <p className="text-sm text-slate-600 mb-6">
              This will also delete all competition entries. This action cannot be undone.
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
