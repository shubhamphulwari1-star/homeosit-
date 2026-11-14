import { CLINIC_IMAGES } from '../lib/imageAssets';
import type { ClinicProfile, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';

interface ClinicDoctorSectionProps {
  profile: ClinicProfile;
  language: Language;
  t: TranslationCopy;
  onBookClick: () => void;
}

export function ClinicDoctorSection({
  profile,
  language,
  t,
  onBookClick,
}: ClinicDoctorSectionProps) {
  const doctorName = language === 'hi' ? profile.doctorNameHi : profile.doctorName;
  const clinicName = language === 'hi' ? profile.clinicNameHi : profile.clinicName;
  const aboutText = language === 'hi' ? profile.aboutTextHi : profile.aboutText;
  const timings = language === 'hi' ? profile.timingsHi : profile.timings;
  const address = language === 'hi' ? profile.addressHi : profile.address;

  return (
    <section id="about" className="py-16 lg:py-20 bg-[#F8FAF9] border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Clinic Interior Photography */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#E2E8E5] bg-white">
              <SafeImage
                src={CLINIC_IMAGES.clinicInterior}
                alt={`${profile.clinicName} apothecary and reception`}
                fallbackLabel={clinicName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Clinic & Doctor Profile Details */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-[#14532D]">{t.about.sectionLabel}</p>
              <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
                {t.about.title}
              </h2>
              <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-[#47554D]">
                {aboutText}
              </p>

              {/* Doctor metadata grid */}
              <div className="mt-6 pt-6 border-t border-[#E2E8E5] grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#64746B]">{t.about.doctorTitle}</p>
                  <p className="mt-1 text-base font-semibold text-[#111C16]">{doctorName}</p>
                  <p className="text-sm text-[#47554D]">{profile.qualification}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64746B]">{t.about.regLabel}</p>
                  <p className="mt-1 font-mono text-sm font-medium text-[#111C16] tabular-nums">
                    {profile.registrationNumber}
                  </p>
                  <p className="text-sm text-[#47554D]">{address}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2E8E5]">
                <p className="text-xs font-medium text-[#64746B]">{t.about.timingsLabel}</p>
                <p className="mt-1 text-sm font-medium text-[#111C16]">{timings}</p>
              </div>
            </div>

            {/* INR Fee Schedule */}
            <div className="mt-6 rounded-xl bg-white border border-[#E2E8E5] p-5">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-sm font-semibold text-[#111C16]">{t.about.feeTitle}</h3>
                <button
                  type="button"
                  onClick={onBookClick}
                  className="text-xs font-semibold text-[#14532D] hover:underline whitespace-nowrap shrink-0"
                >
                  {t.nav.bookAppointment}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E2E8E5]">
                <div>
                  <p className="text-xs text-[#64746B]">{t.about.firstVisit}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-[#14532D] tabular-nums">
                    ₹{profile.firstConsultFeeInr}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64746B]">{t.about.followUp}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-[#14532D] tabular-nums">
                    ₹{profile.followUpFeeInr}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64746B]">{t.about.videoConsult}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-[#0369A1] tabular-nums">
                    ₹{profile.videoConsultFeeInr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
