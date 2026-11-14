import { Lock } from 'lucide-react';
import type { ActiveRoute, ClinicProfile, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface FooterProps {
  profile: ClinicProfile;
  language: Language;
  t: TranslationCopy;
  onNavigate: (route: ActiveRoute, sectionId?: string) => void;
}

export function Footer({ profile, language, t, onNavigate }: FooterProps) {
  const clinicName = language === 'hi' ? profile.clinicNameHi : profile.clinicName;
  const doctorName = language === 'hi' ? profile.doctorNameHi : profile.doctorName;
  const address = language === 'hi' ? profile.addressHi : profile.address;
  const timings = language === 'hi' ? profile.timingsHi : profile.timings;

  return (
    <footer className="bg-[#111C16] text-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div>
            <p className="font-display font-bold text-lg text-white">{clinicName}</p>
            <p className="mt-2 text-sm text-[#B7C4BC]">
              {doctorName} · {profile.qualification}
            </p>
            <p className="mt-1 font-mono text-xs text-[#94A39B]">
              Reg. {profile.registrationNumber}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">{t.footer.quickLinks}</h3>
            <ul className="space-y-2 text-sm text-[#B7C4BC]">
              <li>
                <button type="button" onClick={() => onNavigate('home')} className="hover:text-white">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('medicines')}
                  className="hover:text-white"
                >
                  {t.nav.medicines}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('categories')}
                  className="hover:text-white"
                >
                  {t.nav.categories}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-white"
                >
                  {t.nav.services}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">{t.footer.patientResources}</h3>
            <ul className="space-y-2 text-sm text-[#B7C4BC]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'appointment')}
                  className="hover:text-white"
                >
                  {t.nav.bookAppointment}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('blog')} className="hover:text-white">
                  {t.nav.blog}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'faq')}
                  className="hover:text-white"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 text-[#86EFAC] hover:text-white"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {t.nav.adminPortal}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">{t.footer.clinicHours}</h3>
            <p className="text-sm text-[#B7C4BC] leading-relaxed">{address}</p>
            <p className="mt-2 text-xs text-[#94A39B] leading-relaxed">{timings}</p>
            <p className="mt-2 font-mono text-sm text-white tabular-nums">{profile.phone}</p>
          </div>
        </div>

        <div className="pt-8 space-y-2 text-xs text-[#94A39B] leading-relaxed">
          <p>{t.footer.disclaimer}</p>
          <p>
            {t.footer.mapsTerms}{' '}
            <a
              href="https://maps.google.com/help/terms_maps/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Google Maps End User Terms
            </a>
            .
          </p>
          <p className="pt-2 text-[#B7C4BC]">
            © {new Date().getFullYear()} {clinicName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
