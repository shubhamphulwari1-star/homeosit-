import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import type { HealthCategory, Language, MedicineRecord } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface HealthCategoriesProps {
  categories: HealthCategory[];
  medicines: MedicineRecord[];
  language: Language;
  t: TranslationCopy;
  mode: 'preview' | 'full';
  selectedCategory: HealthCategory | null;
  onSelectCategory: (category: HealthCategory | null) => void;
  onExploreAll?: () => void;
  onOpenMedicine: (medicine: MedicineRecord) => void;
  onBookForCategory: (categoryName: string) => void;
}

export function HealthCategories({
  categories,
  medicines,
  language,
  t,
  mode,
  selectedCategory,
  onSelectCategory,
  onExploreAll,
  onOpenMedicine,
  onBookForCategory,
}: HealthCategoriesProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => set.add(c.letter.toUpperCase()));
    return set;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories
      .filter((cat) => {
        if (selectedLetter !== 'ALL' && cat.letter.toUpperCase() !== selectedLetter) {
          return false;
        }
        if (q) {
          return (
            cat.name.toLowerCase().includes(q) ||
            cat.nameHi.toLowerCase().includes(q) ||
            cat.system.toLowerCase().includes(q) ||
            cat.summary.toLowerCase().includes(q) ||
            cat.commonSymptoms.some((s) => s.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, selectedLetter, searchQuery]);

  const displayed = mode === 'preview' ? filtered.slice(0, 6) : filtered;

  return (
    <section
      id="categories"
      className={`py-16 lg:py-20 ${mode === 'preview' ? 'bg-white border-b border-[#E2E8E5]' : 'bg-white min-h-[75vh]'}`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#0369A1]">{t.categories.sectionLabel}</p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
              {t.categories.title}
            </h2>
            <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.categories.subtitle}</p>
          </div>

          {mode === 'preview' && onExploreAll && (
            <button
              type="button"
              onClick={onExploreAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl transition-colors whitespace-nowrap shrink-0 w-fit"
            >
              {t.categories.exploreAll}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alphabetical A–Z Strip + Search */}
        <div className="mt-8 rounded-2xl bg-[#F8FAF9] border border-[#E2E8E5] p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter health categories A to Z">
            <button
              type="button"
              onClick={() => setSelectedLetter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedLetter === 'ALL'
                  ? 'bg-[#0369A1] text-white'
                  : 'bg-white text-[#47554D] border border-[#E2E8E5] hover:text-[#111C16]'
              }`}
            >
              A–Z
            </button>
            {ALPHABET.map((letter) => {
              const active = availableLetters.has(letter);
              const selected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!active}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-8 h-8 text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                    selected
                      ? 'bg-[#0369A1] text-white'
                      : active
                        ? 'bg-white text-[#111C16] border border-[#E2E8E5] hover:bg-[#E0F2FE] hover:text-[#0369A1]'
                        : 'text-[#94A39B] opacity-40 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#64746B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.categories.searchLabel}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8E5] rounded-lg text-[#111C16] placeholder-[#64746B] focus:outline-none focus:border-[#0369A1]"
            />
          </div>
        </div>

        {/* Category Cards */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((cat) => (
            <article
              key={cat.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8E5] bg-white p-6 hover:border-[#7DD3FC] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#64746B]">
                  <span className="font-mono font-semibold text-[#0369A1]">{cat.letter}</span>
                  <span>{cat.system}</span>
                </div>

                <h3 className="mt-2 font-display font-semibold text-lg text-[#111C16]">
                  {language === 'hi' ? cat.nameHi : cat.name}
                </h3>

                <p className="mt-2 text-sm text-[#47554D] leading-relaxed">
                  {language === 'hi' ? cat.summaryHi : cat.summary}
                </p>

                <p className="mt-4 pt-3 border-t border-[#E2E8E5] text-xs text-[#64746B]">
                  {cat.commonSymptoms.join(' · ')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#14532D] hover:underline w-fit"
              >
                Review Clinical Approach
                <ArrowRight className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedCategory.name}
          className="fixed inset-0 z-50 bg-[#111C16]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => onSelectCategory(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl border border-[#E2E8E5] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E2E8E5] flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#0369A1]">
                  {selectedCategory.letter} · {selectedCategory.system}
                </p>
                <h3 className="mt-1 font-display font-bold text-xl sm:text-2xl text-[#111C16]">
                  {language === 'hi' ? selectedCategory.nameHi : selectedCategory.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                aria-label="Close health category modal"
                className="p-2 rounded-lg text-[#47554D] hover:bg-[#F3F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm sm:text-base text-[#47554D] leading-relaxed">
                {language === 'hi' ? selectedCategory.summaryHi : selectedCategory.summary}
              </p>

              <div>
                <h4 className="text-xs font-semibold text-[#64746B]">Common Clinical Presentations</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-[#111C16]">
                  {selectedCategory.commonSymptoms.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-[#14532D]">
                        —
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#F8FAF9] border border-[#E2E8E5] p-4">
                <h4 className="text-xs font-semibold text-[#14532D]">Constitutional Homeopathic Approach</h4>
                <p className="mt-1.5 text-sm text-[#47554D] leading-relaxed">
                  {selectedCategory.homeopathicApproach}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#64746B] mb-2">
                  Published Materia Medica Remedies Often Studied
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.relatedMedicineNames.map((medName) => {
                    const matched = medicines.find(
                      (m) => m.medicineName.toLowerCase() === medName.toLowerCase()
                    );
                    if (matched) {
                      return (
                        <button
                          key={medName}
                          type="button"
                          onClick={() => {
                            onSelectCategory(null);
                            onOpenMedicine(matched);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#14532D] bg-[#ECFDF5] hover:bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg transition-colors"
                        >
                          {medName}
                        </button>
                      );
                    }
                    return (
                      <span
                        key={medName}
                        className="px-3 py-1.5 text-xs text-[#47554D] bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg"
                      >
                        {medName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8E5] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const name = selectedCategory.name;
                    onSelectCategory(null);
                    onBookForCategory(name);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-xl transition-colors"
                >
                  {t.categories.consultCondition}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
