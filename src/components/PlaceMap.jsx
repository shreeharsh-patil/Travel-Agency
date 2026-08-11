import React, { useMemo } from 'react';

/**
 * Real Google Maps embed for a destination (no API key required).
 * Uses the place's stored google_maps_url when available, otherwise
 * builds a search query from the place name / city / country.
 */

function buildMapsQuery(place) {
  if (!place) return '';

  const stored = place.google_maps_url;
  if (typeof stored === 'string' && stored.trim()) {
    // Reuse the q= parameter from a stored maps.google.com URL.
    if (stored.includes('q=')) {
      try {
        const url = new URL(stored);
        const q = url.searchParams.get('q');
        if (q && q.trim()) return q.trim();
      } catch {
        // fall through to generic URL handling below
      }
    }
    if (stored.startsWith('http')) {
      return stored;
    }
  }

  const parts = [
    place.name || place.title,
    place.city,
    place.state_region,
    place.country
  ].filter(Boolean);
  return parts.join(', ') || 'Earth';
}

export default function PlaceMap({ place }) {
  const { embedSrc, externalUrl } = useMemo(() => {
    const query = buildMapsQuery(place);
    return {
      embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&hl=en&output=embed`,
      externalUrl: `https://maps.google.com/?q=${encodeURIComponent(query)}`
    };
  }, [place]);

  const label = place?.name || place?.title || 'destination';

  return (
    <div className="space-y-3">
      <div className="w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-[#141417]">
        <iframe
          title={`Map of ${label}`}
          src={embedSrc}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-white/35">
        <span className="truncate">📍 Live map of {label}</span>
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 hover:text-brand-gold transition-colors"
        >
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  );
}
