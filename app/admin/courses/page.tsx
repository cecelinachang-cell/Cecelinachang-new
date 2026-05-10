'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Star, Download } from 'lucide-react';
import Image from 'next/image';
import { courses as defaultCourses } from '@/app/data/courses';

interface Course {
  id: string;
  slug: string;
  isSignature: boolean;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  students: number;
  duration: string;
  modules: number;
  image: string;
  video?: string;
  benefits: string[];
  createdAt?: string;
}

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
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64String = canvas.toDataURL('image/jpeg', 0.6);
        resolve(base64String);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form State
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [students, setStudents] = useState<number>(0);
  const [duration, setDuration] = useState('');
  const [modules, setModules] = useState<number>(0);
  const [video, setVideo] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [isSignature, setIsSignature] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, title: string} | null>(null);
  const [alertMsg, setAlertMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (alertMsg && !saving) {
      const timer = setTimeout(() => setAlertMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg, saving]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('createdAt', { ascending: true });
        
      if (error) {
        if (error.message && error.message.includes('schema cache')) {
           console.warn('Supabase schema not initialized yet.');
        } else {
           console.error('Error fetching courses:', error.message || error);
        }
        setCourses([]);
      } else {
        setCourses(data as Course[]);
      }
      setLoading(false);
    };

    fetchCourses();
    
    const channel = supabase
      .channel('public:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchCourses)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setSlug(course.slug);
      setTitle(course.title);
      setDescription(course.description);
      setPrice(course.price);
      setOriginalPrice(course.originalPrice || '');
      setStudents(course.students || 0);
      setDuration(course.duration || '');
      setModules(course.modules || 0);
      setVideo(course.video || '');
      setBenefits(course.benefits && course.benefits.length > 0 ? course.benefits : ['']);
      setIsSignature(course.isSignature || false);
      setImagePreview(course.image || '');
    } else {
      setEditingCourse(null);
      setSlug('');
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setStudents(0);
      setDuration('');
      setModules(0);
      setVideo('');
      setBenefits(['']);
      setIsSignature(false);
      setImagePreview('');
    }
    setImageFile(null);
    setUploadProgress(null);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const executeDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      setAlertMsg({ type: 'success', text: 'Kelas berhasil dihapus.' });
    } catch (error: any) {
       console.error('delete error', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadProgress(null);
      } else {
        setAlertMsg({ type: 'error', text: 'Mohon upload file gambar.' });
      }
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(null);
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) {
      const newBenefits = benefits.filter((_, i) => i !== index);
      setBenefits(newBenefits);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !price.trim() || !description.trim()) {
      setAlertMsg({ type: 'error', text: 'Mohon lengkapi Judul, Slug, Harga, dan Deskripsi.' });
      return;
    }
    
    setSaving(true);
    setAlertMsg({ type: 'success', text: 'Memulai proses penyimpanan...' });

    try {
      let imageUrl = imagePreview || 'https://picsum.photos/seed/course/800/800';

      if (imageFile) {
        try {
          setAlertMsg({ type: 'success', text: 'Tahap 1/2: Memproses gambar...' });
          setUploadProgress(20);
          const base64String = await compressImageToBase64(imageFile);
          setUploadProgress(60);
          imageUrl = base64String;
        } catch (uploadError: any) {
          console.error('Image processing error:', uploadError instanceof Error ? uploadError.message : String(uploadError));
          setAlertMsg({ type: 'error', text: `Gagal memproses gambar: ${uploadError.message}` });
          setUploadProgress(null);
          setSaving(false);
          return;
        }
      }

      setAlertMsg({ type: 'success', text: 'Tahap 2/2: Menyimpan data kelas...' });
      setUploadProgress(imageFile ? 80 : null);

      const courseData = {
        slug,
        title,
        description,
        price,
        imageUrl,
      };

      if (editingCourse) {
        const { error: updateErr } = await supabase.from('courses').update(courseData).eq('id', editingCourse.id);
        if (updateErr) throw updateErr;
        setAlertMsg({ type: 'success', text: 'Kelas berhasil diperbarui!' });
      } else {
        const { error: insertErr } = await supabase.from('courses').insert({
          ...courseData,
          createdAt: new Date().toISOString()
        });
        if (insertErr) throw insertErr;
        setAlertMsg({ type: 'success', text: 'Kelas berhasil ditambahkan!' });
      }

      setUploadProgress(100);
      setTimeout(() => {
        handleCloseModal();
        setSaving(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error saving course:', error instanceof Error ? error.message : String(error));
      if (error && error.message && error.message.includes('row-level security policy')) {
         setAlertMsg({ type: 'error', text: `Database Error: Row Level Security is enabled. Please go to your Supabase SQL Editor and run: "ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;"` });
      } else {
         setAlertMsg({ type: 'error', text: `Gagal menyimpan kelas: ${error.message || "Unknown error"}` });
      }
      setSaving(false);
    }
  };

  const seedData = async () => {
    setSaving(true);
    setAlertMsg({ type: 'success', text: 'Menambahkan data awal...' });
    try {
      for (const course of defaultCourses) {
        await supabase.from('courses').insert({
          slug: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          originalPrice: course.originalPrice || '',
          students: course.students,
          duration: course.duration,
          modules: course.modules,
          image: course.image,
          video: course.video || '',
          benefits: course.benefits,
          isSignature: course.isSignature || false,
          createdAt: new Date().toISOString()
        });
      }
      setAlertMsg({ type: 'success', text: 'Data awal berhasil ditambahkan!' });
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setAlertMsg({ type: 'error', text: `Gagal menambahkan data: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-stone-200 rounded w-1/4"></div>
      <div className="h-96 bg-stone-200 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {alertMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between ${
          alertMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="font-medium">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="p-1 hover:bg-black/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Manajemen Kelas</h1>
          <p className="text-stone-500 mt-2">Kelola daftar kelas online yang tersedia.</p>
        </div>
        <div className="flex gap-3">
          {courses.length === 0 && (
            <button
              onClick={seedData}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5 mr-2" /> Load Data Awal
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Kelas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Murid</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                  Belum ada kelas. Klik &quot;Tambah Kelas&quot; untuk mulai.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 relative rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                        {course.image ? (
                          <Image src={course.image} alt={course.title} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-stone-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900 flex items-center">
                          {course.title}
                          {course.isSignature && <Star className="w-3 h-3 ml-2 text-orange-500 fill-current" />}
                        </div>
                        <div className="text-sm text-stone-500">/{course.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900 font-medium">{course.price}</div>
                    {course.originalPrice && (
                      <div className="text-xs text-stone-500 line-through">{course.originalPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {course.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(course)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({id: course.id, title: course.title})}
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
            <h3 className="text-lg font-bold text-stone-900 mb-2">Hapus Kelas?</h3>
            <p className="text-stone-500 mb-6">
              Apakah Anda yakin ingin menghapus kelas &quot;{deleteConfirm.title}&quot;? Tindakan ini tidak dapat dibatalkan.
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
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingCourse ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button onClick={handleCloseModal} className="text-stone-400 hover:text-stone-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Judul Kelas *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="Contoh: Kelas Bakso Sapi Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL) *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="Contoh: bakso-sapi-premium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Harga *</label>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="Rp 199.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Harga Coret (Opsional)</label>
                      <input
                        type="text"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="Rp 499.000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Jml Murid</label>
                      <input
                        type="number"
                        value={students}
                        onChange={(e) => setStudents(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Durasi</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="60 Menit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Modul</label>
                      <input
                        type="number"
                        value={modules}
                        onChange={(e) => setModules(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSignature}
                        onChange={(e) => setIsSignature(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-stone-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-stone-700">Tandai sebagai Signature Class</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Link Video (Opsional)</label>
                    <input
                      type="url"
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="https://jumpshare.com/embed/..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Foto Kelas *</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-stone-300'} border-dashed rounded-xl hover:border-orange-500 transition-colors relative overflow-hidden group`}
                    >
                      {imagePreview ? (
                        <div className="absolute inset-0 w-full h-full">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <p className="text-white font-medium">Klik atau drop untuk mengubah</p>
                            {imagePreview && (
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition relative z-20 pointer-events-auto"
                              >
                                Hapus Gambar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center pointer-events-none">
                          <ImageIcon className={`mx-auto h-12 w-12 ${isDragging ? 'text-orange-500' : 'text-stone-400'}`} />
                          <div className="flex text-sm text-stone-600 justify-center">
                            <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-orange-600 hover:text-orange-500">
                              Upload a file atau drag and drop
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title=""
                        required={!editingCourse && !imagePreview}
                      />
                      
                      {uploadProgress !== null && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-200">
                          <div
                            className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Deskripsi *</label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                      placeholder="Deskripsi kelas..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Apa yang akan dipelajari (Benefits)</label>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder={`Materi ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        disabled={benefits.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="mt-2 text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Tambah Materi
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Kelas'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
