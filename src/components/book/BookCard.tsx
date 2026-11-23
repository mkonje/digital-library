// src/components/book/BookCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Heart, BookOpen, Star, Lock } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

export interface BookItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;
  category_name?: string;
  category_slug?: string;
  language: string;
  file_size: number;
  cover_url?: string | null;
  is_premium: number;
  price: number;
  reads_count: number;
  downloads_count: number;
  rating: number;
}

interface BookCardProps {
  book: BookItem;
  viewMode?: 'grid' | 'list';
  onFavoriteToggle?: (bookId: string, newState: boolean) => void;
  isFavorited?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode = 'grid',
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [favorite, setFavorite] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setFavLoading(true);
    try {
      const res = await fetch(`/api/user/favorites/${book.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFavorite(data.isFavorite);
        if (onFavoriteToggle) onFavoriteToggle(book.id, data.isFavorite);
      }
    } finally {
      setFavLoading(false);
    }
  };

  const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  const coverImage = book.cover_url || defaultCover;

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-charcoal-200/80 dark:border-charcoal-800/80 bg-white dark:bg-charcoal-900 hover:shadow-md transition-all duration-200">
        <Link
          to={`/books/${book.slug}`}
          className="shrink-0 w-full sm:w-32 aspect-[3/4] rounded-lg overflow-hidden book-spine-effect shadow-subtle group-hover:shadow-book transition-shadow"
        >
          <img
            src={coverImage}
            alt={book.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {book.is_premium === 1 ? (
                <Badge variant="premium" size="sm">
                  <span className="flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {t.book.premium}
                  </span>
                </Badge>
              ) : (
                <Badge variant="free" size="sm">
                  {t.book.free}
                </Badge>
              )}
              {book.category_name && (
                <Badge variant="default" size="sm">
                  {book.category_name}
                </Badge>
              )}
              <span className="text-xs text-charcoal-400">
                {book.language === 'sw' ? 'Kiswahili' : 'English'}
              </span>
            </div>

            <Link to={`/books/${book.slug}`}>
              <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors line-clamp-1">
                {book.title}
              </h3>
            </Link>

            <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mt-0.5">
              {book.author}
            </p>

            {book.description && (
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2 line-clamp-2 leading-relaxed">
                {book.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-charcoal-100 dark:border-charcoal-800">
            <div className="flex items-center gap-4 text-xs text-charcoal-500 dark:text-charcoal-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-charcoal-400" />
                {book.reads_count}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-charcoal-400" />
                {book.downloads_count}
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {book.rating ? book.rating.toFixed(1) : '5.0'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFavoriteClick}
                disabled={favLoading}
                className={`p-2 rounded-lg border transition-colors ${
                  favorite
                    ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900'
                    : 'text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 border-charcoal-200 dark:border-charcoal-800'
                }`}
                title={t.book.addToFavorites}
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
              </button>

              <Link
                to={`/read/${book.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-terracotta-600 hover:bg-terracotta-700 text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t.book.readOnline}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-charcoal-200/80 dark:border-charcoal-800/80 bg-white dark:bg-charcoal-900 hover:shadow-elevated transition-all duration-300 p-3">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden book-spine-effect bg-warm-100 dark:bg-charcoal-800">
        <Link to={`/books/${book.slug}`} className="block w-full h-full">
          <img
            src={coverImage}
            alt={book.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges on top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {book.is_premium === 1 ? (
            <Badge variant="premium" size="sm" className="shadow-sm backdrop-blur-md bg-amber-500/90 text-white border-0">
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                {t.book.premium}
              </span>
            </Badge>
          ) : (
            <Badge variant="free" size="sm" className="shadow-sm backdrop-blur-md bg-emerald-600/90 text-white border-0">
              {t.book.free}
            </Badge>
          )}
        </div>

        {/* Favorite Button on top right */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md shadow-sm transition-transform active:scale-90 ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-charcoal-900/80 text-charcoal-600 dark:text-charcoal-300 hover:text-red-500'
          }`}
          title={t.book.addToFavorites}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between pt-3.5">
        <div>
          {book.category_name && (
            <span className="text-[11px] font-medium tracking-wider uppercase text-terracotta-600 dark:text-terracotta-400 block mb-1">
              {book.category_name}
            </span>
          )}

          <Link to={`/books/${book.slug}`}>
            <h3 className="font-editorial text-base font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors line-clamp-2 leading-snug">
              {book.title}
            </h3>
          </Link>

          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 mt-1 line-clamp-1">
            {book.author}
          </p>
        </div>

        {/* Interaction stats & Quick Read */}
        <div className="pt-3 mt-3 border-t border-charcoal-100 dark:border-charcoal-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[11px] text-charcoal-400 dark:text-charcoal-500">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {book.reads_count}
            </span>
            <span className="flex items-center gap-0.5">
              <Download className="w-3 h-3" />
              {book.downloads_count}
            </span>
          </div>

          <Link
            to={`/read/${book.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 dark:hover:text-terracotta-300 group-hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t.book.readOnline}
          </Link>
        </div>
      </div>
    </div>
  );
};
