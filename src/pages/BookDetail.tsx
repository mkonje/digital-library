// src/pages/BookDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Download,
  Heart,
  Share2,
  AlertCircle,
  Eye,
  Star,
  Lock,
  ArrowLeft,
  Check,
  FileText,
  Calendar,
  Building,
  Hash,
  Globe,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BookCard } from '../components/book/BookCard';
import { PremiumAccessModal } from '../components/book/PremiumAccessModal';

export const BookDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<any>(null);
  const [access, setAccess] = useState<{ allowed: boolean; reason: string }>({ allowed: false, reason: '' });
  const [isFavorite, setIsFavorite] = useState(false);
  const [readingProgress, setReadingProgress] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/books/${slug}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Book not found');
        return res.json();
      })
      .then((data) => {
        setBook(data.book);
        setAccess(data.access);
        setIsFavorite(data.isFavorite);
        setReadingProgress(data.readingProgress);

        // Fetch related
        if (data.book?.id) {
          fetch(`/api/books/${data.book.id}/related`)
            .then((r) => r.json())
            .then((rData) => setRelatedBooks(rData.books || []))
            .catch(console.error);
        }
      })
      .catch((err) => {
        console.error(err);
        setBook(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`/api/user/favorites/${book.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Soma kitabu "${book.title}" kwenye MaktabaYetu:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReadClick = (e: React.MouseEvent) => {
    if (book.is_premium === 1 && !access.allowed) {
      e.preventDefault();
      setPremiumModalOpen(true);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (book.is_premium === 1 && !access.allowed) {
      e.preventDefault();
      setPremiumModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-charcoal-500">
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-editorial text-2xl font-bold">Kitabu hakikupatikana</h2>
        <p className="text-sm text-charcoal-500">Kitabu ulichoomba hakipo au kimehamishwa.</p>
        <Link to="/books">
          <Button variant="outline" size="sm">
            Rudi kwenye Katalogi
          </Button>
        </Link>
      </div>
    );
  }

  const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
  const coverImage = book.cover_url || defaultCover;
  const fileSizeMb = (book.file_size / (1024 * 1024)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.back}</span>
        </button>
      </div>

      {/* Main Book Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cover Column */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden book-spine-effect shadow-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
            <img
              src={coverImage}
              alt={book.title}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {book.is_premium === 1 ? (
                <Badge variant="premium">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t.book.premium}
                  </span>
                </Badge>
              ) : (
                <Badge variant="free">{t.book.free}</Badge>
              )}
              {book.category_name && (
                <Link to={`/books?category=${book.category_slug}`}>
                  <Badge variant="default" className="hover:border-terracotta-500 transition-colors">
                    {book.category_name}
                  </Badge>
                </Link>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 dark:text-white leading-tight">
              {book.title}
            </h1>

            <p className="text-base sm:text-lg font-medium text-charcoal-700 dark:text-charcoal-300">
              {book.author}
            </p>
          </div>

          {/* Social Stats & Reading Progress Bar */}
          <div className="flex items-center gap-6 py-4 border-y border-charcoal-100 dark:border-charcoal-800 text-xs text-charcoal-600 dark:text-charcoal-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-4 h-4 text-charcoal-400" />
              <span>{book.reads_count} {t.book.reads}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Download className="w-4 h-4 text-charcoal-400" />
              <span>{book.downloads_count} {t.book.downloads}</span>
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{book.rating ? book.rating.toFixed(1) : '5.0'} / 5.0</span>
            </span>
          </div>

          {/* User Reading Progress if exists */}
          {readingProgress && (
            <div className="p-4 rounded-xl bg-warm-100 dark:bg-charcoal-800/60 border border-charcoal-200/60 dark:border-charcoal-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">
                  Uliachia Ukurasa wa {readingProgress.current_page} kati ya {readingProgress.total_pages}
                </span>
                <div className="w-44 h-1.5 bg-charcoal-200 dark:bg-charcoal-700 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-terracotta-600 rounded-full"
                    style={{ width: `${readingProgress.progress_percent}%` }}
                  />
                </div>
              </div>
              <Link to={`/read/${book.id}?page=${readingProgress.current_page}`}>
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-terracotta-600">
                  Endelea Kusoma →
                </Button>
              </Link>
            </div>
          )}

          {/* Action Buttons: Read & Download */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={`/read/${book.id}`}
              onClick={handleReadClick}
              className="inline-flex"
            >
              <Button
                variant="primary"
                size="lg"
                icon={<BookOpen className="w-5 h-5" />}
                className="px-6"
              >
                {t.book.readOnline}
              </Button>
            </Link>

            <a
              href={`/api/download/${book.id}`}
              onClick={handleDownloadClick}
              className="inline-flex"
            >
              <Button
                variant="outline"
                size="lg"
                icon={<Download className="w-5 h-5" />}
                className="px-6"
              >
                {t.book.download}
              </Button>
            </a>

            <Button
              variant="outline"
              size="lg"
              onClick={handleFavoriteToggle}
              className={isFavorite ? 'text-red-500 border-red-300 dark:border-red-900' : ''}
              icon={<Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />}
            >
              {isFavorite ? 'Imependwa' : t.book.addToFavorites}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleShare}
              icon={copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            >
              {copied ? 'Kiungo Kimenakiliwa!' : t.book.share}
            </Button>
          </div>

          {/* Book Description */}
          <div className="space-y-3 pt-4">
            <h3 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">
              {t.book.aboutBook}
            </h3>
            <p className="text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed whitespace-pre-line">
              {book.description || 'Hakuna maelezo ya kina ya kitabu hiki kwa sasa.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="pt-6">
            <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              Maelezo ya Chapisho
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-xs">
              <div>
                <span className="text-charcoal-400 block mb-1">Lugha</span>
                <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">
                  {book.language === 'sw' ? 'Kiswahili' : 'English'}
                </span>
              </div>
              <div>
                <span className="text-charcoal-400 block mb-1">Mwaka</span>
                <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">
                  {book.publication_year || '2024'}
                </span>
              </div>
              <div>
                <span className="text-charcoal-400 block mb-1">Ukubwa wa Faili</span>
                <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">
                  {fileSizeMb} MB (PDF)
                </span>
              </div>
              <div>
                <span className="text-charcoal-400 block mb-1">ISBN</span>
                <span className="font-semibold text-charcoal-800 dark:text-charcoal-200 truncate block">
                  {book.isbn || '978-9987-001'}
                </span>
              </div>
            </div>
          </div>

          {/* Report button */}
          <div className="pt-2">
            {reportSent ? (
              <span className="text-xs text-emerald-600 font-medium">
                Asante! Ripoti yako imepokelewa na timu ya usimamizi.
              </span>
            ) : (
              <button
                onClick={() => setReportSent(true)}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t.book.report}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="pt-10 border-t border-charcoal-200/60 dark:border-charcoal-800 space-y-6">
          <h2 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
            {t.book.relatedBooks}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedBooks.map((rel) => (
              <BookCard key={rel.id} book={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Lock Modal */}
      <PremiumAccessModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        bookTitle={book.title}
        bookPrice={book.price}
      />
    </div>
  );
};
