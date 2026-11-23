// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Heart, Shield, Lock } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-charcoal-200/80 dark:border-charcoal-800/80 bg-warm-100/50 dark:bg-charcoal-900/40 text-charcoal-600 dark:text-charcoal-400 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-terracotta-600 dark:bg-terracotta-500 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-charcoal-900 dark:text-white">
                Maktaba<span className="text-terracotta-600 dark:text-terracotta-400">Yetu</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">
              Jukwaa la kidijitali lililojitolea kusambaza maarifa, nyaraka za elimu, hadithi na teknolojia kwa lugha ya Kiswahili na Kiingereza kwa kasi ya wingu.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                <Shield className="w-3 h-3" /> Cloudflare Secured
              </span>
            </div>
          </div>

          {/* Categories Quick Links */}
          <div>
            <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              Kategoria Maarufu
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/books?category=o-level" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  O-Level Revision & Textbooks
                </Link>
              </li>
              <li>
                <Link to="/books?category=a-level" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  A-Level Pure Science & Arts
                </Link>
              </li>
              <li>
                <Link to="/books?category=technologies" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Teknolojia na Sayansi ya Kompyuta
                </Link>
              </li>
              <li>
                <Link to="/books?category=hadithi" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Hadithi na Riwaya za Kiswahili
                </Link>
              </li>
              <li>
                <Link to="/books?category=manuals" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Miongozo ya Ufundi na Kilimo
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              Kurasa Muhimu
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/books" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Katalogi Kamili ya Vitabu
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Habari na Matangazo
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Kuhusu MaktabaYetu
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Sheria na Masharti ya Matumizi
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                  Sera ya Faragha (Privacy Policy)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              Mawasiliano
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 shrink-0" />
                <span>info@maktabayetu.co.tz</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 shrink-0" />
                <span>+255 700 123 456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 shrink-0" />
                <span>Dar es Salaam, Tanzania</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-charcoal-200/60 dark:border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MaktabaYetu. Haki zote zimehifadhiwa.</p>
          <p className="flex items-center gap-1 text-charcoal-400">
            Imeundwa kwa uangalifu na usalama wa hali ya juu.
          </p>
        </div>
      </div>
    </footer>
  );
};
