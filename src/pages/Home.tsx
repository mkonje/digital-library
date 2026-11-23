// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Newspaper,
  Heart,
  GraduationCap,
  Award,
  Cpu,
  FlaskConical,
  FileText,
  Folder,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Button } from '../components/ui/Button';
import { BookCard, BookItem } from '../components/book/BookCard';
import { BookCardSkeleton } from '../components/ui/Skeleton';

// Map icon string to Lucide component
const categoryIconMap: Record<string, React.ReactNode> = {
  Newspaper: <Newspaper className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Folder: <Folder className="w-5 h-5" />,
};

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<BookItem[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookItem[]>([]);
  const [latestBooks, setLatestBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featRes, popRes, latRes, catRes, newsRes, plansRes] = await Promise.all([
          fetch('/api/books/featured'),
          fetch('/api/books/popular'),
          fetch('/api/books/latest'),
          fetch('/api/categories'),
          fetch('/api/news'),
          fetch('/api/subscriptions/plans'),
        ]);

        const [featData, popData, latData, catData, newsData, plansData] = await Promise.all([
          featRes.json(),
          popRes.json(),
          latRes.json(),
          catRes.json(),
          newsRes.json(),
          plansRes.json(),
        ]);

        setFeaturedBooks(featData.books || []);
        setPopularBooks(popData.books || []);
        setLatestBooks(latData.books || []);
        setCategories(catData.categories || []);
        setNews(newsData.articles?.slice(0, 3) || []);
        setPlans(plansData.plans || []);
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden border-b border-charcoal-200/60 dark:border-charcoal-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-50 dark:bg-terracotta-950/50 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-200/50 dark:border-terracotta-800/50">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.hero.tagline}</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 dark:text-white leading-[1.12]">
                Gundua, Soma, na Pakua <span className="italic font-normal text-terracotta-600 dark:text-terracotta-400">Maarifa</span> Bila Mipaka.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 dark:text-charcoal-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.hero.description}
              </p>

              {/* Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="relative flex items-center shadow-elevated rounded-2xl bg-white dark:bg-charcoal-900 border border-charcoal-200/90 dark:border-charcoal-800 p-1.5 focus-within:ring-2 focus-within:ring-terracotta-500/20 focus-within:border-terracotta-500 transition-all">
                  <Search className="w-5 h-5 text-charcoal-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-none"
                  />
                  <Button type="submit" variant="primary" size="md" className="shrink-0 rounded-xl">
                    {t.hero.exploreBtn}
                  </Button>
                </div>
              </form>

              {/* Popular quick tags */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-2 text-xs text-charcoal-500 flex-wrap">
                <span className="font-medium text-charcoal-700 dark:text-charcoal-300">Maarufu:</span>
                <Link to="/books?category=o-level" className="hover:text-terracotta-600 underline">O-Level</Link>
                <span>•</span>
                <Link to="/books?category=technologies" className="hover:text-terracotta-600 underline">Teknolojia</Link>
                <span>•</span>
                <Link to="/books?category=hadithi" className="hover:text-terracotta-600 underline">Hadithi za Kiswahili</Link>
                <span>•</span>
                <Link to="/books?category=science" className="hover:text-terracotta-600 underline">Sayansi</Link>
              </div>
            </div>

            {/* Right Column: Visual editorial book stack mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 p-4 transition-transform hover:-translate-y-1 duration-300">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden book-spine-effect">
                    <img
                      src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
                      alt="Featured Book"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-4">
                    <span className="text-[11px] font-semibold text-terracotta-600 uppercase tracking-widest">
                      Kitabu Kilichopendekezwa
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white mt-0.5">
                      Mwongozo wa Teknolojia ya Akili Bandia
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
                      Dkt. Emmanuel Mrema
                    </p>
                    <div className="mt-3 pt-3 border-t border-charcoal-100 dark:border-charcoal-800 flex justify-between items-center">
                      <span className="text-xs font-semibold text-emerald-600">Bure Kusoma</span>
                      <Link
                        to="/read/book_demo_1"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:underline"
                      >
                        Soma Mtandaoni <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Subtle decorative background book shape */}
                <div className="absolute -top-4 -right-4 w-full h-full rounded-2xl bg-warm-200 dark:bg-charcoal-800 -rotate-3 z-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED BOOKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-charcoal-200/60 dark:border-charcoal-800/80 gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              {t.sections.featuredTitle}
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
              {t.sections.featuredSubtitle}
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 group"
          >
            <span>{t.sections.viewAll}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 3. BROWSE BY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-charcoal-200/60 dark:border-charcoal-800/80 gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              {t.sections.categoriesTitle}
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
              {t.sections.categoriesSubtitle}
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 group"
          >
            <span>Kategoria Zote</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/books?category=${cat.slug}`}
              className="group p-5 rounded-2xl border border-charcoal-200/70 dark:border-charcoal-800/80 bg-white dark:bg-charcoal-900 hover:border-terracotta-500/50 hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center mb-3 group-hover:bg-terracotta-50 dark:group-hover:bg-terracotta-950/40 transition-colors">
                {categoryIconMap[cat.icon] || <BookOpen className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-editorial text-base font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1 line-clamp-1">
                  {cat.books_count || 0} vitabu
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR BOOKS (DATA-DRIVEN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-charcoal-200/60 dark:border-charcoal-800/80 gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              {t.sections.popularTitle}
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
              {t.sections.popularSubtitle}
            </p>
          </div>
          <Link
            to="/books?sort=popular"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 group"
          >
            <span>{t.sections.viewAll}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularBooks.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 5. LATEST ADDITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-charcoal-200/60 dark:border-charcoal-800/80 gap-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
              {t.sections.latestTitle}
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
              {t.sections.latestSubtitle}
            </p>
          </div>
          <Link
            to="/books?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 group"
          >
            <span>{t.sections.viewAll}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {latestBooks.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 6. SUBSCRIPTION PLANS SECTION */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Ufikiaji wa Premium</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
            {t.sections.plansTitle}
          </h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-2">
            {t.sections.plansSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
                plan.billing_interval === 'yearly'
                  ? 'border-terracotta-500 bg-white dark:bg-charcoal-900 shadow-elevated ring-1 ring-terracotta-500/20'
                  : 'border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900'
              }`}
            >
              {plan.billing_interval === 'yearly' && (
                <div className="absolute -top-3 right-8 bg-terracotta-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Inashauriwa Zaidi
                </div>
              )}

              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
                  {plan.description}
                </p>

                <div className="mt-6 pb-6 border-b border-charcoal-100 dark:border-charcoal-800 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
                    TZS {plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-charcoal-500 dark:text-charcoal-400 font-medium">
                    / {plan.billing_interval === 'yearly' ? 'kwa mwaka' : 'kwa mwezi'}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-charcoal-700 dark:text-charcoal-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  variant={plan.billing_interval === 'yearly' ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                  onClick={() => {
                    navigate('/login?redirect=plans');
                  }}
                >
                  {t.subscriptions.choosePlan}
                </Button>
                <p className="text-[11px] text-center text-charcoal-400 mt-2">
                  Usajili salama kupitia miundombinu ya MaktabaYetu
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LATEST NEWS & EDITORIALS */}
      {news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-charcoal-200/60 dark:border-charcoal-800/80 gap-4">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
                {t.sections.newsTitle}
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                {t.sections.newsSubtitle}
              </p>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 group"
            >
              <span>{t.sections.viewAll}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-charcoal-200/70 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:shadow-elevated transition-all"
              >
                {item.cover_url && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-warm-100 dark:bg-charcoal-800">
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-terracotta-600 dark:text-terracotta-400 uppercase tracking-widest block mb-2">
                      {item.category_name || 'Habari'}
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-charcoal-100 dark:border-charcoal-800 text-[11px] text-charcoal-400 flex justify-between items-center">
                    <span>{item.author_name}</span>
                    <span>{new Date(item.published_at).toLocaleDateString('sw-TZ')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
