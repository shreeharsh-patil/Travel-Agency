import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      setIsVisible(currentScroll > 250);

      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScroll / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <button
            onClick={scrollToTop}
            className="group relative w-12 h-12 rounded-full bg-[#121216]/90 backdrop-blur-xl border border-white/15 hover:border-brand-gold/50 flex items-center justify-center text-white/80 hover:text-brand-gold shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            title={`Scroll to top (${Math.round(scrollProgress)}%)`}
            aria-label="Scroll to top of page"
          >
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-white/10"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-brand-gold transition-all duration-150"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>

            {/* Up Arrow Icon */}
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
