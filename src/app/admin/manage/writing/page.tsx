"use client";

import { useState, useEffect, useCallback } from "react";

interface Level { id: string; name: string; }
interface Topic { id: string; name: string; }
interface WritingItem {
  id: string;
  title: string;
  instructions: string;
  type: string;
  wordCountMin: number;
  wordCountMax: number;
  examType: string;
  ageGroup: string;
  tips: string | null;
  level: { id: string; name: string };
  topic: { id: string; name: string };
}

const EMPTY_FORM = {
  title: "",
  instructions: "",
  type: "essay",
  sampleAnswer: "",
  tips: "",
  wordCountMin: 150,
  wordCountMax: 250,
  examType: "general",
  ageGroup: "all",
  levelId: "",
  topicId: "",
};

const TYPE_COLORS: Record<string, string> = {
  essay: "bg-blue-50 text-blue-700",
  letter: "bg-purple-50 text-purple-700",
  report: "bg-amber-50 text-amber-700",
  description: "bg-green-50 text-green-700",
};

export default function WritingManagePage() {
  const [items, setItems] = useState<WritingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterType, setFilterType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WritingItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const LIMIT = 20;

  const fetchMeta = useCallback(async () => {
    const [lvRes, tpRes] = await Promise.all([
      fetch("/api/admin/levels"),
      fetch("/api/admin/topics?limit=100"),
    ]);
    setLevels((await lvRes.json()).items ?? []);
    setTopics((await tpRes.json()).items ?? []);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(search ? { search } : {}),
      ...(filterLevel ? { levelId: filterLevel } : {}),
      ...(filterTopic ? { topicId: filterTopic } : {}),
      ...(filterExam ? { examType: filterExam } : {}),
      ...(filterType ? { type: filterType } : {}),
    });
    const res = await fetch(`/api/admin/writing?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterLevel, filterTopic, filterExam, filterType]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: WritingItem) {
    setEditing(item);
    setForm({
      title: item.title,
      instructions: item.instructions,
      type: item.type,
      sampleAnswer: "",
      tips: item.tips ?? "",
      wordCountMin: item.wordCountMin,
      wordCountMax: item.wordCountMax,
      examType: item.examType,
      ageGroup: item.ageGroup,
      levelId: item.level.id,
      topicId: item.topic.id,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim() || !form.instructions.trim() || !form.levelId || !form.topicId) {
      setError("Title, instructions, level, and topic are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/writing/${editing.id}` : "/api/admin/writing",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            sampleAnswer: form.sampleAnswer || null,
            tips: form.tips || null,
            wordCountMin: Number(form.wordCountMin),
            wordCountMax: Number(form.wordCountMax),
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
    if ((await fetch(`/api/admin/writing/${id}`, { method: "DELETE" })).ok) {
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
          <h1 className="text-2xl font-bold text-slate-900">Writing Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total tasks</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Task</button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="input" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="essay">Essay</option>
            <option value="letter">Letter</option>
            <option value="report">Report</option>
            <option value="description">Description</option>
          </select>
          <select className="input" value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}>
            <option value="">All Levels</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select className="input" value={filterTopic} onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}>
            <option value="">All Topics</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="input" value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
            <option value="">All Exam Types</option>
            <option value="general">General</option>
            <option value="ielts">IELTS</option>
            <option value="toefl">TOEFL</option>
            <option value="toeic">TOEIC</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">✍️</span>
            <p className="font-medium">No writing tasks found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new task.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Word Count</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.instructions}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${TYPE_COLORS[item.type] ?? "bg-slate-100 text-slate-600"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.wordCountMin}–{item.wordCountMax}</td>
                    <td className="px-4 py-3"><span className="badge bg-indigo-50 text-indigo-700">{item.level.name}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.topic.name}</td>
                    <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{item.examType}</span></td>
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
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Writing Task" : "Add Writing Task"}</h2>
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
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write about climate change" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instructions *</label>
                  <textarea className="input resize-none" rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Detailed writing instructions..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tips</label>
                  <textarea className="input resize-none" rows={2} value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} placeholder="Optional tips for students..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sample Answer</label>
                  <textarea className="input resize-none" rows={3} value={form.sampleAnswer} onChange={(e) => setForm({ ...form, sampleAnswer: e.target.value })} placeholder="Optional sample answer..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="essay">Essay</option>
                    <option value="letter">Letter</option>
                    <option value="report">Report</option>
                    <option value="description">Description</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
                  <select className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    <option value="general">General</option>
                    <option value="ielts">IELTS</option>
                    <option value="toefl">TOEFL</option>
                    <option value="toeic">TOEIC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Words</label>
                  <input type="number" className="input" min={1} value={form.wordCountMin} onChange={(e) => setForm({ ...form, wordCountMin: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Words</label>
                  <input type="number" className="input" min={1} value={form.wordCountMax} onChange={(e) => setForm({ ...form, wordCountMax: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Level *</label>
                  <select className="input" value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value })}>
                    <option value="">Select level</option>
                    {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Topic *</label>
                  <select className="input" value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
                    <option value="">Select topic</option>
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age Group</label>
                  <select className="input" value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}>
                    <option value="all">All</option>
                    <option value="child">Child</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Writing Task</h2>
            <p className="text-sm text-slate-600 mb-6">This action cannot be undone. The writing task will be permanently deleted.</p>
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
