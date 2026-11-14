import { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';
import type { ClinicProfile, Language } from '../types/clinic';

interface ClinicMapProps {
  apiKey: string;
  profile: ClinicProfile;
  language: Language;
  directionsLabel: string;
}

export function ClinicMap({ apiKey, profile, language, directionsLabel }: ClinicMapProps) {
  const effectiveKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || apiKey;
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const clinicName = language === 'hi' ? profile.clinicNameHi : profile.clinicName;
  const address = language === 'hi' ? profile.addressHi : profile.address;
  const timings = language === 'hi' ? profile.timingsHi : profile.timings;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${profile.clinicName}, ${profile.address}`
  )}`;

  if (!effectiveKey) {
    return (
      <div className="h-[340px] sm:h-[380px] w-full rounded-2xl border border-[#E2E8E5] bg-gradient-to-br from-[#ECFDF5] to-[#F0F9FF] p-6 flex flex-col items-center justify-center text-center">
        <MapPin className="w-8 h-8 text-[#14532D] mb-3" />
        <p className="font-display font-semibold text-base text-[#111C16]">{clinicName}</p>
        <p className="mt-1 text-sm text-[#47554D] max-w-sm">{address}</p>
        <p className="mt-1 font-mono text-xs text-[#64746B] tabular-nums">
          {profile.coordinates.lat.toFixed(4)}° N, {profile.coordinates.lng.toFixed(4)}° E
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors"
        >
          {directionsLabel}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="h-[340px] sm:h-[380px] w-full rounded-2xl overflow-hidden border border-[#E2E8E5] bg-[#F8FAF9]">
      <APIProvider apiKey={effectiveKey} language={language} region="IN">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={profile.coordinates}
          defaultZoom={15}
          gestureHandling="cooperative"
          className="w-full h-full"
        >
          <AdvancedMarker
            ref={markerRef}
            position={profile.coordinates}
            title={clinicName}
            onClick={() => setInfoOpen((prev) => !prev)}
          >
            <Pin background="#14532D" borderColor="#052E16" glyphColor="#FFFFFF" />
          </AdvancedMarker>

          {infoOpen && marker && (
            <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={260}>
              <div className="p-1 text-left">
                <p className="font-display font-semibold text-sm text-[#111C16]">{clinicName}</p>
                <p className="mt-1 text-xs text-[#47554D] leading-snug">{address}</p>
                <p className="mt-1 text-[11px] text-[#64746B]">{timings}</p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#14532D] hover:underline"
                >
                  {directionsLabel}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
