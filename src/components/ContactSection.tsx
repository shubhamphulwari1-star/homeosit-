import { useState, type FormEvent } from 'react';
import { CheckCircle2, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ClinicProfile, Language } from '../types/clinic';
import type { TranslationCopy } from '../i18n/translations';
import { ClinicMap } from './ClinicMap';

interface ContactSectionProps {
  profile: ClinicProfile;
  mapsApiKey: string;
  language: Language;
  t: TranslationCopy;
}

export function ContactSection({ profile, mapsApiKey, language, t }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const address = language === 'hi' ? profile.addressHi : profile.address;
  const timings = language === 'hi' ? profile.timingsHi : profile.timings;
  const whatsappClean = profile.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
    `Hello ${profile.clinicName}, I would like to inquire regarding a homeopathic consultation.`
  )}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${profile.clinicName}, ${profile.address}`
  )}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSending(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to send inquiry.');
      } else {
        setSent(true);
        setName('');
        setPhone('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setErrorMsg('Network error while sending inquiry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-20 bg-[#F8FAF9] border-b border-[#E2E8E5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#14532D]">{t.contact.sectionLabel}</p>
          <h2 className="mt-2 font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#111C16] [text-wrap:balance]">
            {t.contact.title}
          </h2>
          <p className="mt-3 text-base text-[#47554D] leading-relaxed">{t.contact.subtitle}</p>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Information + Inquiry Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6 grid sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-xs font-medium text-[#64746B] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#14532D]" />
                  {t.contact.addressLabel}
                </p>
                <p className="mt-1.5 text-[#111C16] leading-relaxed">{address}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64746B] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#14532D]" />
                  {t.contact.phoneLabel}
                </p>
                <a
                  href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                  className="mt-1.5 block font-mono font-medium text-[#111C16] hover:text-[#14532D] tabular-nums"
                >
                  {profile.phone}
                </a>
                <p className="mt-2 text-xs text-[#64746B]">{timings}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64746B] flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#14532D]" />
                  {t.contact.whatsappLabel}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 font-medium text-[#14532D] hover:underline"
                >
                  {t.contact.chatWhatsapp}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-[#64746B] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0369A1]" />
                  {t.contact.emailLabel}
                </p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-1.5 block font-medium text-[#0369A1] hover:underline break-all"
                >
                  {profile.email}
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#E2E8E5] p-6">
              <h3 className="font-display font-semibold text-lg text-[#111C16] mb-4">
                {t.contact.formTitle}
              </h3>

              {sent ? (
                <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#14532D]">{t.contact.inquirySent}</p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-2 text-xs font-semibold text-[#14532D] underline"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name *"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile / WhatsApp *"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject (e.g., Medicine Courier)"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your question for the clinic desk..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-lg focus:outline-none focus:border-[#14532D]"
                  />
                  {errorMsg && <p className="text-xs text-[#B91C1C]">{errorMsg}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14532D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors"
                  >
                    {sending ? 'Sending...' : t.contact.sendInquiry}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Google Maps Integration */}
          <div className="lg:col-span-6 space-y-3">
            <ClinicMap
              apiKey={mapsApiKey}
              profile={profile}
              language={language}
              directionsLabel={t.contact.getDirections}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-[#47554D]">
              <span>{address}</span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#14532D] hover:underline"
              >
                {t.contact.getDirections}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
