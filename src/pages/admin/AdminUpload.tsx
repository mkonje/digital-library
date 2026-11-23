// src/pages/admin/AdminUpload.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

interface UploadItem {
  id: string;
  file: File;
  title: string;
  author: string;
  categoryId: string;
  isPremium: boolean;
  price: number;
  language: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  fileKey?: string;
  error?: string;
}

export const AdminUpload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const cleanFilenameToTitle = (filename: string): string => {
    return filename
      .replace(/\.pdf$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const addFiles = (files: FileList | File[]) => {
    const defaultCat = categories[0]?.id || 'cat_tech';
    const newItems: UploadItem[] = Array.from(files)
      .filter((file) => {
        // Validate PDF type
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      })
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        title: cleanFilenameToTitle(file.name),
        author: 'Mwandishi Asiyejulikana',
        categoryId: defaultCat,
        isPremium: false,
        price: 0,
        language: 'sw',
        progress: 0,
        status: 'pending',
      }));

    if (newItems.length === 0) {
      setGlobalMessage({ type: 'error', text: 'Tafadhali chagua faili za PDF pekee.' });
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
    setGlobalMessage(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemField = (id: string, field: keyof UploadItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Upload single item to R2
  const uploadSingleItem = async (item: UploadItem): Promise<{ success: boolean; fileKey?: string; error?: string }> => {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('type', 'book');

    try {
      updateItemField(item.id, 'status', 'uploading');
      updateItemField(item.id, 'progress', 50);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload error');
      }

      updateItemField(item.id, 'progress', 100);
      updateItemField(item.id, 'status', 'success');
      updateItemField(item.id, 'fileKey', data.fileKey);

      return { success: true, fileKey: data.fileKey };
    } catch (err: any) {
      updateItemField(item.id, 'status', 'error');
      updateItemField(item.id, 'error', err.message);
      return { success: false, error: err.message };
    }
  };

  // Upload and Save all books to R2 and D1 database
  const handleBulkSubmit = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setGlobalMessage(null);

    const readyItems: any[] = [];

    for (const item of items) {
      let fileKey = item.fileKey;

      if (!fileKey || item.status !== 'success') {
        const uploadResult = await uploadSingleItem(item);
        if (!uploadResult.success) {
          continue; // Skip failed uploads
        }
        fileKey = uploadResult.fileKey;
      }

      readyItems.push({
        title: item.title,
        author: item.author,
        category_id: item.categoryId,
        language: item.language,
        file_key: fileKey,
        file_type: 'application/pdf',
        file_size: item.file.size,
        is_premium: item.isPremium ? 1 : 0,
        price: item.price,
      });
    }

    if (readyItems.length > 0) {
      try {
        const res = await fetch('/api/admin/books/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: readyItems }),
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setGlobalMessage({
            type: 'success',
            text: `Vitabu ${data.count} vimepakiwa na kuhifadhiwa kikamilifu kwenye maktaba!`,
          });
          setTimeout(() => navigate('/admin/books'), 2000);
        } else {
          setGlobalMessage({ type: 'error', text: data.error || 'Imeshindwa kusajili vitabu kwenye D1' });
        }
      } catch (err: any) {
        setGlobalMessage({ type: 'error', text: err.message || 'Hitilafu ya kuwasiliana na seva' });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
          Upakiaji wa Vitabu (Bulk Upload)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Buruta na dondosha mafaili mengi ya PDF kwa wakati mmoja, weka taarifa zao, kisha pakia moja kwa moja kwenye Cloudflare R2
        </p>
      </div>

      {globalMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            globalMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200'
          }`}
        >
          {globalMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{globalMessage.text}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/30'
            : 'border-charcoal-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-charcoal-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white">
          Bofya hapa au Buruta na Udondoshe faili za PDF
        </h3>
        <p className="text-xs text-charcoal-500 mt-1">
          Unaweza kuchagua vitabu vingi kwa mara moja (PDF tu, hadi 50MB kwa kila faili)
        </p>
      </div>

      {/* Uploaded Items Queue */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">
              Vitabu Vilivyochaguliwa ({items.length})
            </h3>
            <Button
              variant="primary"
              size="md"
              onClick={handleBulkSubmit}
              isLoading={isSubmitting}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Hifadhi Vitabu Vyote kwenye Maktaba
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4"
              >
                {/* File info bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 truncate max-w-sm">
                        {item.file.name}
                      </p>
                      <span className="text-[10px] text-charcoal-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'success' && (
                      <Badge variant="success" size="sm">Tayari Imehifadhiwa R2</Badge>
                    )}
                    {item.status === 'uploading' && (
                      <Badge variant="warning" size="sm">Inapakia...</Badge>
                    )}
                    {item.status === 'error' && (
                      <Badge variant="neutral" size="sm" className="text-red-500">Hitilafu</Badge>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-charcoal-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Fields Form */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                  <div className="sm:col-span-5">
                    <Input
                      label="Jina la Kitabu"
                      value={item.title}
                      onChange={(e) => updateItemField(item.id, 'title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Input
                      label="Mwandishi"
                      value={item.author}
                      onChange={(e) => updateItemField(item.id, 'author', e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                      Kategoria
                    </label>
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItemField(item.id, 'categoryId', e.target.value)}
                      className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 py-2.5 px-3 text-xs text-charcoal-800 dark:text-charcoal-200 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs text-charcoal-700 dark:text-charcoal-300 py-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isPremium}
                        onChange={(e) => updateItemField(item.id, 'isPremium', e.target.checked)}
                        className="rounded text-terracotta-600 focus:ring-terracotta-500"
                      />
                      <span>Ni Premium?</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
