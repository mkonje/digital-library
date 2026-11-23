// src/pages/admin/AdminSubscriptions.tsx
import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantModalOpen, setGrantModalOpen] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/subscriptions', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/subscriptions/plans').then((r) => r.json()),
      fetch('/api/admin/users', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([subsData, plansData, usersData]) => {
        setSubscriptions(subsData.subscriptions || []);
        setPlans(plansData.plans || []);
        setUsers(usersData.users || []);
        if (plansData.plans?.[0]) setSelectedPlanId(plansData.plans[0].id);
        if (usersData.users?.[0]) setSelectedUserId(usersData.users[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/admin/subscriptions/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          planId: selectedPlanId,
          durationDays: parseInt(durationDays, 10) || 30,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setGrantModalOpen(false);
        fetchData();
      } else {
        setError(data.error || 'Imeshindwa kutoa usajili');
      }
    } catch {
      setError('Hitilafu ya mtandao');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Usimamizi wa Usajili (Subscriptions)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Kagua watumiaji wenye vifurushi vya Premium, toa ufikiaji kwa mikono au dhibiti mipango ya Selcom
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setGrantModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Washa Usajili kwa Mtumiaji
        </Button>
      </div>

      {/* Plans Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-charcoal-900 dark:text-white text-base">{p.name}</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">{p.description}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-terracotta-600 block">
                TZS {p.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold">{p.billing_interval}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-800 bg-warm-100/50 dark:bg-charcoal-800/50 text-charcoal-500">
              <th className="py-3 px-4 font-semibold">Mtumiaji</th>
              <th className="py-3 px-4 font-semibold">Kifurushi (Plan)</th>
              <th className="py-3 px-4 font-semibold">Hali</th>
              <th className="py-3 px-4 font-semibold">Mwanzo</th>
              <th className="py-3 px-4 font-semibold">Mwisho wa Ufikiaji</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {subscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-warm-50 dark:hover:bg-charcoal-800/40">
                <td className="py-3 px-4">
                  <span className="font-bold text-charcoal-900 dark:text-white block">{s.user_name}</span>
                  <span className="text-[11px] text-charcoal-500">{s.user_email}</span>
                </td>
                <td className="py-3 px-4 font-medium text-charcoal-800 dark:text-charcoal-200">{s.plan_name}</td>
                <td className="py-3 px-4">
                  <Badge variant={s.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-charcoal-400">
                  {new Date(s.start_date).toLocaleDateString('sw-TZ')}
                </td>
                <td className="py-3 px-4 text-charcoal-400 font-medium">
                  {new Date(s.end_date).toLocaleDateString('sw-TZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grant Modal */}
      <Modal isOpen={grantModalOpen} onClose={() => setGrantModalOpen(false)} title="Washa Usajili wa Mtumiaji">
        <form onSubmit={handleGrantSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Chagua Mtumiaji
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs bg-white dark:bg-charcoal-900"
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Chagua Kifurushi
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs bg-white dark:bg-charcoal-900"
              required
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — TZS {p.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Muda wa Ufikiaji (Siku)"
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setGrantModalOpen(false)}>
              Ghairi
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Washa Usajili
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
