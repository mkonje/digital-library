// src/pages/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-terracotta-600 dark:bg-terracotta-500 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
            Weka Upya Nenosiri
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
            Weka barua pepe yako ili kupokea kiungo cha kubadilisha nenosiri
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400">
              Ikiwa barua pepe hii imesajiliwa kwenye MaktabaYetu, maelekezo ya kuweka upya nenosiri yametumwa kwa mafanikio.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Rudi Kwenye Kuingia
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Barua Pepe Yako"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juma@example.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Tuma Kiungo cha Kubadilisha
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-800 dark:hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Rudi Kwenye Kuingia</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
