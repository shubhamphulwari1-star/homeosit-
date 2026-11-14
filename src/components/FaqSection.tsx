import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface FaqSectionProps {
  faqs: FaqItem[];
  language: Language;
  t: TranslationCopy;
}

export function FaqSection({ faqs, language, t }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string>(faqs[0]?.id ?? '');

  return (
    <section id="faq" className="py-16 lg:py-20 bg-white border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#14532D]">{t.faq.sectionLabel}</p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.faq.subtitle}</p>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#E2E8E5] border-y border-[#E2E8E5]">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? '' : faq.id)}
                    className="w-full flex items-center justify-between gap-4 text-left py-1 focus-visible:outline-2 focus-visible:outline-[#14532D]"
                  >
                    <span className="font-display font-semibold text-base text-[#111C16]">
                      {language === 'hi' ? faq.questionHi : faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#14532D] shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#47554D] pr-6">
                      {language === 'hi' ? faq.answerHi : faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
