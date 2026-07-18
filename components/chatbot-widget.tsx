'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { ChevronDown, Heart, LoaderCircle, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const initialMessages: Message[] = [{
  role: 'assistant',
  content: 'Hai, aku Lina! 🤎 Senang banget bisa nemenin kamu cari kelas, alat baking, atau info pesanan. Mau mulai dari yang mana?',
}];

const quickPrompts = ['Lihat kelas yang cocok', 'Cara pesan alat', 'Bisa kirim luar kota?'];
const whatsappNumber = '6281284250718';
const linaAvatar = 'https://i.postimg.cc/tCXKbMWY/image.png';

function LinaAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'h-8 w-8', md: 'h-11 w-11', lg: 'h-14 w-14' }[size];
  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden rounded-[42%_58%_48%_52%/55%_45%_55%_45%] border-2 border-white bg-butter/50 shadow-sm ${sizeClass}`}>
      <Image src={linaAvatar} alt="Cece Lina Chang" fill sizes="56px" className="object-cover object-top" unoptimized />
    </span>
  );
}

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
        : data.error || 'Aduh, chat sedang istirahat sebentar. Kamu bisa lanjut cerita ke admin lewat WhatsApp, ya.';
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'Aduh, chat sedang belum tersambung. Kamu bisa langsung hubungi admin lewat WhatsApp, ya.' }]);
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
        <section className="mb-4 flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-butter/45 bg-[#fffaf3] shadow-[0_24px_70px_rgba(95,54,32,0.3)]" aria-label="Chat layanan pelanggan">
          <div className="relative overflow-hidden bg-rust-ink px-5 py-4 text-white">
            <span className="absolute -right-7 -top-9 h-28 w-28 rounded-full bg-butter/20" />
            <span className="absolute -bottom-9 right-20 h-20 w-20 rounded-full bg-terracotta/35" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative"><LinaAvatar /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-rust-ink bg-[#83c58b]" /></div>
                <div><p className="font-serif text-lg font-bold">Lina si Teman Dapur</p><p className="text-xs text-white/80">online, siap bantu dengan hangat</p></div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 transition hover:bg-white/15" aria-label="Tutup chat"><X size={20} /></button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_12px_12px,rgba(232,184,109,0.17)_1px,transparent_1.5px)] bg-[length:22px_22px] px-4 py-5">
            <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-butter/30 bg-white/80 px-3 py-1 text-[11px] font-medium text-rust-ink/75 shadow-sm"><Sparkles size={12} className="text-terracotta" /> ngobrol santai, tanya sepuasnya</div>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <span className="mt-1"><LinaAvatar size="sm" /></span>}
                <p className={`max-w-[82%] whitespace-pre-wrap rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-terracotta text-white shadow-[0_6px_16px_rgba(196,98,45,0.18)]' : 'rounded-bl-md border border-butter/20 bg-white text-charcoal-brown shadow-[0_5px_14px_rgba(88,58,36,0.1)]'}`}>{message.content}</p>
              </div>
            ))}
            {isSending && <div className="flex items-center gap-2 pl-1 text-sm text-charcoal-brown/65"><LinaAvatar size="sm" /><span className="rounded-full bg-white px-3 py-2 shadow-sm"><LoaderCircle size={14} className="mr-1 inline animate-spin" /> Lina sedang meracik jawaban…</span></div>}
          </div>

          <div className="border-t border-butter/25 bg-white/90 p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => <button key={prompt} type="button" disabled={isSending} onClick={() => sendMessage(prompt)} className="shrink-0 rounded-full border border-terracotta/20 bg-[#fffaf3] px-3 py-1.5 text-xs font-semibold text-rust-ink transition hover:-translate-y-0.5 hover:bg-butter/20 disabled:opacity-50">{prompt}</button>)}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2 rounded-2xl border border-butter/45 bg-white p-1.5 shadow-inner">
              <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1200} placeholder="Tulis ceritamu di sini…" className="min-w-0 flex-1 rounded-xl bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-charcoal-brown/45" />
              <button type="submit" disabled={!input.trim() || isSending} className="rounded-xl bg-terracotta p-2.5 text-white transition hover:scale-105 hover:bg-rust-ink disabled:cursor-not-allowed disabled:opacity-50" aria-label="Kirim pesan"><Send size={18} /></button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <button type="button" onClick={() => { setShowLeadForm((value) => !value); setLeadStatus('idle'); }} className="inline-flex items-center gap-1 font-semibold text-rust-ink hover:underline"><Heart size={13} className="fill-current" /> Minta dihubungi</button>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-green-700 hover:underline"><MessageCircle size={14} /> Lanjut ke WhatsApp</a>
            </div>
          </div>

          {showLeadForm && (
            <form ref={formRef} onSubmit={submitLead} className="max-h-[55%] space-y-2 overflow-y-auto border-t border-butter/25 bg-[#fffaf3] px-4 py-3">
              <div className="flex items-center justify-between"><div><p className="font-serif font-bold text-rust-ink">Biar kami yang menyapa dulu</p><p className="text-[11px] text-charcoal-brown/60">Tinggalkan kontak, ya. Kami bantu lanjutkan.</p></div><button type="button" onClick={() => setShowLeadForm(false)} aria-label="Tutup formulir"><ChevronDown size={18} /></button></div>
              <input name="name" maxLength={120} placeholder="Nama panggilan (opsional)" className="w-full rounded-lg border border-butter/45 bg-white px-3 py-2 text-sm" />
              <input name="whatsapp" maxLength={40} placeholder="Nomor WhatsApp" className="w-full rounded-lg border border-butter/45 bg-white px-3 py-2 text-sm" />
              <input name="email" type="email" maxLength={160} placeholder="Email (opsional)" className="w-full rounded-lg border border-butter/45 bg-white px-3 py-2 text-sm" />
              <input name="topic" maxLength={160} placeholder="Topik (mis. pendaftaran kelas)" className="w-full rounded-lg border border-butter/45 bg-white px-3 py-2 text-sm" />
              <textarea name="message" required maxLength={2000} rows={3} placeholder="Ceritakan kebutuhan Anda" className="w-full resize-none rounded-lg border border-butter/45 bg-white px-3 py-2 text-sm" />
              {leadStatus === 'success' && <p className="text-xs text-green-700">Makasih ya, pesanmu sudah kami terima 🤎</p>}
              {leadStatus === 'error' && <p className="text-xs text-red-700">{leadError}</p>}
              <button type="submit" disabled={leadStatus === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust-ink px-3 py-2.5 text-sm font-semibold text-white hover:bg-terracotta disabled:opacity-50"><UserRound size={16} /> {leadStatus === 'sending' ? 'Mengirim…' : 'Tolong hubungi aku'}</button>
              <p className="text-[11px] leading-relaxed text-charcoal-brown/60">Data ini hanya dipakai untuk membantu menindaklanjuti pertanyaanmu.</p>
            </form>
          )}
        </section>
      )}

      <button type="button" onClick={() => setIsOpen((value) => !value)} className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-[46%_54%_51%_49%/48%_42%_58%_52%] border-4 border-[#fffaf3] bg-butter shadow-[0_10px_30px_rgba(196,98,45,0.42)] transition hover:-translate-y-1 hover:rotate-3 hover:shadow-[0_15px_35px_rgba(122,59,30,0.5)]" aria-label={isOpen ? 'Tutup chat layanan pelanggan' : 'Buka chat layanan pelanggan'}>
        {isOpen ? <X size={28} className="text-rust-ink" /> : <><LinaAvatar size="lg" /><span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-white shadow-sm"><MessageCircle size={13} /></span></>}
      </button>
    </div>
  );
}
