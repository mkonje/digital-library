// src/pages/admin/AdminSettings.tsx
import React, { useEffect, useState } from 'react';
import { Settings, Shield, CreditCard, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        (data.settings || []).forEach((item: any) => {
          map[item.key] = item.value;
        });
        setSettings(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
        credentials: 'include',
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Mipangilio imehifadhiwa kwa mafanikio!' });
      } else {
        setMessage({ type: 'error', text: 'Imeshindwa kuhifadhi mipangilio' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Hitilafu ya mtandao' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-charcoal-400">Inapakia mipangilio...</div>;
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Mipangilio ya Jukwaa
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Dhibiti taarifa za tovuti, lango la malipo la Selcom, na ulinzi wa Cloudflare Turnstile
          </p>
        </div>
        <Button type="submit" variant="primary" size="sm" isLoading={saving} icon={<Save className="w-4 h-4" />}>
          Hifadhi Mipangilio Yote
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. General Site Settings */}
      <div className="p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
        <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-terracotta-600" />
          <span>Taarifa za Msingi za MaktabaYetu</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Jina la Tovuti"
            value={settings['site_name'] || 'MaktabaYetu'}
            onChange={(e) => handleChange('site_name', e.target.value)}
          />
          <Input
            label="Kaulimbiu (Tagline)"
            value={settings['site_tagline'] || ''}
            onChange={(e) => handleChange('site_tagline', e.target.value)}
          />
        </div>

        <Input
          label="Barua Pepe ya Mawasiliano"
          value={settings['contact_email'] || 'info@maktabayetu.co.tz'}
          onChange={(e) => handleChange('contact_email', e.target.value)}
        />
        <Input
          label="Nambari ya Simu ya Huduma"
          value={settings['contact_phone'] || '+255 700 123 456'}
          onChange={(e) => handleChange('contact_phone', e.target.value)}
        />
      </div>

      {/* 2. Selcom Payment Gateway Preparation */}
      <div className="p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>Lango la Malipo la Selcom (Selcom Gateway Integration)</span>
          </h3>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            Modular Architecture
          </span>
        </div>

        <p className="text-xs text-charcoal-500 leading-relaxed">
          Miundombinu ya malipo ya Selcom (Masterpass QR, Tigo Pesa, M-Pesa, Airtel Money) imejengwa kwa mfumo wa msimbo salama (modular architecture). Unapopata vitambulisho kutoka Selcom, weka hapa au kwenye mazingira ya Cloudflare Secrets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Selcom Vendor ID"
            placeholder="Weka Vendor ID kutoka Selcom"
            value={settings['selcom_vendor_id'] || ''}
            onChange={(e) => handleChange('selcom_vendor_id', e.target.value)}
          />
          <Input
            label="Selcom API Key"
            placeholder="Weka API Key"
            value={settings['selcom_api_key'] || ''}
            onChange={(e) => handleChange('selcom_api_key', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Selcom API Base URL"
            value={settings['selcom_base_url'] || 'https://api.selcompay.com/v1'}
            onChange={(e) => handleChange('selcom_base_url', e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Hali ya Lango (Live Gateway Status)
            </label>
            <select
              value={settings['selcom_enabled'] || '0'}
              onChange={(e) => handleChange('selcom_enabled', e.target.value)}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs bg-white dark:bg-charcoal-900"
            >
              <option value="0">Imezimwa (Disabled - Awaiting Credentials)</option>
              <option value="1">Imewashwa (Active Production / Sandbox)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Cloudflare Turnstile Anti-Bot Protection */}
      <div className="p-6 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-sm space-y-4">
        <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <span>Ulinzi wa Roboti wa Cloudflare Turnstile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Turnstile Site Key"
            placeholder="0x4AAAAAA..."
            value={settings['turnstile_site_key'] || ''}
            onChange={(e) => handleChange('turnstile_site_key', e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Uthibitishaji wa Turnstile
            </label>
            <select
              value={settings['turnstile_enabled'] || '0'}
              onChange={(e) => handleChange('turnstile_enabled', e.target.value)}
              className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-800 p-2.5 text-xs bg-white dark:bg-charcoal-900"
            >
              <option value="0">Imezimwa kwa Sasa (Disabled)</option>
              <option value="1">Imewashwa (Active)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};
