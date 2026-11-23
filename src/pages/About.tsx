// src/pages/About.tsx
import React from 'react';
import { BookOpen, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-200 dark:border-terracotta-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kuhusu MaktabaYetu</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal-900 dark:text-white">
          Kujenga Maktaba ya Kidijitali ya Kisasa na ya Kwanza kwa Afrika
        </h1>
        <p className="text-base text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
          MaktabaYetu ni jukwaa la kidijitali lililobuniwa kutatua upatikanaji wa vitabu na nyaraka za kielimu, kiufundi, na kitamaduni kwa wanafunzi, watafiti, na jamii nzima ya wasomaji.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">
            Upatikanaji Rahisi
          </h3>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
            Kusoma popote pale kupitia simu au kompyuta bila kuhitaji kusakinisha programu nzito au kulipia gharama kubwa za usafirishaji wa vitabu halisi.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">
            Kasi ya Cloudflare
          </h3>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
            Imejengwa juu ya miundombinu ya kimataifa ya Cloudflare Workers, R2 na D1, kuhakikisha upakiaji wa PDF unakuwa wa haraka sana sekunde chache popote ulipo.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">
            Usalama na Hakimiliki
          </h3>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
            Kulinda maudhui ya waandishi na wachapishaji kupitia viwango thabiti vya usalama, ulinzi wa nyaraka, na mifumo ya usajili wa kidijitali.
          </p>
        </div>
      </div>
    </div>
  );
};
