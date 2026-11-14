import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, RotateCcw, Search, ShieldAlert, X } from 'lucide-react';
import { resolveMedicineImage } from '../lib/imageAssets';
import { MEDICINE_CATEGORIES, type MedicineRecord } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';
import { SafeImage } from './SafeImage';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface MedicineDirectoryProps {
  medicines: MedicineRecord[];
  t: TranslationCopy;
  mode: 'preview' | 'full';
  selectedMedicine: MedicineRecord | null;
  onSelectMedicine: (medicine: MedicineRecord | null) => void;
  onExploreAll?: () => void;
  onBookConsultation: (contextTopic: string) => void;
}

export function MedicineDirectory({
  medicines,
  t,
  mode,
  selectedMedicine,
  onSelectMedicine,
  onExploreAll,
  onBookConsultation,
}: MedicineDirectoryProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('ALL');
  const [selectedProductType, setSelectedProductType] = useState<string>('ALL');
  const [selectedPotency, setSelectedPotency] = useState<string>('ALL');

  const publishedMedicines = useMemo(
    () => medicines.filter((m) => m.publicationStatus === 'Published'),
    [medicines]
  );

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    publishedMedicines.forEach((m) => {
      const ch = m.medicineName.trim().charAt(0).toUpperCase();
      if (ch) set.add(ch);
    });
    return set;
  }, [publishedMedicines]);

  const manufacturers = useMemo(
    () => Array.from(new Set(publishedMedicines.map((m) => m.manufacturer))).sort(),
    [publishedMedicines]
  );

  const productTypes = useMemo(
    () => Array.from(new Set(publishedMedicines.map((m) => m.productType))).sort(),
    [publishedMedicines]
  );

  const potencies = useMemo(() => {
    const set = new Set<string>();
    publishedMedicines.forEach((m) => m.availablePotencies.forEach((p) => set.add(p)));
    return Array.from(set);
  }, [publishedMedicines]);

  const filteredMedicines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedMedicines
      .filter((m) => {
        if (selectedLetter !== 'ALL' && !m.medicineName.toUpperCase().startsWith(selectedLetter)) {
          return false;
        }
        if (selectedCategory !== 'ALL' && m.medicineCategory !== selectedCategory) {
          return false;
        }
        if (selectedManufacturer !== 'ALL' && m.manufacturer !== selectedManufacturer) {
          return false;
        }
        if (selectedProductType !== 'ALL' && m.productType !== selectedProductType) {
          return false;
        }
        if (selectedPotency !== 'ALL' && !m.availablePotencies.includes(selectedPotency)) {
          return false;
        }
        if (q) {
          return (
            m.medicineName.toLowerCase().includes(q) ||
            m.scientificName.toLowerCase().includes(q) ||
            m.commonName.toLowerCase().includes(q) ||
            m.botanicalSource.toLowerCase().includes(q) ||
            m.medicineId.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.medicineName.localeCompare(b.medicineName));
  }, [
    publishedMedicines,
    selectedLetter,
    selectedCategory,
    selectedManufacturer,
    selectedProductType,
    selectedPotency,
    searchQuery,
  ]);

  const displayedMedicines = mode === 'preview' ? filteredMedicines.slice(0, 6) : filteredMedicines;

  const resetFilters = () => {
    setSelectedLetter('ALL');
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedManufacturer('ALL');
    setSelectedProductType('ALL');
    setSelectedPotency('ALL');
  };

  return (
    <section
      id="medicines"
      className={`py-16 lg:py-20 ${mode === 'preview' ? 'bg-[#F8FAF9] border-b border-[#E2E8E5]' : 'bg-white min-h-[75vh]'}`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#14532D]">{t.medicines.sectionLabel}</p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
              {t.medicines.title}
            </h2>
            <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.medicines.subtitle}</p>
          </div>

          {mode === 'preview' && onExploreAll ? (
            <button
              type="button"
              onClick={onExploreAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl transition-colors whitespace-nowrap shrink-0 w-fit"
            >
              {t.medicines.exploreAll}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-sm text-[#47554D] shrink-0">
              <span className="font-mono font-semibold text-[#14532D] tabular-nums">
                {filteredMedicines.length}
              </span>{' '}
              {t.medicines.showingCount}
            </div>
          )}
        </div>

        {/* Alphabetical A–Z Bar */}
        <div className="mt-8 rounded-2xl bg-white border border-[#E2E8E5] p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter medicines A to Z">
            <button
              type="button"
              onClick={() => setSelectedLetter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedLetter === 'ALL'
                  ? 'bg-[#14532D] text-white'
                  : 'bg-[#F3F7F4] text-[#47554D] hover:text-[#111C16]'
              }`}
            >
              A–Z
            </button>
            {ALPHABET.map((letter) => {
              const hasRecords = availableLetters.has(letter);
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!hasRecords}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-8 h-8 text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#14532D] text-white'
                      : hasRecords
                        ? 'bg-[#F8FAF9] text-[#111C16] hover:bg-[#DCFCE7] hover:text-[#14532D] border border-[#E2E8E5]'
                        : 'text-[#94A39B] opacity-45 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Search & Multi-filter Toolbar */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-[#E2E8E5]">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-[#64746B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.medicines.searchLabel}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg text-[#111C16] placeholder-[#64746B] focus:outline-none focus:border-[#14532D]"
              />
            </div>

            <select
              aria-label="Filter by medicine category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg text-[#111C16] focus:outline-none focus:border-[#14532D]"
            >
              <option value="ALL">{t.medicines.allCategories}</option>
              {MEDICINE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by manufacturer"
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-3 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg text-[#111C16] focus:outline-none focus:border-[#14532D]"
            >
              <option value="ALL">{t.medicines.allManufacturers}</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                aria-label="Filter by potency"
                value={selectedPotency}
                onChange={(e) => setSelectedPotency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg text-[#111C16] focus:outline-none focus:border-[#14532D]"
              >
                <option value="ALL">{t.medicines.allPotencies}</option>
                {potencies.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {(selectedLetter !== 'ALL' ||
                searchQuery ||
                selectedCategory !== 'ALL' ||
                selectedManufacturer !== 'ALL' ||
                selectedProductType !== 'ALL' ||
                selectedPotency !== 'ALL') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title={t.medicines.resetFilters}
                  className="px-3 py-2 text-sm text-[#47554D] hover:text-[#111C16] bg-[#F3F7F4] rounded-lg border border-[#E2E8E5] shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {mode === 'full' && (
            <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#E2E8E5]">
              <span className="text-xs font-medium text-[#64746B] mr-1">Product Type:</span>
              <button
                type="button"
                onClick={() => setSelectedProductType('ALL')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedProductType === 'ALL'
                    ? 'bg-[#DCFCE7] text-[#14532D] font-semibold'
                    : 'text-[#47554D] hover:bg-[#F3F7F4]'
                }`}
              >
                {t.medicines.allProductTypes}
              </button>
              {productTypes.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setSelectedProductType(pt)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedProductType === pt
                      ? 'bg-[#DCFCE7] text-[#14532D] font-semibold'
                      : 'text-[#47554D] hover:bg-[#F3F7F4]'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Medicine Cards Grid */}
        {displayedMedicines.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E2E8E5] bg-white p-10 text-center">
            <p className="text-base font-medium text-[#111C16]">{t.medicines.noResults}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm font-semibold text-[#14532D] bg-[#ECFDF5] rounded-lg hover:bg-[#DCFCE7]"
            >
              {t.medicines.resetFilters}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMedicines.map((med) => (
              <article
                key={med.medicineId}
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8E5] bg-white overflow-hidden hover:border-[#86EFAC] transition-colors"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#F8FAF9] border-b border-[#E2E8E5] overflow-hidden">
                    <SafeImage
                      src={resolveMedicineImage(med.productImage)}
                      alt={`${med.medicineName} (${med.medicineCategory})`}
                      fallbackLabel={med.medicineName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#64746B]">
                      <span className="font-mono">{med.medicineId}</span>
                      <span>{med.medicineCategory}</span>
                    </div>

                    <h3 className="mt-2 font-display font-semibold text-lg text-[#111C16]">
                      {med.medicineName}
                    </h3>

                    <p className="mt-0.5 text-xs italic text-[#47554D]">{med.scientificName}</p>

                    <p className="mt-3 text-sm text-[#47554D] line-clamp-2 leading-relaxed">
                      {med.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#E2E8E5] text-xs text-[#47554D] space-y-1">
                      <p className="truncate">
                        <span className="text-[#64746B]">Manufacturer:</span> {med.manufacturer}
                      </p>
                      <p className="truncate font-mono">
                        <span className="font-sans text-[#64746B]">Potencies:</span>{' '}
                        {med.availablePotencies.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => onSelectMedicine(med)}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-[#14532D] bg-[#ECFDF5] hover:bg-[#DCFCE7] rounded-xl transition-colors"
                  >
                    {t.medicines.viewDetails}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-[#64746B]">{t.medicines.safetyNotice}</p>
      </div>

      {/* Complete 18-Field Medicine Detail Modal */}
      {selectedMedicine && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMedicine.medicineName} monograph`}
          className="fixed inset-0 z-50 bg-[#111C16]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => onSelectMedicine(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl border border-[#E2E8E5] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-[#E2E8E5] flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#47554D] font-mono">
                  {selectedMedicine.medicineId} · {selectedMedicine.medicineCategory} ·{' '}
                  {selectedMedicine.publicationStatus}
                </p>
                <h3 className="mt-1 font-display font-bold text-xl sm:text-2xl text-[#111C16]">
                  {selectedMedicine.medicineName}
                </h3>
                <p className="text-sm italic text-[#47554D]">{selectedMedicine.scientificName}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectMedicine(null)}
                aria-label="Close medicine details"
                className="p-2 rounded-lg text-[#47554D] hover:bg-[#F3F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-12 gap-6 items-start">
                <div className="sm:col-span-5 rounded-xl overflow-hidden border border-[#E2E8E5] aspect-[4/3] bg-[#F8FAF9]">
                  <SafeImage
                    src={resolveMedicineImage(selectedMedicine.productImage)}
                    alt={selectedMedicine.medicineName}
                    fallbackLabel={selectedMedicine.medicineName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-7 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-xs text-[#64746B]">Common Name</p>
                      <p className="font-medium text-[#111C16]">{selectedMedicine.commonName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Product Type</p>
                      <p className="font-medium text-[#111C16]">{selectedMedicine.productType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Manufacturer</p>
                      <p className="font-medium text-[#111C16]">{selectedMedicine.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Last Updated</p>
                      <p className="font-mono text-[#111C16] tabular-nums">
                        {selectedMedicine.lastUpdatedDate}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8E5]">
                    <p className="text-xs text-[#64746B]">Botanical / Mineral Source</p>
                    <p className="font-medium text-[#111C16] mt-0.5">
                      {selectedMedicine.botanicalSource || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8E5]">
                    <div>
                      <p className="text-xs text-[#64746B]">Available Potencies</p>
                      <p className="font-mono text-xs sm:text-sm text-[#14532D] font-medium mt-0.5">
                        {selectedMedicine.availablePotencies.join(', ') || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Available Pack Sizes</p>
                      <p className="font-mono text-xs sm:text-sm text-[#111C16] mt-0.5">
                        {selectedMedicine.availablePackSizes.join(', ') || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8E5] space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-[#64746B]">Materia Medica Description</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#111C16]">
                    {selectedMedicine.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[#64746B]">Classical Reference</h4>
                  <p className="mt-1 text-sm font-medium text-[#14532D]">
                    {selectedMedicine.classicalReference}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#0369A1] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#0369A1]">Safety Information</h4>
                    <p className="mt-1 text-sm text-[#0C4A6E] leading-relaxed">
                      {selectedMedicine.safetyInformation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  {selectedMedicine.sourceUrl ? (
                    <a
                      href={selectedMedicine.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0369A1] hover:underline"
                    >
                      Pharmacopoeia Source Reference
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const medName = selectedMedicine.medicineName;
                      onSelectMedicine(null);
                      onBookConsultation(`Consultation regarding ${medName}`);
                    }}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl transition-colors"
                  >
                    {t.nav.bookAppointment}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
