"use client";

import { useState, useEffect, useCallback } from "react";

interface Level { id: string; name: string; }
interface Topic { id: string; name: string; }
interface ReadingQuestion {
  type: string;
  question: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  order: number;
}
interface PassageItem {
  id: string;
  title: string;
  passage: string;
  wordCount: number;
  examType: string;
  ageGroup: string;
  level: { id: string; name: string };
  topic: { id: string; name: string };
  questions: ReadingQuestion[];
}

const EMPTY_FORM = {
  title: "", passage: "", wordCount: 0, examType: "general", ageGroup: "all", levelId: "", topicId: "",
};
const EMPTY_Q: ReadingQuestion = { type: "multiple-choice", question: "", options: "", correctAnswer: "", explanation: "", order: 0 };

export default function ReadingManagePage() {
  const [items, setItems] = useState<PassageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PassageItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const LIMIT = 20;

  const fetchMeta = useCallback(async () => {
    const [lvRes, tpRes] = await Promise.all([fetch("/api/admin/levels"), fetch("/api/admin/topics?limit=100")]);
    setLevels((await lvRes.json()).items ?? []);
    setTopics((await tpRes.json()).items ?? []);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(search ? { search } : {}), ...(filterLevel ? { levelId: filterLevel } : {}), ...(filterTopic ? { topicId: filterTopic } : {}), ...(filterExam ? { examType: filterExam } : {}) });
    const res = await fetch(`/api/admin/reading?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterLevel, filterTopic, filterExam]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setQuestions([]); setError(""); setModalOpen(true); }
  function openEdit(item: PassageItem) {
    setEditing(item);
    setForm({ title: item.title, passage: item.passage, wordCount: item.wordCount, examType: item.examType, ageGroup: item.ageGroup, levelId: item.level.id, topicId: item.topic.id });
    setQuestions(item.questions.map((q) => ({ ...q, options: q.options ?? "", explanation: q.explanation ?? "" })));
    setError(""); setModalOpen(true);
  }

  function addQuestion() { setQuestions((qs) => [...qs, { ...EMPTY_Q, order: qs.length }]); }
  function removeQuestion(i: number) { setQuestions((qs) => qs.filter((_, idx) => idx !== i)); }
  function updateQuestion(i: number, field: keyof ReadingQuestion, value: string | number) {
    setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim() || !form.passage.trim() || !form.levelId || !form.topicId) { setError("Title, passage, level, and topic are required."); return; }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/reading/${editing.id}` : "/api/admin/reading", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, wordCount: form.wordCount || form.passage.split(/\s+/).length, questions: questions.map((q, i) => ({ ...q, options: q.options || null, explanation: q.explanation || null, order: i })) }),
      });
      if (!res.ok) { setError((await res.json()).error ?? "Save failed"); return; }
      setModalOpen(false); setPage(1); fetchItems();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if ((await fetch(`/api/admin/reading/${id}`, { method: "DELETE" })).ok) { setDeleteId(null); fetchItems(); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reading Passages</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total passages</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Passage</button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="input" placeholder="Search passages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="text-4xl mb-3">📖</span>
            <p className="font-medium">No reading passages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Words</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Questions</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm text-slate-800 max-w-xs">
                      <p className="truncate">{item.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.wordCount}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-green-50 text-green-700">{item.questions.length} Qs</span>
                    </td>
                    <td className="px-4 py-3"><span className="badge bg-indigo-50 text-indigo-700">{item.level.name}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.topic.name}</td>
                    <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{item.examType}</span></td>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editing ? "Edit Passage" : "Add Reading Passage"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Passage title" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Passage Text *</label>
                  <textarea className="input resize-none" rows={6} value={form.passage} onChange={(e) => setForm({ ...form, passage: e.target.value })} placeholder="Reading passage content..." />
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

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">Comprehension Questions ({questions.length})</label>
                  <button className="btn-secondary text-xs px-3 py-1.5" onClick={addQuestion}>+ Add Question</button>
                </div>
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Question {i + 1}</span>
                        <button onClick={() => removeQuestion(i)} className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Type</label>
                          <select className="input text-sm py-1.5" value={q.type} onChange={(e) => updateQuestion(i, "type", e.target.value)}>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Correct Answer</label>
                          <input className="input text-sm py-1.5" value={q.correctAnswer} onChange={(e) => updateQuestion(i, "correctAnswer", e.target.value)} placeholder="Answer" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">Question</label>
                          <input className="input text-sm py-1.5" value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)} placeholder="Question text" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">Options (JSON array)</label>
                          <input className="input text-sm py-1.5 font-mono" value={q.options} onChange={(e) => updateQuestion(i, "options", e.target.value)} placeholder='["A","B","C","D"]' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create Passage"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Reading Passage</h2>
            <p className="text-sm text-slate-600 mb-6">This will also delete all comprehension questions. This action cannot be undone.</p>
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
