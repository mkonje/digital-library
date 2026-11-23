// src/pages/admin/AdminCategories.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'BookOpen',
    sort_order: 0,
  });

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setActiveCat(null);
    setFormData({ name: '', slug: '', description: '', icon: 'BookOpen', sort_order: categories.length + 1 });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setIsEditing(true);
    setActiveCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'BookOpen',
      sort_order: cat.sort_order || 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const url = isEditing ? `/api/admin/categories/${activeCat.id}` : '/api/admin/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
      } else {
        setError(data.error || 'Hitilafu');
      }
    } catch {
      setError('Hitilafu ya mtandao');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Je, una uhakika unataka kufuta kategoria hii?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        fetchCategories();
      } else {
        alert(data.error || 'Haiwezi kufuta');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Usimamizi wa Kategoria
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Unda na panga kategoria za machapisho, hariri slugs na maelezo
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Kategoria Mpya
        </Button>
      </div>

      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Mpangilio</th>
              <th className="py-3 px-4 font-semibold">Jina la Kategoria</th>
              <th className="py-3 px-4 font-semibold">Slug</th>
              <th className="py-3 px-4 font-semibold">Idadi ya Vitabu</th>
              <th className="py-3 px-4 font-semibold text-right">Vitendo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4 text-charcoal-400 font-mono">{c.sort_order}</td>
                <td className="py-3 px-4 font-bold text-charcoal-900 dark:text-white">{c.name}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-charcoal-500">{c.slug}</td>
                <td className="py-3 px-4 text-charcoal-600 font-medium">{c.books_count || 0}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg border border-charcoal-200 dark:border-charcoal-800 text-charcoal-600 hover:text-terracotta-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Hariri Kategoria' : 'Ongeza Kategoria Mpya'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Jina la Kategoria"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              setFormData({ ...formData, name, slug: isEditing ? formData.slug : slug });
            }}
            required
          />

          <Input
            label="Slug (URL Path)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Maelezo Fupi
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Aikoni (Icon)
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs"
              >
                <option value="BookOpen">BookOpen</option>
                <option value="Newspaper">Newspaper</option>
                <option value="Heart">Heart</option>
                <option value="GraduationCap">GraduationCap</option>
                <option value="Award">Award</option>
                <option value="Cpu">Cpu</option>
                <option value="FlaskConical">FlaskConical</option>
                <option value="FileText">FileText</option>
                <option value="Folder">Folder</option>
              </select>
            </div>
            <Input
              label="Mpangilio (Sort Order)"
              type="number"
              value={formData.sort_order.toString()}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Ghairi
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Hifadhi Kategoria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
