'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  imageUrl: string;
  createdAt?: string;
  name?: string;
  text?: string;
  rating?: number;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string} | null>(null);
  const [alertMsg, setAlertMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    image: '',
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('createdAt', { ascending: false });
        
      if (error) {
        if (error.message && error.message.includes('schema cache')) {
           console.warn('Supabase schema not initialized yet.');
        } else {
           console.error('Error fetching testimonials:', error.message || error);
        }
        setTestimonials([]);
      } else {
        setTestimonials(data as Testimonial[]);
      }
      setLoading(false);
    };

    fetchTestimonials();
    
    const channel = supabase
      .channel('public:testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchTestimonials)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            resolve(dataUrl);
          } else {
            reject(new Error("Failed to get canvas context"));
          }
        };
        img.onerror = (error) => reject(new Error("Failed to load image: " + String(error)));
      };
      reader.onerror = (error) => reject(new Error("Failed to read file: " + String(error)));
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlertMsg({ type: 'error', text: 'Ukuran gambar maksimal 5MB' });
        return;
      }
      try {
        const base64String = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, image: base64String }));
      } catch (error: any) {
        console.error('Error processing image:', error.message || String(error));
        setAlertMsg({ type: 'error', text: 'Gagal memproses gambar. Silakan coba lagi.' });
      }
    }
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        image: testimonial.imageUrl || '',
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        image: '',
      });
    }
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({
      image: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      setAlertMsg({ type: 'error', text: 'Foto testimoni wajib diunggah.' });
      return;
    }

    setSaving(true);
    setAlertMsg(null);

    try {
      const testimonialData = {
        imageUrl: formData.image,
        name: 'Customer',
        text: 'Photo review',
        rating: 5,
      };

      if (editingTestimonial) {
        const { error: updateErr } = await supabase.from('testimonials').update(testimonialData).eq('id', editingTestimonial.id);
        if (updateErr) throw updateErr;
        setAlertMsg({ type: 'success', text: 'Testimoni berhasil diperbarui!' });
      } else {
        const { error: insertErr } = await supabase.from('testimonials').insert({
          ...testimonialData,
          createdAt: new Date().toISOString()
        });
        if (insertErr) throw insertErr;
        setAlertMsg({ type: 'success', text: 'Testimoni berhasil ditambahkan!' });
      }
      
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      if (error && error.message && error.message.includes('row-level security policy')) {
         setAlertMsg({ type: 'error', text: `Database Error: Row Level Security is enabled. Please go to your Supabase SQL Editor and run: "ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;"` });
      } else {
         setAlertMsg({ type: 'error', text: `Gagal menyimpan testimoni: ${error.message}` });
      }
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      const { error: deleteErr } = await supabase.from('testimonials').delete().eq('id', id);
      if (deleteErr) throw deleteErr;
      setAlertMsg({ type: 'success', text: 'Testimoni berhasil dihapus!' });
    } catch (error: any) {
      console.error(error);
      setAlertMsg({ type: 'error', text: `Gagal menghapus testimoni: ${error.message}` });
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-stone-200 rounded w-1/4"></div>
      <div className="h-64 bg-stone-200 rounded-2xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Manajemen Testimoni</h1>
          <p className="text-stone-500 mt-2">Kelola testimoni pelanggan yang tampil di halaman utama.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Testimoni
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Foto Testimoni</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Tanggal Ditambahkan</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-stone-500">
                  Belum ada testimoni. Klik &quot;Tambah Testimoni&quot; untuk mulai.
                </td>
              </tr>
            ) : (
              testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-20 w-20 relative rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                      {testimonial.imageUrl ? (
                        <Image src={testimonial.imageUrl} alt="Testimoni" fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-500">
                      {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(testimonial)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({id: testimonial.id})}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Hapus Testimoni?</h3>
            <p className="text-stone-500 mb-6">
              Apakah Anda yakin ingin menghapus foto testimoni ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  executeDelete(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
              </h2>
              <button onClick={handleCloseModal} className="text-stone-400 hover:text-stone-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {alertMsg && (
                <div className={`p-4 rounded-lg ${alertMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {alertMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Foto Testimoni *</label>
                  <div className="flex flex-col gap-4">
                    <div className="w-full aspect-square max-w-xs relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                      {formData.image ? (
                        <Image src={formData.image} alt="Preview" fill className="object-contain" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-stone-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                      <p className="text-xs text-stone-500 mt-2">Format: JPG, PNG. Maksimal 5MB. Disarankan screenshot chat atau foto review.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
