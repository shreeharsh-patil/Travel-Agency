import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Interactive destination map (Leaflet + OpenStreetMap, no API key required).
 * Uses the place's lat/lon when available, otherwise geocodes via the
 * free OpenStreetMap Nominatim endpoint through the /api/external-places route.
 */
export default function PlaceMap({ place }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const lookupCoordinates = async () => {
      const lat = parseFloat(place?.lat ?? place?.latitude);
      const lon = parseFloat(place?.lon ?? place?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        setCoords({ lat, lon });
        return;
      }

      if (Array.isArray(place?.coordinates) && place.coordinates.length === 2) {
        const [cLat, cLon] = place.coordinates;
        if (Number.isFinite(Number(cLat)) && Number.isFinite(Number(cLon))) {
          setCoords({ lat: Number(cLat), lon: Number(cLon) });
          return;
        }
      }

      // Geocode fallback via Nominatim.
      setGeocoding(true);
      setError(null);
      try {
        const query = place?.name || place?.city || place?.title || '';
        if (!query) {
          setError('Location unavailable for this destination.');
          return;
        }
        const res = await fetch(`/api/external-places?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const first = data?.places?.[0];
        if (!cancelled && first?.coordinates?.lat && first?.coordinates?.lon) {
          setCoords({ lat: parseFloat(first.coordinates.lat), lon: parseFloat(first.coordinates.lon) });
        } else if (!cancelled) {
          setError('Could not locate this destination on the map.');
        }
      } catch {


        if (!cancelled) setError('Map is temporarily unavailable.');
      } finally {
        if (!cancelled) setGeocoding(false);
      }
    };

    lookupCoordinates();
    return () => {
      cancelled = true;
    };
  }, [place]);

  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([coords.lat, coords.lon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const icon = L.divIcon({
      className: 'ht-map-pin',
      html: '<div class="ht-map-pin-dot"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    L.marker([coords.lat, coords.lon], { icon })
      .addTo(map)
      .bindPopup(`<b>${place?.name || place?.title || 'Destination'}</b>`)
      .openPopup();

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [coords, place]);

  return (
    <div className="space-y-3">
      <div
        ref={mapContainerRef}
        className="w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 z-0"
        style={{ background: '#141417' }}
      />
      <div className="flex items-center justify-between text-[10px] font-mono text-white/35">
        <span>
          {geocoding
            ? 'Locating destination…'
            : error
              ? error
              : `📍 ${coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : ''}`}
        </span>
        <span>Powered by OpenStreetMap • No API key required</span>
      </div>
    </div>
  );
}
