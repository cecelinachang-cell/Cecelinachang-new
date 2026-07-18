'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage, uploadToStorage } from '@/lib/utils';
import { withTimeout } from '@/lib/withTimeout';
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

export default function AssetsManager() {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showRlsError, setShowRlsError] = useState(false);
  const [urlInputFor, setUrlInputFor] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');

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

  const submitUrl = () => {
    const trimmed = urlValue.trim();
    if (trimmed && urlInputFor) saveUrlToDb(urlInputFor, trimmed);
    setUrlValue('');
    setUrlInputFor(null);
  };

  const handleImageChange = async (assetId: string, file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 25MB' });
      return;
    }

    setSavingKeys(prev => ({ ...prev, [assetId]: true }));
    setMessage({ type: 'info', text: 'Memampatkan gambar...' });

    try {
      const blob = await compressImage(file, ASSET_KEYS.find(a => a.id === assetId)?.width || 1000);
      const path = `assets/${assetId}/${Date.now()}.webp`;
      const publicUrl = await uploadToStorage(supabase, blob, path);
      await saveUrlToDb(assetId, publicUrl);
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
              <h3 className="font-bold text-lg mb-1">Akses Database Ditolak</h3>
              <p>
                Penyimpanan ditolak oleh database karena izin tidak mencukupi. Hubungi administrator situs untuk memperbaiki hak akses akun Anda.
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
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
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
                  onClick={() => setUrlInputFor(asset.id)}
                  className="bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Paste URL (Image Bin)
                </button>
              </div>
            </div>

            {urlInputFor === asset.id && (
              <div className="flex gap-2">
                <label htmlFor={`url-input-${asset.id}`} className="sr-only">
                  Image URL for {asset.label}
                </label>
                <input
                  id={`url-input-${asset.id}`}
                  type="url"
                  autoFocus
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitUrl();
                    }
                    if (e.key === 'Escape') {
                      setUrlInputFor(null);
                      setUrlValue('');
                    }
                  }}
                  placeholder="https://i.postimg.cc/.../image.png"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={submitUrl}
                  className="px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  aria-label="Cancel URL input"
                  onClick={() => {
                    setUrlInputFor(null);
                    setUrlValue('');
                  }}
                  className="px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
