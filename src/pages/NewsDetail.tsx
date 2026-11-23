// src/pages/NewsDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Check, Newspaper } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then((data) => {
        setArticle(data.article);
        setRelated(data.related || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal-400">
        Inapakia makala...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-editorial text-2xl font-bold">Makala Hayakupatikana</h2>
        <Link to="/news">
          <Button variant="outline" size="sm">
            Rudi kwenye Habari
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Rudi kwenye Habari</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {article.category_name && <Badge variant="default">{article.category_name}</Badge>}
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-charcoal-200/60 dark:border-charcoal-800 text-xs text-charcoal-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-terracotta-600" />
              {article.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-charcoal-400" />
              {new Date(article.published_at).toLocaleDateString('sw-TZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          >
            {copied ? 'Kimenakiliwa!' : 'Shiriki'}
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_url && (
        <div className="rounded-3xl overflow-hidden shadow-elevated aspect-[16/9] w-full bg-warm-100">
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Summary Highlight */}
      {article.summary && (
        <p className="font-editorial text-lg sm:text-xl italic text-charcoal-700 dark:text-charcoal-300 border-l-4 border-terracotta-500 pl-5 py-1">
          {article.summary}
        </p>
      )}

      {/* Rich Content Body */}
      <div className="prose dark:prose-invert max-w-none text-charcoal-800 dark:text-charcoal-200 text-base leading-relaxed space-y-5">
        {article.content.split('\n\n').map((paragraph: string, idx: number) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {/* Related News */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-charcoal-200/60 dark:border-charcoal-800 space-y-6">
          <h3 className="font-editorial text-2xl font-bold text-charcoal-900 dark:text-white">
            Makala Nyingine Zinazohusiana
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/news/${rel.slug}`}
                className="group p-5 rounded-2xl border border-charcoal-200/70 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <h4 className="font-editorial text-base font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-600 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <span className="text-[11px] text-charcoal-400 mt-4 block">
                  {new Date(rel.published_at).toLocaleDateString('sw-TZ')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
