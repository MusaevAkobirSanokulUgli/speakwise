"use client";

import { useState, useEffect, useCallback } from "react";

interface Level { id: string; name: string; }
interface Topic { id: string; name: string; }
interface VocabItem {
  id: string;
  word: string;
  definition: string;
  exampleSentence: string;
  partOfSpeech: string | null;
  examType: string;
  ageGroup: string;
  pronunciation: string | null;
  level: { id: string; name: string };
  topic: { id: string; name: string };
}

const EMPTY_FORM = {
  word: "", definition: "", exampleSentence: "",
  pronunciation: "", partOfSpeech: "", ageGroup: "all", examType: "general",
  levelId: "", topicId: "",
};

export default function VocabularyManagePage() {
  const [items, setItems] = useState<VocabItem[]>([]);
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
  const [editing, setEditing] = useState<VocabItem | null>(null);
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
    const lvData = await lvRes.json();
    const tpData = await tpRes.json();
    setLevels(lvData.items ?? []);
    setTopics(tpData.items ?? []);
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
    });
    const res = await fetch(`/api/admin/vocabulary?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, filterLevel, filterTopic, filterExam]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: VocabItem) {
    setEditing(item);
    setForm({
      word: item.word,
      definition: item.definition,
      exampleSentence: item.exampleSentence,
      pronunciation: item.pronunciation ?? "",
      partOfSpeech: item.partOfSpeech ?? "",
      ageGroup: item.ageGroup,
      examType: item.examType,
      levelId: item.level.id,
      topicId: item.topic.id,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.word.trim() || !form.definition.trim() || !form.exampleSentence.trim() || !form.levelId || !form.topicId) {
      setError("Word, definition, example sentence, level, and topic are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pronunciation: form.pronunciation || null,
        partOfSpeech: form.partOfSpeech || null,
      };
      const res = await fetch(
        editing ? `/api/admin/vocabulary/${editing.id}` : "/api/admin/vocabulary",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Save failed");
        return;
      }
      setModalOpen(false);
      setPage(1);
      fetchItems();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/vocabulary/${id}`, { method: "DELETE" });
    if (res.ok) {
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
          <h1 className="text-2xl font-bold text-slate-900">Vocabulary</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total words</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Word</button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="Search words..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="input"
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
          >
            <option value="">All Levels</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select
            className="input"
            value={filterTopic}
            onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}
          >
            <option value="">All Topics</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            className="input"
            value={filterExam}
            onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}
          >
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
            <span className="text-4xl mb-3">📚</span>
            <p className="font-medium">No vocabulary found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new word.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Word</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Definition</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-sm">{item.word}</p>
                      {item.partOfSpeech && (
                        <span className="text-xs text-slate-400 italic">{item.partOfSpeech}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                      <p className="truncate">{item.definition}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-indigo-50 text-indigo-700">{item.level.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.topic.name}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600">{item.examType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} &mdash; {total} results
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary text-xs px-3 py-1.5"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn-secondary text-xs px-3 py-1.5"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editing ? "Edit Word" : "Add New Word"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Word *</label>
                  <input className="input" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="e.g. Articulate" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Definition *</label>
                  <textarea className="input resize-none" rows={2} value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} placeholder="Clear, concise definition" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Example Sentence *</label>
                  <textarea className="input resize-none" rows={2} value={form.exampleSentence} onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })} placeholder="Used in a sentence" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pronunciation</label>
                  <input className="input" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/ɑːr.tɪk.jʊ.leɪt/" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Part of Speech</label>
                  <input className="input" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} placeholder="noun, verb, adj..." />
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
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Word"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Word</h2>
            <p className="text-sm text-slate-600 mb-6">
              This action cannot be undone. The vocabulary word will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                className="btn-primary bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
