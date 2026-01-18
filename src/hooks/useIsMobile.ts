import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint = 768) => {
  // Initialize with the actual state if window is available
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add listener
    window.addEventListener('resize', checkIsMobile);

    // Check immediately again in case of hydration mismatches (optional but safe)
    checkIsMobile();

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);


  return isMobile;
};
