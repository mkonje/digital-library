// src/pages/PdfReader.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  Moon,
  Sun,
  Sidebar,
  RotateCcw,
  Lock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const PdfReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams] = useSearchParams();
  const initialPageParam = parseInt(searchParams.get('page') || '1', 10);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [accessAllowed, setAccessAllowed] = useState(true);
  const [accessReason, setAccessReason] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPageParam);
  const [pageInput, setPageInput] = useState(initialPageParam.toString());
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkReader, setDarkReader] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageRendering, setPageRendering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch metadata and check access
  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setErrorMsg(null);

    fetch(`/api/read/${bookId}/info`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Kitabu hakikupatikana');
        return res.json();
      })
      .then((data) => {
        setBookInfo(data.book);
        if (!data.access?.allowed) {
          setAccessAllowed(false);
          setAccessReason(data.access?.reason || 'Kitabu hiki kinahitaji usajili wa premium');
          setLoading(false);
          return;
        }

        if (data.readingProgress?.current_page && initialPageParam === 1) {
          setCurrentPage(data.readingProgress.current_page);
          setPageInput(data.readingProgress.current_page.toString());
        }

        // Load PDF document from secure stream endpoint
        loadPdfDocument();
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Hitilafu ya kupakia kitabu');
        setLoading(false);
      });
  }, [bookId]);

  // 2. Load PDF with PDF.js
  const loadPdfDocument = () => {
    setLoading(true);
    setErrorMsg(null);

    const loadingTask = pdfjsLib.getDocument({
      url: `/api/read/${bookId}/file`,
      withCredentials: true,
    });

    loadingTask.promise
      .then((doc) => {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PDF.js loading error:', err);
        setErrorMsg('Imeshindwa kupakia faili la PDF. Tafadhali jaribu tena.');
        setLoading(false);
      });
  };

  // 3. Render Page on Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      setPageRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate responsive viewport scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Save progress if authenticated
        if (isAuthenticated && bookId) {
          fetch(`/api/user/reading-progress/${bookId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPage: pageNum, totalPages: pdfDoc.numPages }),
            credentials: 'include',
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      } finally {
        setPageRendering(false);
      }
    },
    [pdfDoc, scale, isAuthenticated, bookId]
  );

  // Render when currentPage, pdfDoc or scale changes
  useEffect(() => {
    if (pdfDoc && !loading) {
      renderPage(currentPage);
      setPageInput(currentPage.toString());
    }
  }, [pdfDoc, currentPage, scale, renderPage, loading]);

  // Page Navigation Handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(2.5, prev + 0.2));
  const zoomOut = () => setScale((prev) => Math.max(0.6, prev - 0.2));
  const fitWidth = () => {
    if (containerRef.current && pdfDoc) {
      const containerWidth = containerRef.current.clientWidth - 48;
      setScale(Math.max(0.6, containerWidth / 600));
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // 4. Access Denied Screen for Premium Books
  if (!accessAllowed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
            Ufikiaji Umezuiwa (Access Restricted)
          </h2>
          <p className="text-sm text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
            {accessReason}
          </p>
          <div className="pt-3 space-y-2.5">
            <Link to="/#plans" className="block w-full">
              <Button variant="primary" className="w-full">
                Jiunge na Kifurushi cha Premium
              </Button>
            </Link>
            <Link to={bookInfo?.slug ? `/books/${bookInfo.slug}` : '/books'} className="block w-full">
              <Button variant="ghost" className="w-full text-xs">
                Rudi Kwenye Maelezo ya Kitabu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-screen overflow-hidden ${
        darkReader ? 'bg-charcoal-950 text-white' : 'bg-warm-100 text-charcoal-900'
      }`}
    >
      {/* Top Reader Controls Bar */}
      <header className="h-14 border-b border-charcoal-200 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 max-w-[40%]">
          <button
            onClick={() => navigate(bookInfo?.slug ? `/books/${bookInfo.slug}` : '/books')}
            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title="Rudi"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h1 className="font-editorial text-sm font-bold truncate text-charcoal-900 dark:text-white">
              {bookInfo?.title || 'PDF Reader'}
            </h1>
            <p className="text-[10px] text-charcoal-500 dark:text-charcoal-400 truncate">
              {bookInfo?.author}
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || pageRendering}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 disabled:opacity-40 transition-colors"
            title={t.reader.previousPage}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 text-xs">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-10 text-center py-1 rounded border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
            />
            <span className="text-charcoal-500">/ {totalPages}</span>
          </form>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || pageRendering}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 disabled:opacity-40 transition-colors"
            title={t.reader.nextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom, Thumbnails, Dark Mode, Download, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Out */}
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title={t.reader.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="hidden sm:inline-block text-xs font-medium text-charcoal-500 w-11 text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title={t.reader.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkReader(!darkReader)}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title={darkReader ? t.reader.lightTheme : t.reader.darkTheme}
          >
            {darkReader ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Download button */}
          <a
            href={`/api/download/${bookId}`}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title={t.reader.downloadPdf}
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            title={isFullscreen ? t.reader.exitFullscreen : t.reader.fullscreen}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reader Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-charcoal-950/80 z-30">
            <Loader2 className="w-10 h-10 animate-spin text-terracotta-600 mb-3" />
            <p className="text-sm font-medium text-charcoal-600 dark:text-charcoal-300">
              {t.reader.loadingPdf}
            </p>
          </div>
        )}

        {/* Error Screen */}
        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-30">
            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 shadow-xl max-w-sm text-center space-y-4">
              <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
              <Button variant="primary" size="sm" onClick={loadPdfDocument} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                {t.reader.retry}
              </Button>
            </div>
          </div>
        )}

        {/* Canvas Scroll Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
          <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block max-w-full" />
            {pageRendering && (
              <div className="absolute inset-0 bg-white/50 dark:bg-charcoal-950/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-terracotta-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
