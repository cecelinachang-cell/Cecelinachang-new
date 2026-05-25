'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const withTimeout = <T,>(promise: Promise<T> | PromiseLike<T>, ms: number, message: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
};

export default function Settings() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'general').single();
        if (!error && data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setLogoPreview(data.logo_url || '');
        }
      } catch (err: any) {
        console.error('Network or unexpected error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    
    // Subscribe to updates
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchSettings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let logoUrl = logoPreview;

      if (logoFile) {
        // Convert to base64
        const reader = new FileReader();
        logoUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
      }

      const { error } = await withTimeout<any>(
        supabase.from('settings').upsert({
          id: 'general',
          title,
          description,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        }),
        300000,
        'Simpan pengaturan memakan waktu terlalu lama (timeout 5 menit). Koneksi lambat?'
      );

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-stone-200 rounded w-1/4"></div>
      <div className="h-96 bg-stone-200 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Website Settings</h1>
        <p className="text-stone-500 mt-2">Manage your website&apos;s general information</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Website Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g. Cece Lina Chang Baking"
            />
            <p className="mt-2 text-sm text-stone-500">This appears in the browser tab and search engines.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Website Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Brief description of your website..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Website Logo</label>
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 relative rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-300 flex-shrink-0">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">No logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors cursor-pointer"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Recommended size: 200x200px (PNG with transparent background).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center px-6 py-3 rounded-xl font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
