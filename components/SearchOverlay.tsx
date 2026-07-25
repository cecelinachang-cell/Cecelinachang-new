'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MessageCircle, Package, Search, X } from 'lucide-react';
import type { SearchResult } from '@/lib/search';

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function openOverlay() {
      setIsOpen(true);
    }
    window.addEventListener('toko:open-search', openOverlay);
    return () => window.removeEventListener('toko:open-search', openOverlay);
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
      setStatus('idle');
    }
  }, [isOpen]);

  const runSearch = useDebouncedCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      setResults([]);
    } finally {
      setStatus('done');
    }
  }, 300);

  function handleChange(value: string) {
    setQuery(value);
    runSearch(value);
  }

  function askLina() {
    const trimmed = query.trim();
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('toko:open-chatbot', { detail: { query: trimmed } }));
  }

  if (!isOpen) return null;

  const products = results.filter((r) => r.type === 'product');
  const courses = results.filter((r) => r.type === 'course');
  const hasSearched = status === 'done' && query.trim().length > 0;
  const noResults = hasSearched && results.length === 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-cream md:items-start md:justify-center md:bg-charcoal-brown/40 md:backdrop-blur-sm">
      <div className="flex h-full w-full flex-col overflow-hidden bg-cream md:mx-auto md:mt-20 md:h-auto md:max-h-[70vh] md:w-full md:max-w-xl md:rounded-3xl md:shadow-2xl">
        <div className="flex items-center gap-3 border-b border-butter/40 px-4 py-4">
          <Search className="h-5 w-5 shrink-0 text-charcoal-brown/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Cari produk atau kelas…"
            className="min-w-0 flex-1 bg-transparent text-base text-charcoal-brown outline-none placeholder:text-charcoal-brown/40"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup pencarian"
            className="shrink-0 rounded-full p-2 text-charcoal-brown/60 hover:bg-butter/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {status === 'loading' && (
            <p className="py-8 text-center text-sm text-charcoal-brown/50">Mencari…</p>
          )}

          {!query.trim() && status !== 'loading' && (
            <p className="py-8 text-center text-sm text-charcoal-brown/50">
              Ketik nama produk atau kelas yang kamu cari.
            </p>
          )}

          {products.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-brown/50">Produk</h2>
              <div className="flex flex-col gap-2">
                {products.map((item) => (
                  <SearchResultRow key={`product-${item.id}`} item={item} onNavigate={() => setIsOpen(false)} />
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-brown/50">Kursus</h2>
              <div className="flex flex-col gap-2">
                {courses.map((item) => (
                  <SearchResultRow key={`course-${item.id}`} item={item} onNavigate={() => setIsOpen(false)} />
                ))}
              </div>
            </div>
          )}

          {noResults && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-sm text-charcoal-brown/60">
                Belum ketemu produk atau kelas untuk &quot;{query}&quot;.
              </p>
              <button
                type="button"
                onClick={askLina}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-rust-ink"
              >
                <MessageCircle className="h-4 w-4" /> Tanya Lina
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultRow({ item, onNavigate }: { item: SearchResult; onNavigate: () => void }) {
  const href = item.type === 'product' ? `/toko/${item.slug}` : `/kursus/${item.slug}`;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-butter/30 bg-white px-3 py-2 active:bg-butter/10"
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {item.image ? (
          <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-stone-400">
            <Package className="h-5 w-5" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-charcoal-brown">{item.title}</span>
        <span className="block text-sm text-terracotta">{item.price ?? 'Hubungi admin'}</span>
      </span>
    </Link>
  );
}
