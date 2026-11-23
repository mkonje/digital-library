// src/pages/admin/AdminAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Download, Eye, Award } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-charcoal-400">Inapakia takwimu halisi...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
          Takwimu na Mwenendo wa Jukwaa (Real Analytics)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Uchambuzi wa vitabu vinavyopendwa, mienendo ya upakuaji, na usajili bila kuathiri faragha ya watumiaji
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 6 Popular Books */}
        <div className="p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
          <h3 className="font-editorial text-lg font-bold">Vitabu Vinavyoongoza kwa Mwingiliano</h3>
          <div className="space-y-3">
            {data?.topBooks?.map((b: any, i: number) => (
              <div key={b.id} className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-800 flex items-center justify-between text-xs">
                <div className="max-w-[240px]">
                  <span className="font-bold text-charcoal-900 dark:text-white truncate block">
                    {i + 1}. {b.title}
                  </span>
                  <span className="text-[11px] text-charcoal-500">{b.author}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-terracotta-600 block">{b.total_interactions} jumla</span>
                  <span className="text-[10px] text-charcoal-400">{b.reads_count}R • {b.downloads_count}D</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
          <h3 className="font-editorial text-lg font-bold">Mgawanyo wa Vitabu kwa Kategoria</h3>
          <div className="space-y-2">
            {data?.categoryStats?.map((c: any) => (
              <div key={c.name} className="flex justify-between items-center text-xs py-2 border-b border-charcoal-100 dark:border-charcoal-800 last:border-0">
                <span className="font-medium text-charcoal-700 dark:text-charcoal-300">{c.name}</span>
                <span className="font-bold text-terracotta-600">{c.count} vitabu</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
