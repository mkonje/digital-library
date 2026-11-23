// src/pages/Terms.tsx
import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="font-editorial text-4xl font-bold text-charcoal-900 dark:text-white">
        Sheria na Masharti ya Matumizi
      </h1>
      <p className="text-xs text-charcoal-400">Imesasishwa mwisho: Novemba 2024</p>
      <div className="prose dark:prose-invert text-sm leading-relaxed space-y-6 text-charcoal-700 dark:text-charcoal-300">
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">1. Utangulizi</h2>
          <p>
            Karibu kwenye MaktabaYetu. Kwa kutumia tovuti hii, kukagua orodha, kusoma au kupakua machapisho yoyote, unakubaliana na masharti haya yaliyoainishwa hapa chini.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">2. Hakimiliki za Machapisho</h2>
          <p>
            Vitabu na nyaraka zote zinazopatikana kwenye jukwaa la MaktabaYetu zinalindwa na sheria za hakimiliki za kitaifa na kimataifa. Mtumiaji anaruhusiwa kusoma na kupakua kwa matumizi binafsi ya kielimu pekee. Ni marufuku kunakili, kuuza, au kusambaza tena maudhui bila idhini ya kimaandishi ya mwenye hakimiliki.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-editorial text-xl font-bold text-charcoal-900 dark:text-white">3. Akaunti na Usajili</h2>
          <p>
            Watumiaji wanawajibika kulinda nenosiri na usalama wa akaunti zao. MaktabaYetu inahifadhi haki ya kusimamisha akaunti yoyote inayokiuka kanuni za matumizi au inayojaribu kuingilia miundombinu ya tovuti kinyume cha sheria.
          </p>
        </section>
      </div>
    </div>
  );
};
