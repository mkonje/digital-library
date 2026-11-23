// src/pages/admin/AdminNews.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Newspaper, Eye, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminNews: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    cover_url: '',
    is_featured: false,
    is_published: true,
  });

  const fetchNews = () => {
    setLoading(true);
    fetch('/api/admin/news', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setNews(data.news || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ title: '', summary: '', content: '', cover_url: '', is_featured: false, is_published: true });
        fetchNews();
      } else {
        setError(data.error || 'Hitilafu ya kuunda makala');
      }
    } catch {
      setError('Hitilafu ya mtandao');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Je, una uhakika unataka kufuta makala haya?')) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Usimamizi wa Habari & Makala
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Chapisha matangazo, makala za kielimu, na taarifa za mfumo
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Andika Makala Mapya
        </Button>
      </div>

      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Kichwa cha Habari</th>
              <th className="py-3 px-4 font-semibold">Mwandishi</th>
              <th className="py-3 px-4 font-semibold">Hali</th>
              <th className="py-3 px-4 font-semibold">Tarehe</th>
              <th className="py-3 px-4 font-semibold text-right">Vitendo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4 font-bold text-charcoal-900 dark:text-white max-w-sm truncate">
                  {item.title}
                </td>
                <td className="py-3 px-4 text-charcoal-500">{item.author_name}</td>
                <td className="py-3 px-4">
                  <Badge variant={item.is_published ? 'success' : 'neutral'} size="sm">
                    {item.is_published ? 'Imechapishwa' : 'Draft'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-charcoal-400">
                  {new Date(item.created_at).toLocaleDateString('sw-TZ')}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Chapisha Makala Mapya" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Kichwa cha Habari"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Muhtasari wa Haraka (Summary)"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
          />

          <Input
            label="Picha ya Jalada (Cover Image URL)"
            value={formData.cover_url}
            onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
            placeholder="https://..."
          />

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Maudhui Kamili ya Makala
            </label>
            <textarea
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-3 text-xs bg-white dark:bg-charcoal-900"
              required
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded text-terracotta-600"
              />
              <span>Weka kama Makala Iliyoangaziwa (Featured)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded text-terracotta-600"
              />
              <span>Chapisha Mara Moja (Published)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Ghairi
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Hifadhi Makala
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
