// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Nenosiri halilingani na uthibitisho');
      return;
    }

    if (password.length < 6) {
      setError('Nenosiri lazima liwe na herufi zisizopungua 6');
      return;
    }

    if (!agreeTerms) {
      setError('Tafadhali kubaliana na vigezo na masharti ili kuendelea');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(fullName, email, password);
      if (result.success) {
        navigate(redirect);
      } else {
        setError(result.error || 'Usajili umeshindwa');
      }
    } catch (err: any) {
      setError(err.message || 'Hitilafu ya mtandao');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-terracotta-600 dark:bg-terracotta-500 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 dark:text-white">
            Fungua Akaunti Mpya
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
            Ungana na maelfu ya wasomaji na wanafunzi kwenye MaktabaYetu
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
            label="Jina Kamili"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juma Mwangi"
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Barua Pepe"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juma@example.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Nenosiri"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Zisizopungua herufi 6"
            icon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Thibitisha Nenosiri"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Rudia nenosiri"
            icon={<Lock className="w-4 h-4" />}
          />

          <div className="flex items-center gap-2 text-xs text-charcoal-600 dark:text-charcoal-400">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded text-terracotta-600 focus:ring-terracotta-500"
            />
            <label htmlFor="terms">
              Ninakubaliana na{' '}
              <Link to="/terms" className="text-terracotta-600 hover:underline">
                Sheria na Masharti
              </Link>{' '}
              na{' '}
              <Link to="/privacy" className="text-terracotta-600 hover:underline">
                Sera ya Faragha
              </Link>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Tengeneza Akaunti Yangu
          </Button>
        </form>

        <div className="pt-4 border-t border-charcoal-100 dark:border-charcoal-800 text-center text-xs text-charcoal-500">
          <span>Tayari una akaunti? </span>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-terracotta-600 dark:text-terracotta-400 hover:underline"
          >
            Ingia Hapa
          </Link>
        </div>
      </div>
    </div>
  );
};
