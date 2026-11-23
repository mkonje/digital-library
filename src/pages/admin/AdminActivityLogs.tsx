// src/pages/admin/AdminActivityLogs.tsx
import React, { useEffect, useState } from 'react';
import { ScrollText, Shield } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/activity-logs', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setLogs(data.activityLogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
          Kumbukumbu za Matukio ya Msimamizi (Audit Trail)
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Ufuatiliaji thabiti wa kila hatua ya usimamizi: upakiaji, mabadiliko ya vitabu, watumiaji, na mipangilio
        </p>
      </div>

      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Kitendo (Action)</th>
              <th className="py-3 px-4 font-semibold">Aina ya Rasilimali</th>
              <th className="py-3 px-4 font-semibold">Msimamizi</th>
              <th className="py-3 px-4 font-semibold">Maelezo</th>
              <th className="py-3 px-4 font-semibold text-right">Muda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4">
                  <Badge variant="neutral" size="sm" className="font-mono font-bold text-terracotta-600">
                    {log.action}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-medium text-charcoal-800 dark:text-charcoal-200">{log.resource_type}</td>
                <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-400">{log.admin_name || log.admin_email || 'Admin'}</td>
                <td className="py-3 px-4 text-charcoal-500 max-w-xs truncate" title={log.details}>
                  {log.details || '-'}
                </td>
                <td className="py-3 px-4 text-right text-charcoal-400">
                  {new Date(log.created_at).toLocaleString('sw-TZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
