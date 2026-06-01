'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/utils';
import { Save, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const ASSET_KEYS = [
  { id: 'hero_image', label: 'Home Page: Hero Image', width: 800, height: 1000 },
  { id: 'home_course_1', label: 'Home Page: Course Grid 1', width: 400, height: 400 },
  { id: 'home_course_2', label: 'Home Page: Course Grid 2', width: 400, height: 400 },
  { id: 'home_course_3', label: 'Home Page: Course Grid 3', width: 400, height: 400 },
  { id: 'home_course_4', label: 'Home Page: Course Grid 4', width: 400, height: 400 },
  { id: 'about_image', label: 'Tentang Kami: Profile Photo', width: 800, height: 1000 },
];

const withTimeout = <T,>(promise: Promise<T> | PromiseLike<T>, ms: number, message: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
};

export default function AssetsManager() {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showRlsError, setShowRlsError] = useState(false);

  useEffect(() => {
    fetchAssets();
    // Subscribe to updates
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchAssets)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAssets = async () => {
    try {
      const keys = ASSET_KEYS.map(a => a.id);
      const { data, error } = await supabase.from('settings').select('id, logo_url').in('id', keys);
      
      if (!error && data) {
        const newAssets: Record<string, string> = {};
        data.forEach(item => {
          if (item.logo_url) newAssets[item.id] = item.logo_url;
        });
        setAssets(newAssets);
      }
    } catch (err: any) {
      const errMsg = err.message || err.toString();
      if (errMsg !== 'Failed to fetch' && !errMsg.includes('Failed to fetch')) {
        console.error('Error fetching assets:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveUrlToDb = async (assetId: string, urlStr: string) => {
    setSavingKeys(prev => ({ ...prev, [assetId]: true }));
    setMessage({ type: '', text: '' });
    setShowRlsError(false);

    try {
      const { error } = await withTimeout<any>(
        supabase.from('settings').upsert({
          id: assetId,
          logo_url: urlStr,
          updated_at: new Date().toISOString()
        }),
        30000,
        'Menyimpan memakan waktu terlalu lama. Pastikan koneksi internet stabil.'
      );

      if (error) throw error;
      
      setAssets(prev => ({ ...prev, [assetId]: urlStr }));
      setMessage({ type: 'success', text: `Gambar ${ASSET_KEYS.find(a => a.id === assetId)?.label} berhasil disimpan!` });
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('Full save error:', errMsg, err);
      
      if (errMsg.includes('row-level security') || errMsg.includes('RLS')) {
        setShowRlsError(true);
      }
      setMessage({ type: 'error', text: `Gagal menyimpan: ${errMsg}` });
    } finally {
      setSavingKeys(prev => ({ ...prev, [assetId]: false }));
      setTimeout(() => { if (!showRlsError) setMessage({ type: '', text: '' }) }, 5000);
    }
  };

  const handlePasteUrl = (assetId: string) => {
    const url = window.prompt("Masukkan URL gambar dari Image Bin (contoh: https://i.postimg.cc/.../image.png):");
    if (url && url.trim() !== '') {
      saveUrlToDb(assetId, url.trim());
    }
  };

  const handleImageChange = async (assetId: string, file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 25MB' });
      return;
    }

    setSavingKeys(prev => ({ ...prev, [assetId]: true }));
    setMessage({ type: 'info', text: 'Memampatkan gambar...' });

    try {
      // Compress image instead of storing raw base64
      const compressedBase64 = await compressImage(file, ASSET_KEYS.find(a => a.id === assetId)?.width || 1000);
      await saveUrlToDb(assetId, compressedBase64);
    } catch (err: any) {
      setMessage({ type: 'error', text: `Gagal memproses gambar: ${err.message}` });
      setSavingKeys(prev => ({ ...prev, [assetId]: false }));
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-stone-200 rounded w-1/4"></div>
      <div className="h-96 bg-stone-200 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Banner & Assets</h1>
        <p className="text-stone-500 mt-2">Kelola gambar utama yang tampil di website secara umum.</p>
      </div>

      {showRlsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">Akses Database Ditolak (Row-Level Security)</h3>
              <p className="mb-3">
                Supabase memblokir penyimpanan karena <strong>Row-Level Security (RLS)</strong> diaktifkan untuk tabel <code>settings</code>. Untuk memperbaikinya, jalankan kode SQL berikut di <strong>SQL Editor Supabase</strong> Anda:
              </p>
              <pre className="bg-red-900/10 text-red-900 p-3 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap select-all">
{`ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;`}
              </pre>
              <p className="mt-3 text-sm">
                *Atau matikan RLS pada tabel-tabel tersebut langsung melalui menu <strong>Table Editor</strong> -&gt; <strong>Settings</strong> di dashboard Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      {message.text && !showRlsError && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ASSET_KEYS.map((asset) => (
          <div key={asset.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-stone-900">{asset.label}</h3>
                <p className="text-xs text-stone-500 mt-1">Rekomendasi rasio/ukuran: {asset.width}x{asset.height}px</p>
              </div>
            </div>
            
            <div className="relative w-full aspect-video md:aspect-square bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 overflow-hidden flex items-center justify-center group mb-4">
              {assets[asset.id] ? (
                <Image src={assets[asset.id]} alt={asset.label} fill className="object-contain p-2" unoptimized />
              ) : (
                <div className="text-stone-400 flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Belum ada gambar</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <label className="cursor-pointer bg-white text-stone-900 font-medium px-4 py-2 rounded-lg text-sm hover:bg-stone-100 transition-colors shadow-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {savingKeys[asset.id] ? 'Memproses...' : 'Upload dari Komputer'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={savingKeys[asset.id]}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageChange(asset.id, e.target.files[0]);
                    }}
                  />
                </label>
                
                <button
                  type="button"
                  disabled={savingKeys[asset.id]}
                  onClick={() => handlePasteUrl(asset.id)}
                  className="bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Paste URL (Image Bin)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
