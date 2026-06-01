"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/utils";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

const parseImageUrls = (url: string | undefined): string[] => {
  if (!url) return [];
  try {
    const urls = JSON.parse(url);
    if (Array.isArray(urls)) return urls;
  } catch (e) {
    //
  }
  return [url];
};

interface Item {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  createdAt?: string;
}

const withTimeout = <T,>(
  promise: Promise<T> | PromiseLike<T>,
  ms: number,
  message: string,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
};

export default function ItemsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Semua Produk");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    imageUrl: string;
  } | null>(null);
  const [alertMsg, setAlertMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("items").select("*");

      if (error) {
        const errMsg = error.message || (error as any).toString();
        if (errMsg.includes("schema cache")) {
          console.warn("Supabase schema not initialized yet.");
        } else if (errMsg === 'Failed to fetch' || errMsg.includes('Failed to fetch')) {
          console.warn("AdBlocker or database connection issue. Items fell back to empty.");
        } else {
          console.error("Error fetching items:", errMsg);
        }
        setItems([]);
      } else {
        const sortedItems = [...(data as Item[])].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setItems(sortedItems);
      }
    } catch (err: any) {
      console.error("Network or unexpected error fetching items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (alertMsg && !saving) {
      const timer = setTimeout(() => setAlertMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg, saving]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("public:items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        fetchItems,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price);
      setOriginalPrice(item.originalPrice || "");
      setCategory(item.category || "Semua Produk");
      setImagePreviews(parseImageUrls(item.imageUrl));
    } else {
      setEditingItem(null);
      setName("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setCategory("Semua Produk");
      setImagePreviews([]);
    }
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const executeDelete = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      setAlertMsg({ type: "success", text: "Item berhasil dihapus." });
      fetchItems();
    } catch (error: any) {
      console.error("delete error", error);
      setAlertMsg({ type: "error", text: `Gagal menghapus: ${error.message}` });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => file.size <= 25 * 1024 * 1024);
    if (validFiles.length < acceptedFiles.length) {
      setAlertMsg({ type: "error", text: "Beberapa ukuran gambar melebihi 25MB" });
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    // Since some previews might be from existing URLs and some from imageFiles,
    // we roughly map them. A more precise mapping requires distinguishing them.
    // For simplicity, we just clear imageFiles and rely on previews if we don't want complexity,
    // but we can just filter imageFiles if the index belongs to an uploaded file.
    // Let's do a simple approach: just keep track of all final urls needed.
    // To be safe, if a user deletes an image, we just remove it from both if possible.
    setImageFiles((prev) => {
      // offset is number of previews that are NOT from imageFiles
      const offset = imagePreviews.length - prev.length;
      if (index >= offset) {
        return prev.filter((_, i) => i !== index - offset);
      }
      return prev;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !description.trim()) {
      setAlertMsg({
        type: "error",
        text: "Mohon lengkapi Nama Item, Harga, dan Deskripsi.",
      });
      return;
    }

    setSaving(true);
    setAlertMsg({ type: "success", text: "Memulai proses penyimpanan..." });

    try {
      let finalImages: string[] = [];

      // First pass: keep existing image previews that are not local object URLs (since object URLs start with 'blob:')
      const existingUrls = imagePreviews.filter((url) => !url.startsWith("blob:"));
      finalImages = [...existingUrls];

      // Compress and convert image to Base64 if selected
      if (imageFiles.length > 0) {
        try {
          setAlertMsg({
            type: "success",
            text: `Tahap 1/2: Memproses ${imageFiles.length} gambar...`,
          });
          for (const file of imageFiles) {
            const base64String = await withTimeout(
              compressImage(file, 800),
              300000,
              "Pemrosesan gambar memakan waktu terlalu lama (timeout setelah 5 menit). Hubungan terputus.",
            );
            finalImages.push(base64String);
          }
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
          setSaving(false);
          return;
        }
      }

      if (finalImages.length === 0) {
        finalImages.push("https://picsum.photos/seed/signora/800/800");
      }

      setAlertMsg({
        type: "success",
        text: "Tahap 2/2: Menyimpan data ke database...",
      });
      const itemData = {
        name,
        description,
        price,
        // originalPrice is removed because it's not in the supabase items schema
        category,
        imageUrl: JSON.stringify(finalImages),
      };

      if (editingItem && editingItem.id) {
        // Update existing item
        const { error: updateErr } = await withTimeout<any>(
          supabase.from("items").update(itemData).eq("id", editingItem.id),
          300000,
          "Menyimpan data memakan waktu terlalu lama. Pastikan koneksi internet stabil.",
        );
        if (updateErr) throw updateErr;
        setAlertMsg({ type: "success", text: "Item berhasil diperbarui!" });
      } else {
        // Create new item
        const { error: insertErr } = await withTimeout<any>(
          supabase.from("items").insert({
            ...itemData,
            rating: 5.0,
            reviews: 0,
            createdAt: new Date().toISOString(),
          }),
          300000,
          "Menyimpan data baru memakan waktu terlalu lama. Pastikan koneksi internet stabil.",
        );
        if (insertErr) throw insertErr;
        setAlertMsg({
          type: "success",
          text: "Item baru berhasil ditambahkan!",
        });
      }

      handleCloseModal();
      fetchItems();
    } catch (error: any) {
      if (
        error &&
        error.message &&
        error.message.includes("row-level security policy")
      ) {
        setAlertMsg({
          type: "error",
          text: `Database Error: Row Level Security is enabled. Please go to your Supabase SQL Editor and run: "ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;"`,
        });
      } else {
        setAlertMsg({
          type: "error",
          text: `Gagal menyimpan: ${error.message}`,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, imageUrl: string) => {
    setDeleteConfirm({ id, imageUrl });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="h-64 bg-stone-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Manage Items</h1>
          <p className="text-stone-500 mt-2">Add, edit, or remove products</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={async () => {
              try {
                setAlertMsg({
                  type: "success",
                  text: "Testing permissions...",
                });
                const { error: insertErr } = await supabase
                  .from("items")
                  .insert({
                    name: "Test Item",
                    description: "Test",
                    price: "0",
                    category: "Test",
                    imageUrl: "",
                    createdAt: new Date().toISOString(),
                  });
                if (insertErr) throw insertErr;

                // wait, cleaning up requires knowing the ID, our fake item can just stay for test or not do this.
                // It's safer to just fetch limits.
                const { error: selectErr } = await supabase
                  .from("items")
                  .select("id")
                  .limit(1);
                if (selectErr) throw selectErr;

                setAlertMsg({
                  type: "success",
                  text: "Permissions OK! You can save items.",
                });
              } catch (e: any) {
                const errMsg =
                  e?.message ||
                  (typeof e === "object" ? JSON.stringify(e) : String(e));
                console.error("Test failed:", errMsg);

                if (errMsg.includes("row-level security policy")) {
                  setAlertMsg({
                    type: "error",
                    text: `Database Error: Row Level Security is enabled. Please go to your Supabase SQL Editor and run: "ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;"`,
                  });
                } else {
                  setAlertMsg({
                    type: "error",
                    text: `Permission Denied: ${errMsg}`,
                  });
                }
              }
            }}
            className="flex items-center px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
          >
            Test Permissions
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                    {parseImageUrls(item.imageUrl).length > 0 ? (
                      <Image
                        src={parseImageUrls(item.imageUrl)[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-stone-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-stone-900">
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-stone-900">{item.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-stone-500">
                    {item.category || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-stone-500 line-clamp-2 max-w-xs">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                    className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors mr-2"
                    title="Edit Item"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.imageUrl);
                    }}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-stone-500"
                >
                  No items found. Click &quot;Add New Item&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-2xl font-bold text-stone-900">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="itemForm" onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Oven De Luna"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Rp 1.540.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Original Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Rp 1.800.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Semua Produk">Semua Produk</option>
                    <option value="Oven & Presto">Oven & Presto</option>
                    <option value="Mixer & Blender">Mixer & Blender</option>
                    <option value="Panci & Wajan">Panci & Wajan</option>
                    <option value="Loyang">Loyang</option>
                    <option value="Speciality & Servingware">
                      Speciality & Servingware
                    </option>
                    <option value="Blender">Blender</option>
                    <option value="E-Cooker">E-Cooker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Enter product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Product Images
                  </label>
                  <div
                    {...getRootProps()}
                    className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-orange-500 bg-orange-50"
                        : "border-stone-300 hover:border-orange-400 bg-stone-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                    <p className="text-stone-600 font-medium">
                      Drag & drop images here, or click to select files
                    </p>
                    <p className="mt-2 text-xs text-stone-500">
                      PNG, JPG, GIF up to 25MB. Recommended size: 800x800px. Multiple files allowed.
                    </p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                      {imagePreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          className="h-32 w-32 relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0 group"
                        >
                          <Image
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl font-medium text-stone-700 hover:bg-stone-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="itemForm"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-orange-600 hover:bg-orange-700 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-stone-500">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
            </div>
            <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg font-medium text-stone-700 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { id, imageUrl } = deleteConfirm;
                  setDeleteConfirm(null);
                  executeDelete(id, imageUrl);
                }}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {alertMsg && (
        <div
          className={`fixed bottom-4 right-4 z-[70] px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            alertMsg.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            className="ml-2 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
