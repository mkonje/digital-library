// src/pages/admin/AdminUsers.tsx
import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const url = search.trim() ? `/api/admin/users?search=${encodeURIComponent(search.trim())}` : '/api/admin/users';
    fetch(url, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Je, una uhakika unataka ${nextStatus === 'suspended' ? 'kusimamisha' : 'kuwezesha tena'} akaunti ya ${user.full_name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRole = async (user: any) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = `Badilisha jukumu la ${user.full_name} kuwa ${nextRole}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
        credentials: 'include',
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Usimamizi wa Watumiaji
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Kagua watumiaji waliosajiliwa, dhibiti majukumu (Roles), na kusimamisha au kufungua akaunti
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta kwa jina au barua pepe..."
            className="w-full rounded-xl bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-800 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-terracotta-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-charcoal-400" />
        </form>
      </div>

      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Mtumiaji</th>
              <th className="py-3 px-4 font-semibold">Jukumu (Role)</th>
              <th className="py-3 px-4 font-semibold">Hali (Status)</th>
              <th className="py-3 px-4 font-semibold">Mwingiliano</th>
              <th className="py-3 px-4 font-semibold">Tarehe ya Usajili</th>
              <th className="py-3 px-4 font-semibold text-right">Vitendo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {u.full_name[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 dark:text-white block">{u.full_name}</span>
                      <span className="text-[11px] text-charcoal-500">{u.email}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <Badge variant={u.role === 'admin' ? 'premium' : 'neutral'} size="sm">
                    {u.role}
                  </Badge>
                </td>

                <td className="py-3 px-4">
                  <Badge variant={u.status === 'active' ? 'success' : 'warning'} size="sm">
                    {u.status}
                  </Badge>
                </td>

                <td className="py-3 px-4 text-charcoal-500">
                  <span>{u.reads_count} reads • {u.downloads_count} downloads</span>
                </td>

                <td className="py-3 px-4 text-charcoal-400">
                  {new Date(u.created_at).toLocaleDateString('sw-TZ')}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="p-1.5 rounded-lg border border-charcoal-200 dark:border-charcoal-800 text-charcoal-600 hover:text-terracotta-600"
                      title={u.role === 'admin' ? 'Shusha hadhi kuwa Mtumiaji' : 'Pandisha kuwa Msimamizi'}
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-1.5 rounded-lg border ${
                        u.status === 'active'
                          ? 'border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.status === 'active' ? 'Simamisha Akaunti' : 'Wezesha Akaunti'}
                    >
                      {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
