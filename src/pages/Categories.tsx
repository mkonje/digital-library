// src/pages/Categories.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Newspaper,
  Heart,
  GraduationCap,
  Award,
  Cpu,
  FlaskConical,
  FileText,
  Folder,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from '../i18n';

const categoryIconMap: Record<string, React.ReactNode> = {
  Newspaper: <Newspaper className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Folder: <Folder className="w-6 h-6" />,
};

export const Categories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl">
        <h1 className="font-editorial text-4xl font-bold text-charcoal-900 dark:text-white">
          Kategoria za MaktabaYetu
        </h1>
        <p className="text-base text-charcoal-500 dark:text-charcoal-400 mt-2 leading-relaxed">
          Gundua machapisho yaliyopangwa kwa umaridadi kulingana na mada na viwango vya elimu. Kila kategoria imejaa rasilimali zenye ubora wa juu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/books?category=${cat.slug}`}
            className="group relative p-7 rounded-3xl border border-charcoal-200/80 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:shadow-elevated hover:border-terracotta-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center mb-5 group-hover:bg-terracotta-600 group-hover:text-white transition-colors">
                {categoryIconMap[cat.icon] || <BookOpen className="w-6 h-6" />}
              </div>

              <h3 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2 leading-relaxed">
                {cat.description || 'Gundua vitabu vyote katika kategoria hii.'}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal-500">
                {cat.books_count || 0} vitabu vinavyopatikana
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-terracotta-600 dark:text-terracotta-400 group-hover:translate-x-1 transition-transform">
                Vinjari <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
