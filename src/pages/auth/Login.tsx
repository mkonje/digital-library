// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (redirect === 'plans') {
          navigate('/#plans');
        } else {
          navigate(redirect);
        }
      } else {
        setError(result.error || 'Barua pepe au nenosiri si sahihi');
      }
    } catch (err: any) {
      setError(err.message || 'Hitilafu ya mtandao');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-terracotta-600 dark:bg-terracotta-500 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Karibu Tena
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
            Ingia kwenye akaunti yako ya MaktabaYetu kufikia vitabu vyako
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Barua Pepe au Jina la Mtumiaji"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jina@mfano.com au choro"
            icon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1">
            <Input
              label="Nenosiri"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
            />
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[11px] text-terracotta-600 dark:text-terracotta-400 hover:underline"
              >
                Umesahau nenosiri?
              </Link>
            </div>
          </div>

          {/* Cloudflare Turnstile Integration Badge / Prepared status */}
          <div className="py-1 text-center">
            <span className="text-[10px] text-charcoal-400">
              🛡️ Ulinzi wa Cloudflare Turnstile umeandaliwa
            </span>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Ingia kwenye Akaunti
          </Button>
        </form>

        <div className="pt-4 border-t border-charcoal-100 dark:border-charcoal-800 text-center text-xs text-charcoal-500">
          <span>Huna akaunti bado? </span>
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-terracotta-600 dark:text-terracotta-400 hover:underline"
          >
            Jisajili Bure
          </Link>
        </div>
      </div>
    </div>
  );
};
