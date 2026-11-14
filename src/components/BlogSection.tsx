import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { BlogArticle, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface BlogSectionProps {
  articles: BlogArticle[];
  language: Language;
  t: TranslationCopy;
  mode: 'preview' | 'full';
}

export function BlogSection({ articles, language, t, mode }: BlogSectionProps) {
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const visibleArticles = mode === 'preview' ? articles.slice(0, 3) : articles;

  return (
    <section id="blog" className="py-16 lg:py-20 bg-white border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#0369A1]">{t.blog.sectionLabel}</p>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
            {t.blog.title}
          </h2>
          <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.blog.subtitle}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {visibleArticles.map((article) => (
            <article
              key={article.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8E5] bg-white p-6 hover:border-[#86EFAC] transition-colors"
            >
              <div>
                <p className="text-xs text-[#64746B]">
                  {article.category} · {article.publishedDate} · {article.readTime}
                </p>
                <h3 className="mt-2.5 font-display font-semibold text-lg text-[#111C16] leading-snug">
                  {language === 'hi' ? article.titleHi : article.title}
                </h3>
                <p className="mt-3 text-sm text-[#47554D] leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#14532D] hover:underline w-fit"
              >
                {t.blog.readArticle}
                <ArrowRight className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </div>

      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeArticle.title}
          className="fixed inset-0 z-50 bg-[#111C16]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl border border-[#E2E8E5] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E2E8E5] flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#64746B]">
                  {activeArticle.category} · {activeArticle.publishedDate} · {activeArticle.readTime}
                </p>
                <h3 className="mt-1 font-display font-bold text-xl sm:text-2xl text-[#111C16]">
                  {language === 'hi' ? activeArticle.titleHi : activeArticle.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#14532D]">{activeArticle.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="p-2 rounded-lg text-[#47554D] hover:bg-[#F3F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm sm:text-base leading-relaxed text-[#2C3B32] whitespace-pre-line">
              {activeArticle.content}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
