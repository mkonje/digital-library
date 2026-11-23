// src/pages/Books.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { BookCard, BookItem } from '../components/book/BookCard';
import { BookCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const Books: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search and Filter states
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const isPremiumParam = searchParams.get('is_premium') || '';
  const languageParam = searchParams.get('language') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Fetch categories for filtering
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Fetch books with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryParam !== 'all') params.set('category', categoryParam);
    if (searchParam) params.set('search', searchParam);
    if (isPremiumParam) params.set('is_premium', isPremiumParam);
    if (languageParam) params.set('language', languageParam);
    if (sortParam) params.set('sort', sortParam);
    params.set('page', pageParam.toString());
    params.set('limit', '12');

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books || []);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryParam, searchParam, isPremiumParam, languageParam, sortParam, pageParam]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchQuery.trim());
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-charcoal-200/60 dark:border-charcoal-800">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
          {t.catalogue.title}
        </h1>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
          {t.catalogue.subtitle}
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-4">
        {/* Top bar: Search + View Mode */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.hero.searchPlaceholder}
              className="w-full rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 pl-10 pr-20 py-2.5 text-sm text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-charcoal-400" />
            <Button type="submit" variant="ghost" size="sm" className="absolute right-1.5 top-1.5 text-xs">
              Tafuta
            </Button>
          </form>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-charcoal-500 whitespace-nowrap">{t.catalogue.sortBy}:</span>
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="rounded-lg border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 py-1.5 px-3 text-xs text-charcoal-800 dark:text-charcoal-200 focus:outline-none focus:border-terracotta-500"
              >
                <option value="newest">{t.catalogue.sortNewest}</option>
                <option value="popular">{t.catalogue.sortPopular}</option>
                <option value="reads">{t.catalogue.sortReads}</option>
                <option value="downloads">{t.catalogue.sortDownloads}</option>
                <option value="title">{t.catalogue.sortTitle}</option>
              </select>
            </div>

            {/* Grid / List Mode */}
            <div className="flex items-center border border-charcoal-200 dark:border-charcoal-800 rounded-lg p-0.5 bg-white dark:bg-charcoal-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white' : 'text-charcoal-400'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-900 dark:text-white' : 'text-charcoal-400'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => updateFilter('category', 'all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              categoryParam === 'all'
                ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold'
                : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-charcoal-800 hover:border-charcoal-400'
            }`}
          >
            {t.catalogue.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                categoryParam === cat.slug
                  ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-charcoal-800 hover:border-charcoal-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Access & Language */}
        <div className="flex items-center gap-4 text-xs text-charcoal-600 dark:text-charcoal-400 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            <span>Ufikiaji:</span>
            <button
              onClick={() => updateFilter('is_premium', '')}
              className={`px-2 py-0.5 rounded ${isPremiumParam === '' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              Zote
            </button>
            <span>•</span>
            <button
              onClick={() => updateFilter('is_premium', '0')}
              className={`px-2 py-0.5 rounded ${isPremiumParam === '0' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              Bure Tu
            </button>
            <span>•</span>
            <button
              onClick={() => updateFilter('is_premium', '1')}
              className={`px-2 py-0.5 rounded ${isPremiumParam === '1' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              Premium Tu
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Lugha:</span>
            <button
              onClick={() => updateFilter('language', '')}
              className={`px-2 py-0.5 rounded ${languageParam === '' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              Zote
            </button>
            <span>•</span>
            <button
              onClick={() => updateFilter('language', 'sw')}
              className={`px-2 py-0.5 rounded ${languageParam === 'sw' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              Kiswahili
            </button>
            <span>•</span>
            <button
              onClick={() => updateFilter('language', 'en')}
              className={`px-2 py-0.5 rounded ${languageParam === 'en' ? 'font-bold text-terracotta-600 underline' : 'hover:text-charcoal-900'}`}
            >
              English
            </button>
          </div>

          {(categoryParam !== 'all' || searchParam || isPremiumParam || languageParam) && (
            <button
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              {t.catalogue.resetFilters}
            </button>
          )}
        </div>
      </div>

      {/* Book Grid / List */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title={t.catalogue.noBooksFound}
          description={t.catalogue.noBooksDesc}
          actionText={t.catalogue.resetFilters}
          onAction={resetAllFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {books.map((book) => (
            <BookCard key={book.id} book={book} viewMode="list" />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-10 border-t border-charcoal-200/60 dark:border-charcoal-800">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => updateFilter('page', (pagination.page - 1).toString())}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Uliopita
          </Button>

          <span className="text-xs text-charcoal-600 dark:text-charcoal-400">
            Ukurasa {pagination.page} kati ya {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateFilter('page', (pagination.page + 1).toString())}
          >
            <span>Ujao</span>
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
