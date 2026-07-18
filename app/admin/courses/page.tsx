"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage, uploadToStorage, removeFromStorage, matchesSearchTerm } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Modal } from "@/components/admin/Modal";
import { withTimeout } from "@/lib/withTimeout";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Star,
  Download,
  GripVertical,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { courses as defaultCourses } from "@/app/data/courses";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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
  imageUrl?: string;
  video?: string;
  benefits: string[];
  createdAt?: string;
  orderIndex?: number;
}

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [students, setStudents] = useState<number>(0);
  const [duration, setDuration] = useState("");
  const [modules, setModules] = useState<number>(0);
  const [video, setVideo] = useState("");
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [isSignature, setIsSignature] = useState(false);
  const [orderIndex, setOrderIndex] = useState<number>(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    imageUrl?: string;
  } | null>(null);
  const [alertMsg, setAlertMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (alertMsg && !saving) {
      const timer = setTimeout(() => setAlertMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg, saving]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");

      if (error) {
        const errMsg = error.message || (error as any).toString();
        if (errMsg.includes("schema cache")) {
          console.warn("Supabase schema not initialized yet.");
        } else if (errMsg === 'Failed to fetch' || errMsg.includes('Failed to fetch')) {
          console.warn("AdBlocker or database connection issue. Courses fell back to empty.");
          setAlertMsg({
            type: "error",
            text: "Koneksi ke database diblokir. Harap matikan AdBlocker/Brave Shields untuk situs ini.",
          });
        } else {
          console.error("Error fetching courses:", errMsg);
        }
        setCourses([]);
      } else {
        const sortedData = [...(data as Course[])].sort((a: any, b: any) => {
          const indexA = a.orderIndex ?? a.orderindex ?? a.order_index ?? 0;
          const indexB = b.orderIndex ?? b.orderindex ?? b.order_index ?? 0;
          if (indexA !== indexB) {
            return indexA - indexB;
          }
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        });
        setCourses(sortedData);
      }
    } catch (err: any) {
      console.error("Network or unexpected error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();

    const channel = supabase
      .channel("public:courses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        fetchCourses,
      )
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
      setOriginalPrice(course.originalPrice || "");
      setStudents(course.students || 0);
      setDuration(course.duration || "");
      setModules(course.modules || 0);
      setVideo(course.video || "");
      setBenefits(
        course.benefits && course.benefits.length > 0 ? course.benefits : [""],
      );
      setIsSignature(course.isSignature || false);
      setImagePreview(course.imageUrl || "");
      const anyCourse = course as any;
      setOrderIndex(
        anyCourse.orderIndex ??
          anyCourse.orderindex ??
          anyCourse.order_index ??
          0,
      );
    } else {
      setEditingCourse(null);
      setSlug("");
      setTitle("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setStudents(0);
      setDuration("");
      setModules(0);
      setVideo("");
      setBenefits([""]);
      setIsSignature(false);
      setImagePreview("");
      setOrderIndex(0);
    }
    setImageFile(null);
    setUploadProgress(null);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const executeDelete = async (id: string, imageUrl?: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      if (imageUrl) await removeFromStorage(supabase, imageUrl);
      setCourses(prev => prev.filter(c => c.id !== id));
      setAlertMsg({ type: "success", text: "Kelas berhasil dihapus." });
    } catch (error: any) {
      console.error("delete error", error);
      setAlertMsg({ type: "error", text: `Gagal menghapus: ${error.message}` });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.index === destination.index) return;

    const previousCourses = courses;

    const newCourses = Array.from(courses);
    const [removed] = newCourses.splice(source.index, 1);
    newCourses.splice(destination.index, 0, removed);

    const updatedCourses = newCourses.map((course, idx) => ({
      ...course,
      orderIndex: idx + 1, // Start from 1 to make it visually friendly if needed, or 0
    }));

    setCourses(updatedCourses);

    try {
      const results = await Promise.all(
        updatedCourses.map((course) =>
          supabase
            .from("courses")
            .update({ orderIndex: course.orderIndex })
            .eq("id", course.id),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;
    } catch (err: any) {
      console.error("Failed to update order", err);
      setCourses(previousCourses);
      setAlertMsg({
        type: "error",
        text: "Gagal memperbarui urutan kelas di database. Urutan dikembalikan.",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setAlertMsg({ type: "error", text: "Ukuran gambar maksimal 25MB" });
        return;
      }
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
      if (file.type.startsWith("image/")) {
        if (file.size > 25 * 1024 * 1024) {
          setAlertMsg({ type: "error", text: "Ukuran gambar maksimal 25MB" });
          return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadProgress(null);
      } else {
        setAlertMsg({ type: "error", text: "Mohon upload file gambar." });
      }
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(null);
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const addBenefit = () => {
    setBenefits([...benefits, ""]);
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
      setAlertMsg({
        type: "error",
        text: "Mohon lengkapi Judul, Slug, Harga, dan Deskripsi.",
      });
      return;
    }

    setSaving(true);
    setAlertMsg({ type: "success", text: "Memulai proses penyimpanan..." });

    try {
      let imageUrl =
        imagePreview || "https://picsum.photos/seed/course/800/800";

      if (imageFile) {
        try {
          setAlertMsg({
            type: "success",
            text: "Tahap 1/2: Mengunggah gambar...",
          });
          setUploadProgress(20);
          const blob = await withTimeout(
            compressImage(imageFile, 800),
            300000,
            "Pemrosesan gambar memakan waktu terlalu lama (timeout setelah 5 menit).",
          );
          setUploadProgress(60);
          const path = `courses/${editingCourse?.id || "new"}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
          imageUrl = await withTimeout(
            uploadToStorage(supabase, blob, path),
            300000,
            "Unggah gambar memakan waktu terlalu lama. Periksa koneksi internet.",
          );
        } catch (uploadError: any) {
          console.error(
            "Image processing error:",
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError),
          );
          setAlertMsg({
            type: "error",
            text: `Gagal memproses gambar: ${uploadError.message}`,
          });
          setUploadProgress(null);
          setSaving(false);
          return;
        }
      }

      setAlertMsg({
        type: "success",
        text: "Tahap 2/2: Menyimpan data kelas...",
      });
      setUploadProgress(imageFile ? 80 : null);

      const baseCourseData = {
        slug,
        title,
        description,
        price,
        originalPrice: originalPrice || null,
        students,
        duration,
        modules,
        video: video || null,
        benefits,
        isSignature,
        imageUrl,
      };

      const trySave = async (dataPayload: any) => {
        if (editingCourse) {
          const { data, error } = await supabase
            .from("courses")
            .update(dataPayload)
            .eq("id", editingCourse.id)
            .select();
          if (error) throw error;
          if (!data || data.length === 0)
            throw new Error("row-level security policy or no rows updated");
        } else {
          const { data, error } = await supabase
            .from("courses")
            .insert({
              ...dataPayload,
              createdAt: new Date().toISOString(),
            })
            .select();
          if (error) throw error;
          if (!data || data.length === 0)
            throw new Error("row-level security policy or no rows inserted");
        }
      };

      try {
        await withTimeout(
          trySave({ ...baseCourseData, orderIndex }),
          300000,
          "Gagal menyimpan: Timeout.",
        );
        fetchCourses();
        setAlertMsg({
          type: "success",
          text: editingCourse
            ? "Kelas berhasil diperbarui!"
            : "Kelas berhasil ditambahkan!",
        });
      } catch (err: any) {
        console.error("Save course error details:", err);
        throw err;
      }

      setUploadProgress(100);
      setTimeout(() => {
        handleCloseModal();
        setSaving(false);
      }, 1000);
    } catch (error: any) {
      console.error(
        "Error saving course:",
        error instanceof Error ? error.message : String(error),
      );
      const errorMsgDetails = error?.details || error?.message || "";
      if (errorMsgDetails.includes("row-level security policy")) {
        setAlertMsg({
          type: "error",
          text: "Permission denied while saving. Please contact the site administrator.",
        });
      } else if (errorMsgDetails === "Failed to fetch") {
        setAlertMsg({
          type: "error",
          text: `Gagal menyimpan kelas: Koneksi terputus. Harap matikan AdBlocker/Brave Shields.`,
        });
      } else if (
        error?.code === "PGRST204" ||
        (error?.message && error.message.includes("Could not find")) ||
        (error?.details && error.details.includes("Could not find"))
      ) {
        setAlertMsg({
          type: "error",
          text: "Gagal menyimpan: skema database belum lengkap. Hubungi administrator situs.",
        });
      } else {
        setAlertMsg({
          type: "error",
          text: `GAGAL MENYIMPAN: ${error?.message || "Unknown error"}. Details: ${error?.details || ""} - Hint: ${error?.hint || ""}`,
        });
      }
      setSaving(false);
    }
  };

  const filteredCourses = useMemo(
    () => courses.filter((course: any) => matchesSearchTerm(searchTerm, [course.title])),
    [courses, searchTerm]
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="h-96 bg-stone-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {alertMsg && (
        <div
          className={`p-4 rounded-xl flex flex-col items-start ${
            alertMsg.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-start justify-between w-full">
            <span className="font-medium whitespace-pre-wrap">
              {alertMsg.text}
            </span>
            <button
              onClick={() => setAlertMsg(null)}
              className="p-1 hover:bg-black/5 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Manajemen Kelas</h1>
          <p className="text-stone-500 mt-2">
            Kelola daftar kelas online yang tersedia.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Kelas
          </button>
        </div>
      </div>

      <div className="max-w-sm">
        <label htmlFor="course-search" className="sr-only">Cari kelas</label>
        <input
          id="course-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan judul..."
          className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {searchTerm.trim() !== "" && (
          <p className="text-xs text-stone-500 mt-1">
            Urutan drag-and-drop dinonaktifkan saat pencarian aktif.
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-center w-16"></th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  No. Urut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Murid
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <Droppable
              droppableId="courses-list"
              isDropDisabled={searchTerm.trim() !== ""}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <tbody
                  className="bg-white divide-y divide-stone-200"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-stone-500"
                      >
                        {courses.length === 0
                          ? 'Belum ada kelas. Klik "Tambah Kelas" untuk mulai.'
                          : "Tidak ada kelas yang cocok dengan pencarian."}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course: any, index: number) => (
                      <Draggable
                        key={course.id}
                        draggableId={course.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`hover:bg-stone-50 transition-colors ${snapshot.isDragging ? "bg-stone-50 shadow-lg" : "bg-white"}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div
                                {...provided.dragHandleProps}
                                className="inline-block p-2 cursor-grab text-stone-400 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                              >
                                <GripVertical className="w-5 h-5 mx-auto" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 text-center font-mono">
                              {course.orderIndex ??
                                course.orderindex ??
                                course.order_index ??
                                0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 relative rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                                  {course.imageUrl ? (
                                    <Image
                                      src={course.imageUrl}
                                      alt={course.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-stone-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-stone-900 flex items-center">
                                    {course.title}
                                    {course.isSignature && (
                                      <Star className="w-3 h-3 ml-2 text-orange-500 fill-current" />
                                    )}
                                  </div>
                                  <div className="text-sm text-stone-500">
                                    /{course.slug}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-stone-900 font-medium">
                                {course.price}
                              </div>
                              {course.originalPrice && (
                                <div className="text-xs text-stone-500 line-through">
                                  {course.originalPrice}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                              {course.students}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleOpenModal(course)}
                                aria-label={`Edit ${course.title}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    id: course.id,
                                    title: course.title,
                                    imageUrl: course.imageUrl,
                                  })
                                }
                                aria-label={`Delete ${course.title}`}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Hapus Kelas?"
          maxWidthClassName="max-w-sm"
          footer={
            <>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  executeDelete(deleteConfirm.id, deleteConfirm.imageUrl);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </>
          }
        >
          <p className="text-stone-500">
            Apakah Anda yakin ingin menghapus kelas &quot;
            {deleteConfirm.title}&quot;? Tindakan ini tidak dapat dibatalkan.
          </p>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingCourse ? "Edit Kelas" : "Tambah Kelas Baru"}
              </h2>
              <button
                onClick={handleCloseModal}
                aria-label="Close dialog"
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Judul Kelas *
                    </label>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Slug (URL) *
                    </label>
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
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Harga *
                      </label>
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
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Harga Coret (Opsional)
                      </label>
                      <input
                        type="text"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="Rp 499.000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Jml Murid
                      </label>
                      <input
                        type="number"
                        value={students}
                        onChange={(e) => setStudents(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Durasi
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="60 Menit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Modul
                      </label>
                      <input
                        type="number"
                        value={modules}
                        onChange={(e) => setModules(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1 text-orange-600">
                        Urutan (No)
                      </label>
                      <input
                        type="number"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-orange-200 bg-orange-50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        placeholder="0"
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
                      <span className="text-sm font-medium text-stone-700">
                        Tandai sebagai Signature Class
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Link Video (Opsional)
                    </label>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Foto Kelas *
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? "border-orange-500 bg-orange-50" : "border-stone-300"} border-dashed rounded-xl hover:border-orange-500 transition-colors relative overflow-hidden group`}
                    >
                      {imagePreview ? (
                        <div className="absolute inset-0 w-full h-full">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                            <p className="text-white font-medium">
                              Klik atau drop untuk mengubah
                            </p>
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
                          <ImageIcon
                            className={`mx-auto h-12 w-12 ${isDragging ? "text-orange-500" : "text-stone-400"}`}
                          />
                          <div className="flex text-sm text-stone-600 justify-center">
                            <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-orange-600 hover:text-orange-500">
                              Upload a file atau drag and drop
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            PNG, JPG up to 25MB
                          </p>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Deskripsi *
                    </label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Deskripsi kelas..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Apa yang akan dipelajari (Benefits)
                </label>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) =>
                          handleBenefitChange(index, e.target.value)
                        }
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
                    "Simpan Kelas"
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
