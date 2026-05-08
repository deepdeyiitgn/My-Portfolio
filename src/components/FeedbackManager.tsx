import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquare, Plus, Loader2, Trash2, Edit3, Pin, PinOff, ChevronLeft, ChevronRight, Star, Save, X } from 'lucide-react';

interface FeedbackCategory {
  _id: string;
  name: string;
  slug: string;
  source: string;
  subSubjects: string[];
  isDefault?: boolean;
}

interface FeedbackItem {
  _id: string;
  userName: string;
  userPic: string;
  subjectName: string;
  subjectSlug: string;
  subSubjectName: string;
  subSubjectSlug: string;
  shortSubject: string;
  text: string;
  rating: number;
  isPinned: boolean;
  createdAt: string;
  createdAtIST: string;
}

interface Pagination {
  page: number;
  total: number;
  totalPages: number;
  limit: number;
}

interface FeedbackMetrics {
  totalFeedbacks: number;
  categoryCount: number;
  pinnedCount: number;
}

interface Props {
  onToast: (message: string, type?: 'success' | 'error') => void;
  onMetricsChange?: (metrics: FeedbackMetrics) => void;
}

const inputCls = 'w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm';
const btnCls = 'px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95';

export default function FeedbackManager({ onToast, onMetricsChange }: Props) {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubSubjects, setNewSubSubjects] = useState('UI/UX, Performance, Bug Report, Feature Request, General');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [categoryDraftName, setCategoryDraftName] = useState('');
  const [categoryDraftSub, setCategoryDraftSub] = useState('');

  const [filterSubject, setFilterSubject] = useState('');
  const [filterSubSubject, setFilterSubSubject] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'relevant'>('newest');

  const [editingFeedbackId, setEditingFeedbackId] = useState('');
  const [feedbackShort, setFeedbackShort] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  const selectedFilterSubject = useMemo(
    () => categories.find(c => c.slug === filterSubject) || null,
    [categories, filterSubject],
  );

  const updateMetrics = useCallback(async () => {
    try {
      const r = await fetch('/api/journal?action=feedback-stats');
      const d = await r.json();
      if (!d.ok) return;
      const metrics = d.metrics || {};
      onMetricsChange?.({
        totalFeedbacks: Number(metrics.totalFeedbacks || 0),
        categoryCount: Number(metrics.categoryCount || 0),
        pinnedCount: Number(metrics.pinnedCount || 0),
      });
    } catch {
      // ignore
    }
  }, [onMetricsChange]);

  const fetchCategories = useCallback(async () => {
    try {
      const r = await fetch('/api/categories?type=feedback');
      const d = await r.json();
      if (d.ok) setCategories(d.categories || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchFeedbacks = useCallback(async (page = 1, subject = filterSubject, sub = filterSubSubject, sort = sortBy) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'feedback-admin-list', page: String(page), sort });
      if (subject) params.set('subject', subject);
      if (sub) params.set('subSubject', sub);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to load feedbacks', 'error');
        return;
      }
      setFeedbacks(d.feedbacks || []);
      setPagination(d.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
    } catch {
      onToast('Failed to load feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterSubSubject, sortBy, onToast]);

  useEffect(() => {
    fetchCategories();
    fetchFeedbacks(1, filterSubject, filterSubSubject, sortBy);
    updateMetrics();
  }, [fetchCategories, fetchFeedbacks, filterSubject, filterSubSubject, sortBy, updateMetrics]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setSavingCategory(true);
    try {
      const r = await fetch('/api/categories?type=feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.trim(),
          subSubjects: newSubSubjects.split(',').map(s => s.trim()).filter(Boolean),
          source: 'custom',
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to add category', 'error');
        return;
      }
      setNewCategory('');
      await fetchCategories();
      await updateMetrics();
      onToast('Feedback subject saved');
    } catch {
      onToast('Network error', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const startCategoryEdit = (cat: FeedbackCategory) => {
    setEditingCategoryId(cat._id);
    setCategoryDraftName(cat.name);
    setCategoryDraftSub((cat.subSubjects || []).join(', '));
  };

  const saveCategoryEdit = async () => {
    const base = categories.find(c => c._id === editingCategoryId);
    if (!base || !categoryDraftName.trim()) return;
    setSavingCategory(true);
    try {
      const r = await fetch('/api/categories?type=feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategoryId.startsWith('default:') ? undefined : editingCategoryId,
          slug: base.slug,
          name: categoryDraftName.trim(),
          subSubjects: categoryDraftSub.split(',').map(s => s.trim()).filter(Boolean),
          source: base.source,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to update category', 'error');
        return;
      }
      setEditingCategoryId('');
      await fetchCategories();
      await updateMetrics();
      onToast('Feedback subject updated');
    } catch {
      onToast('Network error', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (cat: FeedbackCategory) => {
    if (!confirm(`Delete subject "${cat.name}"?`)) return;
    try {
      const params = new URLSearchParams({ type: 'feedback' });
      if (cat._id.startsWith('default:')) params.set('slug', cat.slug);
      else params.set('id', cat._id);
      const r = await fetch(`/api/categories?${params.toString()}`, { method: 'DELETE' });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to delete category', 'error');
        return;
      }
      await fetchCategories();
      await updateMetrics();
      onToast('Feedback subject deleted');
    } catch {
      onToast('Network error', 'error');
    }
  };

  const togglePin = async (item: FeedbackItem) => {
    try {
      const r = await fetch('/api/journal?action=feedback-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: item._id, pin: !item.isPinned }),
      });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to update pin', 'error');
        return;
      }
      setFeedbacks(prev => prev.map(f => f._id === item._id ? { ...f, isPinned: !item.isPinned } : f));
      updateMetrics();
      onToast(item.isPinned ? 'Unpinned' : 'Pinned');
    } catch {
      onToast('Network error', 'error');
    }
  };

  const startFeedbackEdit = (item: FeedbackItem) => {
    setEditingFeedbackId(item._id);
    setFeedbackShort(item.shortSubject);
    setFeedbackText(item.text);
    setFeedbackRating(Number(item.rating || 5));
  };

  const saveFeedbackEdit = async () => {
    if (!editingFeedbackId || !feedbackShort.trim() || !feedbackText.trim()) return;
    try {
      const item = feedbacks.find(f => f._id === editingFeedbackId);
      const r = await fetch('/api/journal?action=feedback-owner-edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: editingFeedbackId,
          subjectName: item?.subjectName,
          subjectSlug: item?.subjectSlug,
          subSubjectName: item?.subSubjectName,
          subSubjectSlug: item?.subSubjectSlug,
          shortSubject: feedbackShort.trim(),
          text: feedbackText.trim(),
          rating: feedbackRating,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to update feedback', 'error');
        return;
      }
      setEditingFeedbackId('');
      await fetchFeedbacks(pagination.page, filterSubject, filterSubSubject, sortBy);
      onToast('Feedback updated');
    } catch {
      onToast('Network error', 'error');
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback permanently from public view?')) return;
    try {
      const r = await fetch(`/api/journal?action=feedback-owner-delete&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (!d.ok) {
        onToast(d.message || 'Failed to delete feedback', 'error');
        return;
      }
      await fetchFeedbacks(pagination.page, filterSubject, filterSubSubject, sortBy);
      updateMetrics();
      onToast('Feedback deleted');
    } catch {
      onToast('Network error', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2"><Plus size={14} /> Feedback Subject Management</h3>
          <div className="space-y-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Subject name (e.g., QuickLink)" className={inputCls} />
            <textarea value={newSubSubjects} onChange={(e) => setNewSubSubjects(e.target.value)} rows={2} placeholder="Sub-subjects comma separated" className={`${inputCls} resize-none`} />
            <button onClick={handleAddCategory} disabled={savingCategory || !newCategory.trim()} className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2`}>
              {savingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Subject
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                {editingCategoryId === cat._id ? (
                  <>
                    <input value={categoryDraftName} onChange={(e) => setCategoryDraftName(e.target.value)} className={inputCls} />
                    <textarea value={categoryDraftSub} onChange={(e) => setCategoryDraftSub(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                    <div className="flex gap-2">
                      <button onClick={saveCategoryEdit} className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 text-xs flex items-center gap-1`}><Save size={12} /> Save</button>
                      <button onClick={() => setEditingCategoryId('')} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs`}><X size={12} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white text-sm font-bold">{cat.name}</p>
                        <p className="text-zinc-600 text-[10px] font-mono">{cat.slug} · {cat.source}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startCategoryEdit(cat)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"><Edit3 size={13} /></button>
                        <button onClick={() => deleteCategory(cat)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-500 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs">{cat.subSubjects.join(', ') || 'No sub-subjects'}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2"><MessageSquare size={14} /> Feedback Moderation</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setFilterSubSubject(''); }} className={inputCls}>
              <option value="">All Subjects</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <select value={filterSubSubject} onChange={(e) => setFilterSubSubject(e.target.value)} className={inputCls} disabled={!selectedFilterSubject}>
              <option value="">All Sub-subjects</option>
              {(selectedFilterSubject?.subSubjects || []).map((s) => {
                const slug = s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                return <option key={slug} value={slug}>{s}</option>;
              })}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={inputCls}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
          ) : feedbacks.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No feedback found.</p>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {feedbacks.map((item) => {
                const editing = editingFeedbackId === item._id;
                return (
                  <div key={item._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white text-sm font-bold">{item.userName}</p>
                        <p className="text-zinc-600 text-[10px] font-mono">{item.subjectName} · {item.subSubjectName}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => togglePin(item)} className={`p-1.5 rounded-lg transition-colors ${item.isPinned ? 'text-amber-500 hover:bg-amber-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`} title={item.isPinned ? 'Unpin' : 'Pin'}>
                          {item.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                        </button>
                        <button onClick={() => startFeedbackEdit(item)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"><Edit3 size={13} /></button>
                        <button onClick={() => deleteFeedback(item._id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-500 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {editing ? (
                      <div className="space-y-2">
                        <input value={feedbackShort} onChange={(e) => setFeedbackShort(e.target.value.slice(0, 160))} className={inputCls} />
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value.slice(0, 3000))} rows={4} className={`${inputCls} resize-none`} />
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setFeedbackRating(s)} className={`p-1 rounded ${s <= feedbackRating ? 'text-amber-500' : 'text-zinc-600'}`}>
                              <Star size={14} fill={s <= feedbackRating ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveFeedbackEdit} className={`${btnCls} bg-amber-500 text-black hover:bg-amber-400 text-xs flex items-center gap-1`}><Save size={12} /> Save</button>
                          <button onClick={() => setEditingFeedbackId('')} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs`}><X size={12} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < Number(item.rating || 0) ? 'currentColor' : 'none'} />)}
                        </div>
                        <p className="text-zinc-200 text-xs font-semibold">{item.shortSubject}</p>
                        <p className="text-zinc-400 text-xs whitespace-pre-wrap">{item.text}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => fetchFeedbacks(pagination.page - 1)} disabled={pagination.page <= 1} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}><ChevronLeft size={14} /> Prev</button>
              <span className="text-zinc-500 text-sm">Page {pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => fetchFeedbacks(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1`}>Next <ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
