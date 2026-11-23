// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Download,
  Eye,
  HardDrive,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/analytics', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([statsData, analyticsData]) => {
        setStats(statsData.stats || {});
        setRecentUploads(statsData.recentUploads || []);
        setRecentActivity(statsData.recentActivity || []);
        setAnalytics(analyticsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-charcoal-400">Inapakia takwimu halisi...</div>;
  }

  const storageMb = stats ? (stats.totalStorageBytes / (1024 * 1024)).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Muhtasari wa MaktabaYetu
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Usimamizi na takwimu za wakati halisi kutoka hifadhidata ya D1 na wingu la Cloudflare R2
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/upload">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Pakia Vitabu Vipya
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-xs font-medium">Jumla ya Vitabu</span>
            <BookOpen className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900 dark:text-white">
            {stats.totalBooks}
          </div>
          <p className="text-[11px] text-charcoal-500">
            {stats.freeBooks} Bure • {stats.premiumBooks} Premium
          </p>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-xs font-medium">Watumiaji Waliosajiliwa</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900 dark:text-white">
            {stats.totalUsers}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            {stats.activeSubscriptions} Wana usajili hai
          </p>
        </div>

        {/* Total Downloads */}
        <div className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-xs font-medium">Jumla ya Upakuaji</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900 dark:text-white">
            {stats.totalDownloads}
          </div>
          <p className="text-[11px] text-charcoal-500">Kupitia miundombinu salama ya R2</p>
        </div>

        {/* Total Reads / Interactions */}
        <div className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-400">
            <span className="text-xs font-medium">Usomaji wa PDF (Reads)</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900 dark:text-white">
            {stats.totalReads}
          </div>
          <p className="text-[11px] text-charcoal-500">
            Ukubwa wa Hifadhi: {storageMb} MB
          </p>
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Popular Books */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white">
              Vitabu Vinavyoongoza kwa Mwingiliano
            </h3>
            <Link to="/admin/books" className="text-xs text-terracotta-600 hover:underline">
              Tazama Vyote
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.topBooks?.slice(0, 5).map((b: any, idx: number) => {
              const maxInteractions = analytics.topBooks[0]?.total_interactions || 1;
              const percent = Math.min(100, Math.round((b.total_interactions / maxInteractions) * 100));

              return (
                <div key={b.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="truncate max-w-[260px] text-charcoal-800 dark:text-charcoal-200">
                      {idx + 1}. {b.title}
                    </span>
                    <span className="text-charcoal-500">
                      {b.reads_count} reads • {b.downloads_count} downloads
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-charcoal-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
                    <div className="h-full bg-terracotta-600 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white">
              Vitabu Kulingana na Kategoria
            </h3>
            <Link to="/admin/categories" className="text-xs text-terracotta-600 hover:underline">
              Dhibiti
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.categoryStats?.map((c: any) => (
              <div key={c.name} className="flex items-center justify-between text-xs py-1.5 border-b border-charcoal-100 dark:border-charcoal-800 last:border-0">
                <span className="text-charcoal-700 dark:text-charcoal-300 font-medium">{c.name}</span>
                <span className="font-bold text-terracotta-600">{c.count} vitabu</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Uploads & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Uploads */}
        <div className="lg:col-span-7 p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white">
              Vitabu Vilivyopakiwa Hivi Karibuni
            </h3>
            <Link to="/admin/books" className="text-xs text-terracotta-600 hover:underline">
              Katalogi Kamili
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-200 dark:border-charcoal-800 text-charcoal-400">
                  <th className="pb-2 font-medium">Jina la Kitabu</th>
                  <th className="pb-2 font-medium">Kategoria</th>
                  <th className="pb-2 font-medium">Aina</th>
                  <th className="pb-2 font-medium text-right">Tarehe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                {recentUploads.map((b) => (
                  <tr key={b.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/50">
                    <td className="py-2.5 font-medium text-charcoal-900 dark:text-white max-w-[200px] truncate">
                      {b.title}
                    </td>
                    <td className="py-2.5 text-charcoal-500">{b.category_name || '-'}</td>
                    <td className="py-2.5">
                      <Badge variant={b.is_premium ? 'premium' : 'free'} size="sm">
                        {b.is_premium ? 'Premium' : 'Bure'}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-charcoal-400">
                      {new Date(b.created_at).toLocaleDateString('sw-TZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="lg:col-span-5 p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 dark:text-white">
              Kumbukumbu ya Matukio ya Msimamizi
            </h3>
            <Link to="/admin/activity" className="text-xs text-terracotta-600 hover:underline">
              Tazama Yote
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs py-1.5 border-b border-charcoal-100 dark:border-charcoal-800 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-terracotta-600">{log.action}</span>
                  <span className="text-[10px] text-charcoal-400">
                    {new Date(log.created_at).toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-charcoal-500 truncate mt-0.5">{log.details || log.resource_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
