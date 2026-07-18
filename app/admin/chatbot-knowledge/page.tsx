'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { BrainCircuit, Edit2, Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  updated_at: string;
};

const emptyForm = { title: '', content: '', category: 'Umum', isPublished: true };

export default function ChatbotKnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      setNotice({ type: 'error', text: 'Tabel Chatbot Knowledge belum tersedia. Jalankan pembaruan schema Supabase terlebih dahulu.' });
      setEntries([]);
    } else {
      setEntries((data || []) as KnowledgeEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function openCreate() {
    setEditingEntry(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(entry: KnowledgeEntry) {
    setEditingEntry(entry);
    setForm({ title: entry.title, content: entry.content, category: entry.category || 'Umum', isPublished: entry.is_published });
    setIsFormOpen(true);
  }

  async function saveEntry(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setNotice(null);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || 'Umum',
      is_published: form.isPublished,
      updated_at: new Date().toISOString(),
    };
    const { error } = editingEntry
      ? await supabase.from('chatbot_knowledge').update(payload).eq('id', editingEntry.id)
      : await supabase.from('chatbot_knowledge').insert(payload);
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', text: `Tidak dapat menyimpan: ${error.message}` });
      return;
    }
    setNotice({ type: 'success', text: 'Informasi chatbot berhasil disimpan.' });
    setIsFormOpen(false);
    fetchEntries();
  }

  async function deleteEntry(entry: KnowledgeEntry) {
    if (!window.confirm(`Hapus “${entry.title}” dari pengetahuan chatbot?`)) return;
    const { error } = await supabase.from('chatbot_knowledge').delete().eq('id', entry.id);
    if (error) {
      setNotice({ type: 'error', text: `Tidak dapat menghapus: ${error.message}` });
      return;
    }
    setNotice({ type: 'success', text: 'Informasi chatbot dihapus.' });
    fetchEntries();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-orange-600"><BrainCircuit className="h-5 w-5" /><span className="text-sm font-semibold">Lina&apos;s knowledge shelf</span></div>
          <h1 className="text-3xl font-bold text-stone-900">Chatbot Knowledge</h1>
          <p className="mt-2 max-w-2xl text-stone-500">Tambahkan jawaban yang sudah disetujui untuk FAQ, kebijakan, promo, atau informasi bisnis. Hanya entri yang dipublikasikan akan digunakan oleh chatbot.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"><Plus size={18} /> Tambah informasi</button>
      </div>

      {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.text}</div>}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? <div className="p-8 text-stone-500">Memuat informasi chatbot…</div> : entries.length === 0 ? (
          <div className="p-12 text-center"><BrainCircuit className="mx-auto mb-3 h-10 w-10 text-orange-300" /><h2 className="font-semibold text-stone-800">Belum ada informasi tambahan</h2><p className="mt-1 text-sm text-stone-500">Mulai dari FAQ pembayaran, pengiriman, atau promo yang sedang berjalan.</p></div>
        ) : (
          <div className="divide-y divide-stone-100">
            {entries.map((entry) => <article key={entry.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{entry.category}</span><span className={`inline-flex items-center gap-1 text-xs font-medium ${entry.is_published ? 'text-green-700' : 'text-stone-500'}`}>{entry.is_published ? <Eye size={13} /> : <EyeOff size={13} />}{entry.is_published ? 'Dipublikasikan' : 'Draft'}</span></div><h2 className="font-semibold text-stone-900">{entry.title}</h2><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">{entry.content}</p></div>
              <div className="flex shrink-0 gap-2"><button type="button" onClick={() => openEdit(entry)} className="rounded-lg p-2 text-stone-500 hover:bg-orange-50 hover:text-orange-700" aria-label={`Edit ${entry.title}`}><Edit2 size={17} /></button><button type="button" onClick={() => deleteEntry(entry)} className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600" aria-label={`Hapus ${entry.title}`}><Trash2 size={17} /></button></div>
            </article>)}
          </div>
        )}
      </div>

      {isFormOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/45 p-4"><form onSubmit={saveEntry} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-stone-900">{editingEntry ? 'Edit informasi' : 'Tambah informasi chatbot'}</h2><p className="mt-1 text-sm text-stone-500">Tulis fakta yang boleh disampaikan Lina kepada pengunjung.</p></div><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Tutup formulir"><X size={20} /></button></div><div className="space-y-5"><label className="block text-sm font-medium text-stone-700">Judul<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Metode pembayaran" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" /></label><label className="block text-sm font-medium text-stone-700">Kategori<input maxLength={80} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Contoh: Pembayaran" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" /></label><label className="block text-sm font-medium text-stone-700">Jawaban / informasi<textarea required maxLength={5000} rows={7} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Tuliskan jawaban lengkap yang boleh dipakai chatbot…" className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" /></label><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="h-4 w-4 accent-orange-600" /> Publikasikan agar chatbot dapat menggunakan informasi ini</label></div><div className="mt-6 flex justify-end gap-3 border-t border-stone-100 pt-5"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl px-4 py-2.5 font-medium text-stone-600 hover:bg-stone-100">Batal</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><Save size={17} />{saving ? 'Menyimpan…' : 'Simpan informasi'}</button></div></form></div>}
    </div>
  );
}
