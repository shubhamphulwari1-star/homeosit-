import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import type { HealthCategory, Language, MedicineRecord } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: MedicineRecord[];
  categories: HealthCategory[];
  language: Language;
  t: TranslationCopy;
  onSelectMedicine: (medicine: MedicineRecord) => void;
  onSelectCategory: (category: HealthCategory) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  medicines,
  categories,
  language,
  t,
  onSelectMedicine,
  onSelectCategory,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const { matchedMedicines, matchedCategories } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedMedicines: medicines.slice(0, 5),
        matchedCategories: categories.slice(0, 4),
      };
    }
    return {
      matchedMedicines: medicines
        .filter(
          (m) =>
            m.medicineName.toLowerCase().includes(q) ||
            m.scientificName.toLowerCase().includes(q) ||
            m.commonName.toLowerCase().includes(q) ||
            m.medicineCategory.toLowerCase().includes(q)
        )
        .slice(0, 6),
      matchedCategories: categories
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.nameHi.toLowerCase().includes(q) ||
            c.system.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q)
        )
        .slice(0, 5),
    };
  }, [query, medicines, categories]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search clinic remedies and health categories"
      className="fixed inset-0 z-50 bg-[#111C16]/45 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8E5] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8E5]">
          <Search className="w-5 h-5 text-[#14532D] shrink-0" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full text-sm sm:text-base text-[#111C16] placeholder-[#64746B] focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-lg text-[#47554D] hover:bg-[#F3F7F4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-[#47554D] mb-2.5">
              {t.medicines.sectionLabel}
            </h3>
            {matchedMedicines.length === 0 ? (
              <p className="text-sm text-[#64746B]">{t.medicines.noResults}</p>
            ) : (
              <div className="divide-y divide-[#E2E8E5] border border-[#E2E8E5] rounded-xl overflow-hidden">
                {matchedMedicines.map((med) => (
                  <button
                    key={med.medicineId}
                    type="button"
                    onClick={() => {
                      onSelectMedicine(med);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[#ECFDF5]/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111C16] truncate">
                        {med.medicineName}
                      </p>
                      <p className="text-xs text-[#47554D] truncate">
                        {med.medicineCategory} · {med.manufacturer} · {med.availablePotencies.join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#14532D] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#47554D] mb-2.5">
              {t.categories.sectionLabel}
            </h3>
            {matchedCategories.length === 0 ? (
              <p className="text-sm text-[#64746B]">No matching health categories.</p>
            ) : (
              <div className="divide-y divide-[#E2E8E5] border border-[#E2E8E5] rounded-xl overflow-hidden">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[#E0F2FE]/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111C16] truncate">
                        {language === 'hi' ? cat.nameHi : cat.name}
                      </p>
                      <p className="text-xs text-[#47554D] truncate">
                        {cat.system} · {cat.commonSymptoms.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0369A1] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
