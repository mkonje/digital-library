// src/pages/Privacy.tsx
import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="font-editorial text-4xl font-bold text-charcoal-900 dark:text-white">
        Sera ya Faragha (Privacy Policy)
      </h1>
      <p className="text-xs text-charcoal-400">Imesasishwa mwisho: Novemba 2024</p>
      <div className="prose dark:prose-invert text-sm leading-relaxed space-y-6 text-charcoal-700 dark:text-charcoal-300">
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">1. Taarifa Tunazokusanya</h2>
          <p>
            MaktabaYetu inakusanya taarifa za kimsingi unazotoa wakati wa kujisajili (kama vile jina kamili na barua pepe). Hatukusanyi taarifa nyeti zisizo na ulazima kwa utoaji wa huduma.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">2. Faragha ya Upakuaji na Usomaji</h2>
          <p>
            Kwa ajili ya takwimu za maktaba na kuzuia matumizi mabaya ya roboti, anwani za IP za upakuaji hufupishwa kwa mfumo fiche usiobadilika (cryptographic hashing), na hazihifadhiwi moja kwa moja katika mfumo wazi.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">3. Vidakuzi (Cookies) Salama</h2>
          <p>
            Tunatumia vidakuzi vya HTTP-only na SameSite=Lax kwa ajili ya kulinda vikao vya mtumiaji pekee. Hatutumii vidakuzi vya ufuatiliaji wa wahusika wengine (third-party tracking cookies).
          </p>
        </section>
      </div>
    </div>
  );
};
