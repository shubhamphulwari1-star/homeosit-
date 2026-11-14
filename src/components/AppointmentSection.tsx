import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Appointment, ClinicProfile, HealthCategory, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';

const TIME_SLOTS = [
  '10:00 AM',
  '10:30 AM',
  '11:15 AM',
  '12:00 PM',
  '01:00 PM',
  '05:00 PM',
  '05:45 PM',
  '06:30 PM',
  '07:15 PM',
];

interface AppointmentSectionProps {
  profile: ClinicProfile;
  categories: HealthCategory[];
  language: Language;
  t: TranslationCopy;
  preselectedTopic: string;
}

export function AppointmentSection({
  profile,
  categories,
  language,
  t,
  preselectedTopic,
}: AppointmentSectionProps) {
  const [consultationType, setConsultationType] = useState<'In-Clinic' | 'Video Consultation'>('In-Clinic');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [preferredSlot, setPreferredSlot] = useState(TIME_SLOTS[0]);
  const [healthCategory, setHealthCategory] = useState(
    preselectedTopic || categories[0]?.name || 'General Constitutional Care'
  );
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  useEffect(() => {
    if (preselectedTopic) {
      setHealthCategory(preselectedTopic);
    }
  }, [preselectedTopic]);

  const activeFee =
    consultationType === 'Video Consultation'
      ? profile.videoConsultFeeInr
      : profile.firstConsultFeeInr;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phone,
          email,
          consultationType,
          preferredDate,
          preferredSlot,
          healthCategory,
          symptoms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to book appointment. Please verify your details.');
      } else {
        setConfirmed(data.appointment);
        setPatientName('');
        setPhone('');
        setEmail('');
        setSymptoms('');
      }
    } catch {
      setErrorMsg('Network error while submitting appointment request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="appointment" className="py-16 lg:py-20 bg-[#F8FAF9] border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#14532D]">{t.appointment.sectionLabel}</p>
            <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
              {t.appointment.title}
            </h2>
            <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.appointment.subtitle}</p>

            <div className="mt-8 rounded-2xl bg-white border border-[#E2E8E5] p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#47554D]">{t.about.firstVisit}</span>
                <span className="font-mono font-semibold text-[#111C16] tabular-nums">
                  ₹{profile.firstConsultFeeInr}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-[#E2E8E5]">
                <span className="text-[#47554D]">{t.about.followUp}</span>
                <span className="font-mono font-semibold text-[#111C16] tabular-nums">
                  ₹{profile.followUpFeeInr}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-[#E2E8E5]">
                <span className="text-[#47554D]">{t.about.videoConsult}</span>
                <span className="font-mono font-semibold text-[#0369A1] tabular-nums">
                  ₹{profile.videoConsultFeeInr}
                </span>
              </div>
              <p className="pt-3 border-t border-[#E2E8E5] text-xs text-[#64746B]">
                {language === 'hi' ? profile.timingsHi : profile.timings}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 sm:p-8">
              {confirmed ? (
                <div className="py-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#14532D] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display font-bold text-xl text-[#111C16]">
                        {t.appointment.confirmedTitle}
                      </h3>
                      <p className="mt-1 text-sm text-[#47554D]">{t.appointment.confirmedNote}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F8FAF9] border border-[#E2E8E5] p-5 grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#64746B]">Booking Reference</p>
                      <p className="font-mono font-semibold text-[#14532D] tabular-nums mt-0.5">
                        {confirmed.referenceCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Consultation Mode &amp; Fee</p>
                      <p className="font-medium text-[#111C16] mt-0.5">
                        {confirmed.consultationType} · ₹{confirmed.feeInr}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Patient</p>
                      <p className="font-medium text-[#111C16] mt-0.5">{confirmed.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64746B]">Requested Date &amp; Slot</p>
                      <p className="font-mono text-[#111C16] tabular-nums mt-0.5">
                        {confirmed.preferredDate} · {confirmed.preferredSlot}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmed(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-[#14532D] bg-[#ECFDF5] hover:bg-[#DCFCE7] rounded-xl transition-colors"
                  >
                    {t.appointment.bookAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Consultation Type Segmented Control */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3F7F4] rounded-xl border border-[#E2E8E5]">
                    <button
                      type="button"
                      onClick={() => setConsultationType('In-Clinic')}
                      className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors ${
                        consultationType === 'In-Clinic'
                          ? 'bg-white text-[#14532D] shadow-xs'
                          : 'text-[#47554D] hover:text-[#111C16]'
                      }`}
                    >
                      {t.appointment.inClinic} (₹{profile.firstConsultFeeInr})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('Video Consultation')}
                      className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors ${
                        consultationType === 'Video Consultation'
                          ? 'bg-white text-[#0369A1] shadow-xs'
                          : 'text-[#47554D] hover:text-[#111C16]'
                      }`}
                    >
                      {t.appointment.videoConsult} (₹{profile.videoConsultFeeInr})
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                        {t.appointment.patientName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g., Aarav Gupta"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                        {t.appointment.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98XXXXXXXX"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                        {t.appointment.preferredDate} *
                      </label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                        {t.appointment.preferredSlot} *
                      </label>
                      <select
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                        {t.appointment.email}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.in"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                      {t.appointment.healthCategory}
                    </label>
                    <input
                      type="text"
                      list="clinic-health-categories"
                      value={healthCategory}
                      onChange={(e) => setHealthCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                    <datalist id="clinic-health-categories">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#47554D] mb-1.5">
                      {t.appointment.symptoms}
                    </label>
                    <textarea
                      rows={3}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe duration, key symptoms, and current medications..."
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-sm text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-sm text-[#47554D]">
                      Consultation Fee:{' '}
                      <span className="font-mono font-semibold text-[#14532D] tabular-nums">
                        ₹{activeFee}
                      </span>{' '}
                      (payable at clinic / UPI on confirmation)
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors"
                    >
                      {submitting ? t.appointment.submitting : t.appointment.submit}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
