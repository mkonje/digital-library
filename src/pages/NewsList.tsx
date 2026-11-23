// src/pages/NewsList.tsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Newspaper, Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { Badge } from '../components/ui/Badge';

export const NewsList: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [articles, setArticles] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = categoryParam !== 'all' ? `/api/news?category=${categoryParam}` : '/api/news';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setFeatured(data.featured || null);
        setCategories(data.categories || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryParam]);

  const selectCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-200 dark:border-terracotta-800 mb-3">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Matangazo na Makala</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal-900 dark:text-white">
          Habari na Makala za MaktabaYetu
        </h1>
        <p className="text-base text-charcoal-500 dark:text-charcoal-400 mt-2 leading-relaxed">
          Pata taarifa za hivi punde kuhusu jukwaa, vitabu vipya vilivyoongezwa, mbinu za usomaji bora, na maendeleo ya elimu ya kidijitali.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-charcoal-200/60 dark:border-charcoal-800 text-xs">
        <button
          onClick={() => selectCategory('all')}
          className={`px-3.5 py-1.5 rounded-full transition-colors ${
            categoryParam === 'all'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold'
              : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-charcoal-800 hover:border-charcoal-400'
          }`}
        >
          Habari Zote
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full transition-colors ${
              categoryParam === cat.slug
                ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold'
                : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-charcoal-800 hover:border-charcoal-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Featured Article Card */}
      {featured && categoryParam === 'all' && (
        <div className="rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {featured.cover_url && (
              <div className="lg:col-span-6 aspect-[16/10] overflow-hidden bg-warm-100">
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`p-8 lg:p-12 space-y-4 ${featured.cover_url ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              <div className="flex items-center gap-2">
                <Badge variant="premium">Makala Iliyoangaziwa</Badge>
                {featured.category_name && <Badge variant="default">{featured.category_name}</Badge>}
              </div>

              <Link to={`/news/${featured.slug}`}>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white hover:text-terracotta-600 transition-colors leading-tight">
                  {featured.title}
                </h2>
              </Link>

              <p className="text-sm text-charcoal-600 dark:text-charcoal-400 leading-relaxed line-clamp-3">
                {featured.summary}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-charcoal-100 dark:border-charcoal-800 text-xs text-charcoal-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {featured.author_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(featured.published_at).toLocaleDateString('sw-TZ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art) => (
          <Link
            key={art.id}
            to={`/news/${art.slug}`}
            className="group flex flex-col rounded-2xl overflow-hidden border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:shadow-elevated transition-all"
          >
            {art.cover_url && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-warm-100">
                <img
                  src={art.cover_url}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-terracotta-600 dark:text-terracotta-400 uppercase tracking-widest block mb-2">
                  {art.category_name || 'Habari'}
                </span>
                <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-charcoal-100 dark:border-charcoal-800 text-[11px] text-charcoal-400 flex items-center justify-between">
                <span>{art.author_name}</span>
                <span>{new Date(art.published_at).toLocaleDateString('sw-TZ')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
