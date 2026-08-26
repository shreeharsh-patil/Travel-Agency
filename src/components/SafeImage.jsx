import React, { useEffect, useState } from 'react';

// Third-party image hosts can be unavailable on mobile networks, behind a
// content blocker, or removed by their owner. Keep the layout intact and use
// an app-owned editorial image instead of leaving a broken-image icon.
const FALLBACK_IMAGE = '/images/tropical_beach.png';

export default function SafeImage({
  src,
  alt = '',
  fallbackSrc = FALLBACK_IMAGE,
  priority = false,
  loading,
  decoding = 'async',
  className = '',
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const computedLoading = loading || (priority ? 'eager' : 'lazy');

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={computedLoading}
      decoding={decoding}
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-85'} ${className}`}
    />
  );
}
