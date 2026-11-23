// src/pages/admin/AdminDownloads.tsx
import React, { useEffect, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';

export const AdminDownloads: React.FC = () => {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/downloads', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setDownloads(data.downloads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
          Kumbukumbu za Upakuaji (Download Logs)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Kumbukumbu salama za wakati halisi za upakuaji wa PDF zikiwa na anwani za IP zilizolindwa kwa njia fiche
        </p>
      </div>

      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Kitabu Kilichopakuliwa</th>
              <th className="py-3 px-4 font-semibold">Mtumiaji</th>
              <th className="py-3 px-4 font-semibold">IP Hash (Anonymized)</th>
              <th className="py-3 px-4 font-semibold text-right">Muda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {downloads.map((d) => (
              <tr key={d.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4 font-bold text-charcoal-900 dark:text-white">{d.book_title}</td>
                <td className="py-3 px-4 text-charcoal-500">{d.user_email || 'Mgeni (Guest)'}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-charcoal-400">{d.ip_hash || 'SHA256-***'}</td>
                <td className="py-3 px-4 text-right text-charcoal-400">
                  {new Date(d.created_at).toLocaleString('sw-TZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
