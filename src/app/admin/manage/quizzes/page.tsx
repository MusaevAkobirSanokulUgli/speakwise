"use client";

import { useState, useEffect, useCallback } from "react";

interface Level { id: string; name: string; }
interface Topic { id: string; name: string; }
interface QuizItem {
  id: string;
  type: string;
  question: string;
  correctAnswer: string;
  options: string | null;
  examType: string;
  ageGroup: string;
  order: number;
  level: { id: string; name: string };
  topic: { id: string; name: string };
}

const EMPTY_FORM = {
  type: "multiple-choice",
  question: "",
  options: "",
  correctAnswer: "",
  explanation: "",
  order: 0,
  examType: "general",
  ageGroup: "all",
  levelId: "",
  topicId: "",
};

export default function QuizzesManagePage() {
  const [items, setItems] = useState<QuizItem[]>([]);
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
  const [editing, setEditing] = useState<QuizItem | null>(null);
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
      page: String(page), limit: String(LIMIT),
      ...(search ? { search } : {}),
      ...(filterLevel ? { levelId: filterLevel } : {}),
      ...(filterTopic ? { topicId: filterTopic } : {}),
      ...(filterExam ? { examType: filterExam } : {}),
      ...(filterType ? { type: filterType } : {}),
    });
    const res = await fetch(`/api/admin/quizzes?${params}`);
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

  function openEdit(item: QuizItem) {
    setEditing(item);
    setForm({
      type: item.type,
      question: item.question,
      options: item.options ?? "",
      correctAnswer: item.correctAnswer,
      explanation: "",
      order: item.order,
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
    if (!form.type || !form.question.trim() || !form.correctAnswer.trim() || !form.levelId || !form.topicId) {
      setError("Type, question, correct answer, level, and topic are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/quizzes/${editing.id}` : "/api/admin/quizzes",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, options: form.options || null, explanation: form.explanation || null }),
        }
      );
      if (!res.ok) { setError((await res.json()).error ?? "Save failed"); return; }
      setModalOpen(false);
      setPage(1);
      fetchItems();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if ((await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" })).ok) {
      setDeleteId(null);
      fetchItems();
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total quiz questions</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Quiz</button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input className="input" placeholder="Search questions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="input" value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}>
            <option value="">All Levels</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select className="input" value={filterTopic} onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}>
            <option value="">All Topics</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="input" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="fill-in">Fill In</option>
            <option value="true-false">True/False</option>
          </select>
          <select className="input" value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
            <option value="">All Exam Types</option>
            <option value="general">General</option>
            <option value="ielts">IELTS</option>
            <option value="toefl">TOEFL</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">📝</span>
            <p className="font-medium">No quizzes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Question</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Answer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                      <p className="truncate">{item.question}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-50 text-blue-700 capitalize">{item.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px]">
                      <p className="truncate">{item.correctAnswer}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-indigo-50 text-indigo-700">{item.level.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.topic.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Delete</button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Quiz" : "Add Quiz Question"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type *</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="fill-in">Fill In</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Order</label>
                  <input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Question *</label>
                  <textarea className="input resize-none" rows={2} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Quiz question text" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Options (JSON array, for multiple choice)</label>
                  <input className="input font-mono text-xs" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder='["Option A","Option B","Option C","Option D"]' />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Correct Answer *</label>
                  <input className="input" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} placeholder="The correct answer" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation</label>
                  <textarea className="input resize-none" rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Optional explanation" />
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
                  <select className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    <option value="general">General</option>
                    <option value="ielts">IELTS</option>
                    <option value="toefl">TOEFL</option>
                    <option value="toeic">TOEIC</option>
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
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create Quiz"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Quiz Question</h2>
            <p className="text-sm text-slate-600 mb-6">This action cannot be undone.</p>
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
