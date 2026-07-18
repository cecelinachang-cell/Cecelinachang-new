'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { Bot, ChevronDown, LoaderCircle, MessageCircle, Send, UserRound, X } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const initialMessages: Message[] = [{
  role: 'assistant',
  content: 'Halo! Saya Lina, asisten Cece Lina Chang. Saya bisa bantu tanya kursus, produk, cara pesan, atau pengiriman. Ada yang ingin ditanyakan?',
}];

const quickPrompts = ['Kelas apa yang tersedia?', 'Bagaimana cara pesan alat?', 'Apakah kirim ke luar kota?'];
const whatsappNumber = '6281284250718';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [leadError, setLeadError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const chatSummary = useMemo(
    () => messages.map((message) => `${message.role === 'user' ? 'Pengunjung' : 'Lina'}: ${message.content}`).join('\n'),
    [messages],
  );

  async function sendMessage(messageText = input) {
    const text = messageText.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, pagePath: window.location.pathname }),
      });
      const data = await response.json();
      const reply = response.ok && data.reply
        ? data.reply
        : data.error || 'Maaf, saya sedang terkendala. Anda dapat menghubungi admin lewat WhatsApp.';
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'Maaf, chat sedang tidak tersambung. Silakan hubungi admin lewat WhatsApp.' }]);
    } finally {
      setIsSending(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadStatus === 'sending') return;
    const formData = new FormData(event.currentTarget);
    setLeadStatus('sending');
    setLeadError('');

    try {
      const response = await fetch('/api/chatbot/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          whatsapp: formData.get('whatsapp'),
          email: formData.get('email'),
          topic: formData.get('topic'),
          message: formData.get('message'),
          pagePath: window.location.pathname,
          chatSummary,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pesan belum dapat dikirim.');
      setLeadStatus('success');
      formRef.current?.reset();
    } catch (error) {
      setLeadStatus('error');
      setLeadError(error instanceof Error ? error.message : 'Pesan belum dapat dikirim.');
    }
  }

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo Cece Lina Chang, saya ingin dibantu.\n\n${chatSummary.slice(-1500)}`)}`;

  return (
    <div className="fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section className="mb-4 flex h-[min(650px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-butter/35 bg-cream shadow-[0_20px_60px_rgba(58,46,39,0.28)]" aria-label="Chat layanan pelanggan">
          <div className="flex items-center justify-between bg-rust-ink px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-butter text-rust-ink"><Bot size={22} /></span>
              <div><p className="font-bold">Lina, Asisten Cece</p><p className="text-xs text-white/75">Siap membantu Anda</p></div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/15" aria-label="Tutup chat"><X size={20} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-butter/35 text-rust-ink"><Bot size={15} /></span>}
                <p className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-terracotta text-white' : 'rounded-bl-md bg-white text-charcoal-brown shadow-sm'}`}>{message.content}</p>
              </div>
            ))}
            {isSending && <div className="flex items-center gap-2 text-sm text-charcoal-brown/60"><LoaderCircle size={16} className="animate-spin" /> Lina sedang mengetik…</div>}
          </div>

          <div className="border-t border-butter/25 bg-white/60 p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => <button key={prompt} type="button" disabled={isSending} onClick={() => sendMessage(prompt)} className="shrink-0 rounded-full border border-terracotta/25 bg-white px-3 py-1.5 text-xs font-medium text-rust-ink hover:bg-butter/15 disabled:opacity-50">{prompt}</button>)}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1200} placeholder="Tulis pertanyaan Anda…" className="min-w-0 flex-1 rounded-xl border border-butter/45 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-terracotta/60" />
              <button type="submit" disabled={!input.trim() || isSending} className="rounded-xl bg-terracotta p-2.5 text-white hover:bg-rust-ink disabled:cursor-not-allowed disabled:opacity-50" aria-label="Kirim pesan"><Send size={18} /></button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <button type="button" onClick={() => { setShowLeadForm((value) => !value); setLeadStatus('idle'); }} className="font-semibold text-rust-ink hover:underline">Minta dihubungi</button>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-green-700 hover:underline"><MessageCircle size={14} /> WhatsApp admin</a>
            </div>
          </div>

          {showLeadForm && (
            <form ref={formRef} onSubmit={submitLead} className="max-h-[55%] space-y-2 overflow-y-auto border-t border-butter/25 bg-white px-4 py-3">
              <div className="flex items-center justify-between"><p className="font-semibold text-rust-ink">Minta admin menghubungi Anda</p><button type="button" onClick={() => setShowLeadForm(false)} aria-label="Tutup formulir"><ChevronDown size={18} /></button></div>
              <input name="name" maxLength={120} placeholder="Nama (opsional)" className="w-full rounded-lg border border-butter/45 px-3 py-2 text-sm" />
              <input name="whatsapp" maxLength={40} placeholder="Nomor WhatsApp" className="w-full rounded-lg border border-butter/45 px-3 py-2 text-sm" />
              <input name="email" type="email" maxLength={160} placeholder="Email (opsional)" className="w-full rounded-lg border border-butter/45 px-3 py-2 text-sm" />
              <input name="topic" maxLength={160} placeholder="Topik (mis. pendaftaran kelas)" className="w-full rounded-lg border border-butter/45 px-3 py-2 text-sm" />
              <textarea name="message" required maxLength={2000} rows={3} placeholder="Ceritakan kebutuhan Anda" className="w-full resize-none rounded-lg border border-butter/45 px-3 py-2 text-sm" />
              {leadStatus === 'success' && <p className="text-xs text-green-700">Terima kasih. Pesan Anda sudah diterima.</p>}
              {leadStatus === 'error' && <p className="text-xs text-red-700">{leadError}</p>}
              <button type="submit" disabled={leadStatus === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-lg bg-rust-ink px-3 py-2.5 text-sm font-semibold text-white hover:bg-terracotta disabled:opacity-50"><UserRound size={16} /> {leadStatus === 'sending' ? 'Mengirim…' : 'Kirim permintaan'}</button>
              <p className="text-[11px] leading-relaxed text-charcoal-brown/60">Kami hanya menggunakan data ini untuk menindaklanjuti pertanyaan Anda.</p>
            </form>
          )}
        </section>
      )}

      <button type="button" onClick={() => setIsOpen((value) => !value)} className="group flex h-16 w-16 items-center justify-center rounded-full bg-terracotta text-white shadow-[0_10px_30px_rgba(196,98,45,0.42)] transition hover:-translate-y-1 hover:bg-rust-ink hover:shadow-[0_15px_35px_rgba(122,59,30,0.5)]" aria-label={isOpen ? 'Tutup chat layanan pelanggan' : 'Buka chat layanan pelanggan'}>
        {isOpen ? <X size={28} /> : <MessageCircle size={30} className="transition group-hover:scale-110" />}
      </button>
    </div>
  );
}
