// src/pages/admin/AdminBooks.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category_id: '',
    language: 'sw',
    publication_year: '',
    publisher: '',
    isbn: '',
    is_premium: false,
    price: 0,
    is_featured: false,
    is_published: true,
  });

  const fetchBooks = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory) params.set('category_id', selectedCategory);

    fetch(`/api/admin/books?${params.toString()}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books || []);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);

    fetchBooks(1);
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(1);
  };

  const openEditModal = (book: any) => {
    setActiveBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      category_id: book.category_id || '',
      language: book.language || 'sw',
      publication_year: book.publication_year ? book.publication_year.toString() : '',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      is_premium: Boolean(book.is_premium),
      price: book.price || 0,
      is_featured: Boolean(book.is_featured),
      is_published: Boolean(book.is_published),
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook) return;

    try {
      const res = await fetch(`/api/admin/books/${activeBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publication_year: formData.publication_year ? parseInt(formData.publication_year, 10) : null,
          price: Number(formData.price),
        }),
        credentials: 'include',
      });

      if (res.ok) {
        setEditModalOpen(false);
        fetchBooks(pagination.page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!activeBook) return;
    try {
      const res = await fetch(`/api/admin/books/${activeBook.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchBooks(pagination.page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyUrl = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Usimamizi wa Vitabu
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Hariri metadata, badilisha kategoria, weka bei, au dhibiti faili za R2
          </p>
        </div>
        <Link to="/admin/upload">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Pakia Vitabu Vipya
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kitabu au mwandishi..."
            className="w-full rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-terracotta-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-charcoal-400" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 py-2 px-3 text-xs focus:outline-none"
          >
            <option value="">Kategoria Zote</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={() => fetchBooks(1)} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Onyesha Upya
          </Button>
        </div>
      </div>

      {/* Books Table */}
      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
                <th className="py-3 px-4 font-semibold">Kitabu</th>
                <th className="py-3 px-4 font-semibold">Kategoria</th>
                <th className="py-3 px-4 font-semibold">Ufikiaji</th>
                <th className="py-3 px-4 font-semibold">Mwingiliano</th>
                <th className="py-3 px-4 font-semibold">Faili & Ukubwa</th>
                <th className="py-3 px-4 font-semibold text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
              {books.map((b) => {
                const sizeMb = (b.file_size / (1024 * 1024)).toFixed(2);
                const publicUrl = `${window.location.origin}/books/${b.slug}`;
                const downloadUrl = `${window.location.origin}/api/download/${b.id}`;

                return (
                  <tr key={b.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                          alt={b.title}
                          className="w-9 h-12 object-cover rounded shadow-xs"
                        />
                        <div className="max-w-[220px]">
                          <Link to={`/books/${b.slug}`} className="font-bold text-charcoal-900 dark:text-white hover:text-terracotta-600 truncate block">
                            {b.title}
                          </Link>
                          <span className="text-[11px] text-charcoal-500 truncate block">{b.author}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-400 font-medium">
                      {b.category_name || '-'}
                    </td>

                    <td className="py-3 px-4">
                      {b.is_premium ? (
                        <Badge variant="premium" size="sm">
                          TZS {b.price?.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="free" size="sm">Bure</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-charcoal-500">
                      <div className="space-y-0.5">
                        <span className="block">{b.reads_count} reads</span>
                        <span className="block">{b.downloads_count} downloads</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-500">
                      <span className="font-mono text-[10px] block truncate max-w-[140px]" title={b.file_key}>
                        {b.file_key}
                      </span>
                      <span className="text-[10px] text-charcoal-400">{sizeMb} MB</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copyUrl(publicUrl, `pub-${b.id}`)}
                          className="p-1.5 rounded-lg border border-charcoal-200 dark:border-charcoal-800 text-charcoal-500 hover:text-charcoal-900"
                          title="Nakili Kiungo cha Kitabu"
                        >
                          {copiedId === `pub-${b.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg border border-charcoal-200 dark:border-charcoal-800 text-charcoal-600 hover:text-terracotta-600"
                          title="Hariri Taarifa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setActiveBook(b);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                          title="Futa Kitabu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Hariri Taarifa za Kitabu" maxWidth="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Jina la Kitabu"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mwandishi"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Kategoria
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 py-2.5 px-3 text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Maelezo ya Kitabu
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Mwaka wa Chapisho"
              value={formData.publication_year}
              onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
              placeholder="2024"
            />
            <Input
              label="Mchapishaji"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />
            <Input
              label="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-xl bg-warm-100 dark:bg-charcoal-800 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="rounded text-terracotta-600"
              />
              <span className="font-semibold">Kitabu cha Premium (Malipo / Usajili)</span>
            </label>
            {formData.is_premium && (
              <Input
                label="Bei (TZS)"
                type="number"
                value={formData.price.toString()}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
              Ghairi
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Hifadhi Mabadiliko
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Futa Kitabu" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 dark:text-charcoal-400">
            Je, una uhakika unataka kufuta kitabu <strong>{activeBook?.title}</strong>? Kitendo hiki kitaondoa taarifa zote na faili kwenye R2.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>Ghairi</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Ndio, Futa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
