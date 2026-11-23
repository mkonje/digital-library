// src/components/book/PremiumAccessModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

interface PremiumAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookPrice?: number;
}

export const PremiumAccessModal: React.FC<PremiumAccessModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  bookPrice,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
          {t.book.lockedTitle}
        </h3>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2 px-4 leading-relaxed">
          {t.book.lockedDesc}
        </p>

        <div className="my-5 p-4 rounded-xl bg-warm-100/70 dark:bg-charcoal-800/60 border border-charcoal-200/60 dark:border-charcoal-700/60 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
            <span>Kitabu:</span>
            <span className="font-bold text-terracotta-600 dark:text-terracotta-400 truncate max-w-[200px]">
              {bookTitle}
            </span>
          </div>
          {bookPrice && bookPrice > 0 && (
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
              <span>Bei ya Moja kwa Moja:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                TZS {bookPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="text-left space-y-2 mb-6 text-xs text-charcoal-600 dark:text-charcoal-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Usomaji wa moja kwa moja kwenye vivinjari vyote</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Upakuaji wa PDF nje ya mtandao</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ufikiaji wa vitabu vyote vya kiwango cha juu (Premium)</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {!isAuthenticated ? (
            <Link to="/login" className="block w-full">
              <Button variant="primary" className="w-full">
                {t.book.loginToAccess}
              </Button>
            </Link>
          ) : (
            <Link to="/#plans" onClick={onClose} className="block w-full">
              <Button variant="primary" className="w-full" icon={<Sparkles className="w-4 h-4" />}>
                {t.book.unlockBtn}
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-xs">
            {t.common.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
