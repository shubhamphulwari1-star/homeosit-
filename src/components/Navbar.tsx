import { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import type { ActiveRoute, ClinicProfile, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface NavbarProps {
  profile: ClinicProfile;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute, sectionId?: string) => void;
  onOpenSearch: () => void;
  t: TranslationCopy;
}

export function Navbar({
  profile,
  language,
  onLanguageChange,
  activeRoute,
  onNavigate,
  onOpenSearch,
  t,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const clinicTitle = language === 'hi' ? profile.clinicNameHi : profile.clinicName;

  const navItems: { label: string; route: ActiveRoute; sectionId?: string }[] = [
    { label: t.nav.home, route: 'home' },
    { label: t.nav.about, route: 'home', sectionId: 'about' },
    { label: t.nav.medicines, route: 'medicines' },
    { label: t.nav.categories, route: 'categories' },
    { label: t.nav.services, route: 'services' },
    { label: t.nav.blog, route: 'blog' },
    { label: t.nav.contact, route: 'home', sectionId: 'contact' },
  ];

  const handleLinkClick = (route: ActiveRoute, sectionId?: string) => {
    setMobileOpen(false);
    onNavigate(route, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D] rounded-md"
        >
          <span
            aria-hidden="true"
            className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center font-display font-bold text-base shrink-0"
          >
            +
          </span>
          <span className="font-display font-bold text-[17px] tracking-tight text-[#111C16] whitespace-nowrap">
            {clinicTitle}
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              !item.sectionId && activeRoute === item.route;
            return (
              <button
                key={`${item.route}-${item.label}`}
                type="button"
                onClick={() => handleLinkClick(item.route, item.sectionId)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D] ${
                  isActive
                    ? 'text-[#14532D] border-[#14532D]'
                    : 'text-[#47554D] border-transparent hover:text-[#14532D] hover:border-[#BBF7D0]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language selector, Search trigger, Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Language selector"
            className="hidden sm:flex items-center bg-[#F3F7F4] p-0.5 rounded-lg border border-[#E2E8E5]"
          >
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                language === 'en'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'text-[#47554D] hover:text-[#111C16]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                language === 'hi'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'text-[#47554D] hover:text-[#111C16]'
              }`}
            >
              हिं
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t.nav.searchPlaceholder}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E2E8E5] text-[#47554D] hover:text-[#14532D] hover:bg-[#F3F7F4] transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleLinkClick('home', 'appointment')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.bookAppointment}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="lg:hidden h-11 w-11 flex items-center justify-center rounded-lg border border-[#E2E8E5] text-[#111C16]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2E8E5] bg-white px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E5]">
            <span className="text-xs font-medium text-[#47554D]">Language / भाषा</span>
            <div className="flex items-center bg-[#F3F7F4] p-0.5 rounded-lg border border-[#E2E8E5]">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  language === 'en' ? 'bg-white text-[#14532D]' : 'text-[#47554D]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  language === 'hi' ? 'bg-white text-[#14532D]' : 'text-[#47554D]'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={`mob-${item.label}`}
                type="button"
                onClick={() => handleLinkClick(item.route, item.sectionId)}
                className="text-left px-3 py-2.5 text-sm font-medium text-[#111C16] rounded-lg hover:bg-[#ECFDF5] hover:text-[#14532D] transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('admin')}
              className="text-left px-3 py-2.5 text-sm font-medium text-[#0369A1] rounded-lg hover:bg-[#E0F2FE] transition-colors"
            >
              {t.nav.adminPortal}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleLinkClick('home', 'appointment')}
            className="w-full py-3 text-sm font-semibold text-white bg-[#14532D] rounded-lg"
          >
            {t.nav.bookAppointment}
          </button>
        </div>
      )}
    </header>
  );
}
