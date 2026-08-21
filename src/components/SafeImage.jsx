import React, { useEffect, useState } from 'react';

// Third-party image hosts can be unavailable on mobile networks, behind a
// content blocker, or removed by their owner. Keep the layout intact and use
// an app-owned editorial image instead of leaving a broken-image icon.
const FALLBACK_IMAGE = '/images/tropical_beach.png';

export default function SafeImage({ src, alt = '', fallbackSrc = FALLBACK_IMAGE, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  // Detail pages can stay mounted while React Router changes the place slug.
  // Reset the image state so the new place is not left showing the old image.
  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
  };

  return <img {...props} src={currentSrc} alt={alt} onError={handleError} />;
}
