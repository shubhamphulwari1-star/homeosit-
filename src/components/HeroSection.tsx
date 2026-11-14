import { ArrowRight, CalendarCheck2, PhoneCall } from 'lucide-react';
import { CLINIC_IMAGES } from '../lib/imageAssets';
import type { ActiveRoute, ClinicProfile, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  profile: ClinicProfile;
  language: Language;
  t: TranslationCopy;
  medicineCount: number;
  onNavigate: (route: ActiveRoute, sectionId?: string) => void;
}

export function HeroSection({
  profile,
  language,
  t,
  medicineCount,
  onNavigate,
}: HeroSectionProps) {
  const doctorName = language === 'hi' ? profile.doctorNameHi : profile.doctorName;
  const clinicName = language === 'hi' ? profile.clinicNameHi : profile.clinicName;

  return (
    <section className="bg-white border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Editorial Headline + Clear Clinic Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-medium text-[#0369A1] mb-4">
              {t.hero.eyebrow}
            </p>

            <h1 className="font-display font-bold text-[clamp(2.15rem,4vw,3.45rem)] leading-[1.1] tracking-tight text-[#111C16] [text-wrap:balance] max-w-2xl">
              {t.hero.headline}
            </h1>

            <p className="mt-5 text-base sm:text-[17px] leading-relaxed text-[#47554D] max-w-[62ch]">
              {t.hero.subheadline}
            </p>

            <div className="mt-6 text-sm text-[#47554D]">
              <span className="font-semibold text-[#111C16]">{doctorName}</span>
              <span aria-hidden="true" className="mx-2 text-[#94A39B]">·</span>
              <span>{profile.qualification}</span>
              <span aria-hidden="true" className="mx-2 text-[#94A39B]">·</span>
              <span>{clinicName}</span>
            </div>

            {/* Clear action buttons requested by user */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('home', 'appointment')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <CalendarCheck2 className="w-4 h-4" />
                {t.hero.ctaBook}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('medicines')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#14532D] bg-[#ECFDF5] hover:bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.ctaMedicines}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('categories')}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.ctaCategories}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('home', 'contact')}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#111C16] bg-white hover:bg-[#F8FAF9] border border-[#E2E8E5] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <PhoneCall className="w-4 h-4 text-[#14532D]" />
                {t.hero.ctaContact}
              </button>
            </div>
          </div>

          {/* Right Column: Doctor Portrait */}
          <div className="lg:col-span-5">
            <div className="h-full min-h-[340px] lg:min-h-[440px] rounded-2xl overflow-hidden border border-[#E2E8E5] bg-[#F8FAF9]">
              <SafeImage
                src={CLINIC_IMAGES.heroDoctor}
                alt={`${profile.doctorName}, ${profile.qualification} at ${profile.clinicName}`}
                fallbackLabel={doctorName}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column proof & trust strip below the hero split */}
        <div className="mt-10 pt-8 border-t border-[#E2E8E5] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#14532D] tabular-nums">
              {profile.experienceYears}+
            </p>
            <p className="mt-1 text-sm text-[#47554D]">{t.hero.metrics.yearsLabel}</p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#14532D] tabular-nums">
              12,400+
            </p>
            <p className="mt-1 text-sm text-[#47554D]">{t.hero.metrics.patientsLabel}</p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#14532D] tabular-nums">
              {medicineCount}
            </p>
            <p className="mt-1 text-sm text-[#47554D]">{t.hero.metrics.remediesLabel}</p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#0369A1] tabular-nums">
              ₹{profile.firstConsultFeeInr}
            </p>
            <p className="mt-1 text-sm text-[#47554D]">{t.hero.metrics.consultLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
