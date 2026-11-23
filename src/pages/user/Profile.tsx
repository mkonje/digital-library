// src/pages/user/Profile.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  Bookmark,
  Download,
  CreditCard,
  Settings,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { BookCard } from '../../components/book/BookCard';
import { EmptyState } from '../../components/ui/EmptyState';

export const Profile: React.FC = () => {
  const { user, subscription, refreshUser, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'reading';

  // Data states
  const [readingList, setReadingList] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [subData, setSubData] = useState<{ subscriptions: any[]; purchases: any[] }>({
    subscriptions: [],
    purchases: [],
  });
  const [loadingData, setLoadingData] = useState(false);

  // Settings form states
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=profile');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  // Load Tab Data
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingData(true);

    if (activeTab === 'reading') {
      fetch('/api/user/reading-progress', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setReadingList(data.progress || []))
        .finally(() => setLoadingData(false));
    } else if (activeTab === 'favorites') {
      fetch('/api/user/favorites', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setFavorites(data.favorites || []))
        .finally(() => setLoadingData(false));
    } else if (activeTab === 'downloads') {
      fetch('/api/user/downloads', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setDownloads(data.downloads || []))
        .finally(() => setLoadingData(false));
    } else if (activeTab === 'subscriptions') {
      fetch('/api/user/subscriptions', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setSubData(data))
        .finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [activeTab, isAuthenticated]);

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Wasifu umesasishwa kwa mafanikio' });
        await refreshUser();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Imeshindwa kusasisha wasifu' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Hitilafu ya mtandao' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Nenosiri limebadilishwa kwa mafanikio' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Nenosiri la sasa si sahihi' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Hitilafu ya mtandao' });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-charcoal-400">
        Inapakia maktaba yako...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile Bar */}
      <div className="p-8 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-100 dark:bg-terracotta-900/40 text-terracotta-700 dark:text-terracotta-300 flex items-center justify-center font-editorial text-2xl font-bold">
            {user.full_name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
                {user.full_name}
              </h1>
              {user.role === 'admin' && (
                <Badge variant="premium" size="sm">Msimamizi</Badge>
              )}
            </div>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="p-4 rounded-2xl bg-warm-100/70 dark:bg-charcoal-800/60 border border-charcoal-200/60 dark:border-charcoal-700/60 text-xs text-center sm:text-right">
          <span className="text-charcoal-400 block mb-1">Hali ya Usajili:</span>
          {subscription ? (
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {subscription.plan_name} (Active)
              </span>
              <p className="text-[10px] text-charcoal-400">
                Hadi: {new Date(subscription.end_date).toLocaleDateString('sw-TZ')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-semibold text-charcoal-700 dark:text-charcoal-300">
                Akaunti ya Kawaida (Bure)
              </span>
              <Link to="/#plans" className="block text-[11px] font-bold text-terracotta-600 hover:underline">
                Pata Kifurushi cha Premium →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-charcoal-200/60 dark:border-charcoal-800 text-xs">
        <button
          onClick={() => setTab('reading')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'reading'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold shadow-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Inayoendelea ({readingList.length})</span>
        </button>

        <button
          onClick={() => setTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'favorites'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold shadow-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Vipendwa ({favorites.length})</span>
        </button>

        <button
          onClick={() => setTab('downloads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'downloads'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold shadow-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Vilivyopakuliwa</span>
        </button>

        <button
          onClick={() => setTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold shadow-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Usajili & Ununuzi</span>
        </button>

        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-semibold shadow-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Mipangilio</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loadingData ? (
        <div className="py-20 text-center text-charcoal-400 text-xs">
          Inapakia taarifa...
        </div>
      ) : activeTab === 'reading' ? (
        <div>
          {readingList.length === 0 ? (
            <EmptyState
              title="Hakuna vitabu vinavyoendelea kusomwa"
              description="Unapoanza kusoma kitabu chochote, maendeleo yako yatahifadhiwa kiotomatiki hapa."
              actionText="Gundua Vitabu Sasa"
              onAction={() => navigate('/books')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readingList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                      alt={item.title}
                      className="w-16 aspect-[3/4] object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-terracotta-600 block mb-1">
                        {item.category_name || 'Kitabu'}
                      </span>
                      <h4 className="font-editorial text-base font-bold text-charcoal-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">{item.author}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-charcoal-100 dark:border-charcoal-800 space-y-2">
                    <div className="flex justify-between text-xs text-charcoal-500">
                      <span>Ukurasa {item.current_page} / {item.total_pages}</span>
                      <span className="font-semibold text-terracotta-600">{item.progress_percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-charcoal-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta-600 rounded-full"
                        style={{ width: `${item.progress_percent}%` }}
                      />
                    </div>
                    <Link to={`/read/${item.book_id}?page=${item.current_page}`} className="block pt-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Endelea Kusoma →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'favorites' ? (
        <div>
          {favorites.length === 0 ? (
            <EmptyState
              title="Hujaongeza vitabu vyovyote kwenye vipendwa"
              description="Bofya alama ya moyo kwenye kitabu chochote ili kukihifadhi hapa."
              actionText="Vinjari Vitabu"
              onAction={() => navigate('/books')}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((book) => (
                <BookCard key={book.id} book={book} isFavorited={true} />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'downloads' ? (
        <div>
          {downloads.length === 0 ? (
            <EmptyState
              title="Hujapakua kitabu chochote bado"
              description="Vitabu unavyopakua kwa ajili ya kusoma nje ya mtandao vitaorodheshwa hapa."
            />
          ) : (
            <div className="space-y-3 max-w-3xl">
              {downloads.map((item) => (
                <div
                  key={item.download_id}
                  className="p-4 rounded-xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-terracotta-600" />
                    <div>
                      <Link to={`/books/${item.slug}`} className="font-bold text-charcoal-900 dark:text-white hover:underline">
                        {item.title}
                      </Link>
                      <p className="text-charcoal-500">{item.author} • {new Date(item.downloaded_at).toLocaleDateString('sw-TZ')}</p>
                    </div>
                  </div>
                  <a href={`/api/download/${item.id}`}>
                    <Button variant="outline" size="sm">
                      Pakua Tena
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'subscriptions' ? (
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h3 className="font-editorial text-xl font-bold">Historia ya Usajili</h3>
            {subData.subscriptions.length === 0 ? (
              <p className="text-xs text-charcoal-500">Huna historia ya vifurushi vya usajili.</p>
            ) : (
              <div className="space-y-3">
                {subData.subscriptions.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-charcoal-900 dark:text-white">{s.plan_name}</h4>
                      <p className="text-charcoal-500">Mwisho: {new Date(s.end_date).toLocaleDateString('sw-TZ')}</p>
                    </div>
                    <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
            <h3 className="font-editorial text-xl font-bold">Vitabu Vilivyonunuliwa Moja kwa Moja</h3>
            {subData.purchases.length === 0 ? (
              <p className="text-xs text-charcoal-500">Hujanunua kitabu chochote moja kwa moja.</p>
            ) : (
              <div className="space-y-3">
                {subData.purchases.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-charcoal-900 dark:text-white">{p.book_title}</h4>
                      <p className="text-charcoal-500">Kiasi: TZS {p.amount.toLocaleString()}</p>
                    </div>
                    <Link to={`/books/${p.book_slug}`}>
                      <Button variant="ghost" size="sm">Fungua</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="max-w-xl space-y-8">
          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Update Name Form */}
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-4">
            <h3 className="font-editorial text-lg font-bold">Sasisha Jina Lako</h3>
            <Input
              label="Jina Kamili"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Barua Pepe (Haiwezi kubadilishwa)"
              value={user.email}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <Button type="submit" variant="primary" size="sm">
              Hifadhi Mabadiliko
            </Button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="p-6 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-4">
            <h3 className="font-editorial text-lg font-bold">Badilisha Nenosiri</h3>
            <Input
              label="Nenosiri la Sasa"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Nenosiri Jipya"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Herufi zisizopungua 6"
            />
            <Button type="submit" variant="outline" size="sm">
              Badilisha Nenosiri
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
