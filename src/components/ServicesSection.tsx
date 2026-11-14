import { ArrowRight } from 'lucide-react';
import type { Language, ServiceItem } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface ServicesSectionProps {
  services: ServiceItem[];
  language: Language;
  t: TranslationCopy;
  onBookService: (serviceTitle: string) => void;
}

export function ServicesSection({
  services,
  language,
  t,
  onBookService,
}: ServicesSectionProps) {
  return (
    <section id="services" className="py-16 lg:py-20 bg-white border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#14532D]">{t.services.sectionLabel}</p>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
            {t.services.title}
          </h2>
          <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.services.subtitle}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8E5] bg-white p-6 hover:border-[#86EFAC] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-4 text-xs text-[#64746B]">
                  <span className="font-mono font-medium text-[#14532D] tabular-nums">
                    {service.number}.
                  </span>
                  <span className="font-mono tabular-nums">
                    {service.duration} · ₹{service.feeInr}
                  </span>
                </div>

                <h3 className="mt-3 font-display font-semibold text-lg text-[#111C16]">
                  {language === 'hi' ? service.titleHi : service.title}
                </h3>

                <p className="mt-2 text-sm text-[#47554D] leading-relaxed">
                  {language === 'hi' ? service.descriptionHi : service.description}
                </p>

                <ul className="mt-4 pt-4 border-t border-[#E2E8E5] space-y-1.5 text-xs text-[#47554D]">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2">
                      <span aria-hidden="true" className="text-[#14532D] font-semibold">
                        —
                      </span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onBookService(language === 'hi' ? service.titleHi : service.title)}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#14532D] hover:text-[#166534] transition-colors w-fit"
              >
                {t.services.bookThis}
                <ArrowRight className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
