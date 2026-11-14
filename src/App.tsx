import { useCallback, useEffect, useState } from 'react';
import { translations } from './i18n/translations';
import type {
  ActiveRoute,
  BootstrapPayload,
  HealthCategory,
  Language,
  MedicineRecord,
} from './types/clinic';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { HeroSection } from './components/HeroSection';
import { ClinicDoctorSection } from './components/ClinicDoctorSection';
import { ServicesSection } from './components/ServicesSection';
import { MedicineDirectory } from './components/MedicineDirectory';
import { HealthCategories } from './components/HealthCategories';
import { AppointmentSection } from './components/AppointmentSection';
import { FaqSection } from './components/FaqSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loadError, setLoadError] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>('home');
  const [searchOpen, setSearchOpen] = useState(false);

  const [selectedMedicine, setSelectedMedicine] = useState<MedicineRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HealthCategory | null>(null);
  const [preselectedTopic, setPreselectedTopic] = useState('');

  // Tier 2 GMP Quota Exhaustion State
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) {
        throw new Error('Failed to load clinic directory.');
      }
      const payload = (await res.json()) as BootstrapPayload;
      setData(payload);
      setLoadError('');
    } catch {
      setLoadError('Unable to reach clinic server. Please reload the page.');
    }
  }, []);

  useEffect(() => {
    void fetchBootstrap();
  }, [fetchBootstrap]);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const handleNavigate = (route: ActiveRoute, sectionId?: string) => {
    setActiveRoute(route);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookWithContext = (topic: string) => {
    setPreselectedTopic(topic);
    handleNavigate('home', 'appointment');
  };

  const t = translations[language];

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-2xl border border-[#E2E8E5] p-6 text-center">
          <p className="font-display font-semibold text-lg text-[#111C16]">{loadError}</p>
          <button
            type="button"
            onClick={() => void fetchBootstrap()}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#14532D] rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-[#14532D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#47554D]">Loading Sukha Homeopathy Clinic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111C16]">
      {/* GMP Demo Quota Notification Banner (renders only if triggered at runtime) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        profile={data.profile}
        language={language}
        onLanguageChange={setLanguage}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
        t={t}
      />

      <main className="flex-1">
        {activeRoute === 'admin' ? (
          <AdminDashboard
            onPublicDataChanged={fetchBootstrap}
            onExitAdmin={() => handleNavigate('home')}
          />
        ) : activeRoute === 'medicines' ? (
          <MedicineDirectory
            medicines={data.medicines}
            t={t}
            mode="full"
            selectedMedicine={selectedMedicine}
            onSelectMedicine={setSelectedMedicine}
            onBookConsultation={handleBookWithContext}
          />
        ) : activeRoute === 'categories' ? (
          <HealthCategories
            categories={data.categories}
            medicines={data.medicines}
            language={language}
            t={t}
            mode="full"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenMedicine={(med) => {
              setActiveRoute('medicines');
              setSelectedMedicine(med);
            }}
            onBookForCategory={handleBookWithContext}
          />
        ) : activeRoute === 'services' ? (
          <>
            <ServicesSection
              services={data.services}
              language={language}
              t={t}
              onBookService={handleBookWithContext}
            />
            <AppointmentSection
              profile={data.profile}
              categories={data.categories}
              language={language}
              t={t}
              preselectedTopic={preselectedTopic}
            />
          </>
        ) : activeRoute === 'blog' ? (
          <BlogSection articles={data.articles} language={language} t={t} mode="full" />
        ) : (
          /* Complete Homepage */
          <>
            <HeroSection
              profile={data.profile}
              language={language}
              t={t}
              medicineCount={data.medicines.length}
              onNavigate={handleNavigate}
            />

            <ClinicDoctorSection
              profile={data.profile}
              language={language}
              t={t}
              onBookClick={() => handleNavigate('home', 'appointment')}
            />

            <ServicesSection
              services={data.services}
              language={language}
              t={t}
              onBookService={handleBookWithContext}
            />

            <MedicineDirectory
              medicines={data.medicines}
              t={t}
              mode="preview"
              selectedMedicine={selectedMedicine}
              onSelectMedicine={setSelectedMedicine}
              onExploreAll={() => handleNavigate('medicines')}
              onBookConsultation={handleBookWithContext}
            />

            <HealthCategories
              categories={data.categories}
              medicines={data.medicines}
              language={language}
              t={t}
              mode="preview"
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onExploreAll={() => handleNavigate('categories')}
              onOpenMedicine={(med) => setSelectedMedicine(med)}
              onBookForCategory={handleBookWithContext}
            />

            <AppointmentSection
              profile={data.profile}
              categories={data.categories}
              language={language}
              t={t}
              preselectedTopic={preselectedTopic}
            />

            <BlogSection articles={data.articles} language={language} t={t} mode="preview" />

            <FaqSection faqs={data.faqs} language={language} t={t} />

            <ContactSection
              profile={data.profile}
              mapsApiKey={data.mapsApiKey}
              language={language}
              t={t}
            />
          </>
        )}
      </main>

      <Footer
        profile={data.profile}
        language={language}
        t={t}
        onNavigate={handleNavigate}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        medicines={data.medicines}
        categories={data.categories}
        language={language}
        t={t}
        onSelectMedicine={(med) => {
          setActiveRoute('medicines');
          setSelectedMedicine(med);
        }}
        onSelectCategory={(cat) => {
          setActiveRoute('categories');
          setSelectedCategory(cat);
        }}
      />
    </div>
  );
}
