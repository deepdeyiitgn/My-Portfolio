import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';

interface FeedbackCategory {
  _id: string;
  subject: string;
  subjectSlug: string;
  subSubjects: Array<{ name: string; slug: string }>;
}

interface FeedbackItem {
  _id: string;
  userName: string;
  subject: string;
  subSubject: string;
  title: string;
  text: string;
  rating: number;
  isPinned: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
}

export default function FeedbackAdminPanel({ onChanged }: { onChanged?: () => void }) {
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newSubSubject, setNewSubSubject] = useState('');
  const [subjectTargetId, setSubjectTargetId] = useState('');

  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1 });
  const [editing, setEditing] = useState<FeedbackItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === subjectTargetId),
    [categories, subjectTargetId],
  );

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const r = await fetch('/api/categories?type=feedback');
      const d = await r.json();
      if (d.ok) {
        setCategories(Array.isArray(d.categories) ? d.categories : []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchFeedbacks = useCallback(async (p = 1) => {
    setLoadingFeedbacks(true);
    try {
      const r = await fetch(`/api/journal?action=feedback-admin-list&page=${p}&limit=20&sort=newest`);
      const d = await r.json();
      if (d.ok) {
        setFeedbacks(Array.isArray(d.feedbacks) ? d.feedbacks : []);
        setPagination({ page: d.pagination?.page || 1, totalPages: d.pagination?.totalPages || 1 });
        setPage(p);
      }
    } catch {
      // ignore
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFeedbacks(1);
  }, [fetchCategories, fetchFeedbacks]);

  const refreshAll = () => {
    fetchCategories();
    fetchFeedbacks(page);
    onChanged?.();
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    const r = await fetch('/api/categories?type=feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-subject', subject: newSubject.trim() }),
    });
    const d = await r.json();
    if (d.ok) {
      setNewSubject('');
      refreshAll();
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject and all sub-subjects?')) return;
    const r = await fetch(`/api/categories?type=feedback&categoryId=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.ok) refreshAll();
  };

  const handleAddSubSubject = async () => {
    if (!subjectTargetId || !newSubSubject.trim()) return;
    const r = await fetch('/api/categories?type=feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-subsubject', categoryId: subjectTargetId, name: newSubSubject.trim() }),
    });
    const d = await r.json();
    if (d.ok) {
      setNewSubSubject('');
      refreshAll();
    }
  };

  const handleDeleteSubSubject = async (categoryId: string, subSlug: string) => {
    if (!confirm('Delete this sub-subject?')) return;
    const r = await fetch(`/api/categories?type=feedback&action=delete-subsubject&categoryId=${encodeURIComponent(categoryId)}&subSlug=${encodeURIComponent(subSlug)}`, {
      method: 'DELETE',
    });
    const d = await r.json();
    if (d.ok) refreshAll();
  };

  const handleTogglePin = async (id: string, pin: boolean) => {
    const r = await fetch('/api/journal?action=feedback-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId: id, pin }),
    });
    const d = await r.json();
    if (d.ok) {
      fetchFeedbacks(page);
      onChanged?.();
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback permanently?')) return;
    const r = await fetch(`/api/journal?action=feedback-admin&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const d = await r.json();
    if (d.ok) {
      fetchFeedbacks(page);
      onChanged?.();
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const r = await fetch('/api/journal?action=feedback-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: editing._id,
          title: editing.title,
          text: editing.text,
          rating: editing.rating,
          isPinned: editing.isPinned,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setEditing(null);
        fetchFeedbacks(page);
        onChanged?.();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-bold text-sm">Feedback Subjects</h3>
          <div className="flex gap-2">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="New subject"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
            />
            <button onClick={handleAddSubject} className="px-3 py-2 rounded-xl bg-amber-500 text-black text-sm font-bold inline-flex items-center gap-1"><Plus size={12} />Add</button>
          </div>

          {loadingCategories ? (
            <div className="py-5 text-center"><Loader2 className="animate-spin text-amber-500 mx-auto" size={18} /></div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div key={cat._id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-zinc-200 text-sm font-semibold">{cat.subject}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSubjectTargetId(cat._id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200"><Edit3 size={12} /></button>
                      <button onClick={() => handleDeleteSubject(cat._id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(cat.subSubjects || []).map((sub) => (
                      <span key={sub.slug} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                        {sub.name}
                        <button onClick={() => handleDeleteSubSubject(cat._id, sub.slug)} className="text-zinc-500 hover:text-red-400">
                          <Trash2 size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-bold text-sm">Sub-subject Manager</h3>
          <select
            value={subjectTargetId}
            onChange={(e) => setSubjectTargetId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
          >
            <option value="">Select Subject</option>
            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.subject}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              value={newSubSubject}
              onChange={(e) => setNewSubSubject(e.target.value)}
              placeholder="New sub-subject"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
            />
            <button onClick={handleAddSubSubject} disabled={!subjectTargetId} className="px-3 py-2 rounded-xl bg-amber-500 text-black text-sm font-bold inline-flex items-center gap-1 disabled:opacity-40"><Plus size={12} />Add</button>
          </div>
          <div className="text-xs text-zinc-500">
            {selectedCategory ? `Managing: ${selectedCategory.subject}` : 'Select a subject to add sub-subjects.'}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-white font-bold text-sm">Feedback Moderation</h3>
        {loadingFeedbacks ? (
          <div className="py-10 text-center"><Loader2 className="animate-spin text-amber-500 mx-auto" size={20} /></div>
        ) : feedbacks.length === 0 ? (
          <p className="text-zinc-600 text-sm py-8 text-center">No feedbacks found.</p>
        ) : (
          <div className="space-y-2">
            {feedbacks.map((item) => (
              <div key={item._id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-zinc-200 text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-zinc-500 text-[11px]">{item.userName} · {item.subject} / {item.subSubject}</p>
                    <p className="text-zinc-400 text-xs mt-1 whitespace-pre-wrap break-words line-clamp-3">{item.text}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={11} className={star <= Number(item.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleTogglePin(item._id, !item.isPinned)} className={`px-2 py-1 rounded-lg text-[11px] font-bold ${item.isPinned ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                      {item.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200"><Edit3 size={12} /></button>
                    <button onClick={() => handleDeleteFeedback(item._id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => fetchFeedbacks(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs disabled:opacity-40">Prev</button>
                <span className="text-zinc-500 text-xs">Page {pagination.page} / {pagination.totalPages}</span>
                <button onClick={() => fetchFeedbacks(page + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[560] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-900 p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-white font-bold">Edit Feedback</h4>
            <input
              value={editing.title}
              onChange={(e) => setEditing((prev) => prev ? { ...prev, title: e.target.value } : prev)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
            />
            <textarea
              value={editing.text}
              onChange={(e) => setEditing((prev) => prev ? { ...prev, text: e.target.value.slice(0, 3000) } : prev)}
              className="w-full min-h-[160px] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setEditing((prev) => prev ? { ...prev, rating: star } : prev)} type="button">
                  <Star size={16} className={star <= Number(editing.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm">Cancel</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="px-3 py-2 rounded-xl bg-amber-500 text-black text-sm font-bold inline-flex items-center gap-1 disabled:opacity-40">
                {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
