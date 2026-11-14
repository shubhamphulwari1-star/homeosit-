import { useState } from 'react';
import { Leaf } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, className = '', fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#ECFDF5] via-[#F0F9FF] to-[#F8FAF9] text-[#14532D] p-6 text-center ${className}`}
      >
        <Leaf className="w-8 h-8 mb-2 text-[#166534] opacity-75" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#14532D]/80 max-w-[18ch]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
