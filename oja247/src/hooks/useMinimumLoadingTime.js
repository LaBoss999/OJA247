import { useEffect, useRef, useState } from "react";

/**
 * Keeps a loading state true for at least `minimumMs`, even if the
 * underlying fetch finishes sooner — prevents the loader from flashing
 * on screen for a few frames and looking broken.
 *
 * Usage:
 *   const [loading, setLoading] = useState(true);
 *   const showLoader = useMinimumLoadingTime(loading, 1000);
 *   if (showLoader) return <Loader text="Loading..." />;
 */
export default function useMinimumLoadingTime(isLoading, minimumMs = 2000) {
  const [showLoader, setShowLoader] = useState(isLoading);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowLoader(true);
      return;
    }

    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    const remaining = minimumMs - elapsed;

    if (remaining <= 0) {
      setShowLoader(false);
    } else {
      const timeout = setTimeout(() => setShowLoader(false), remaining);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, minimumMs]);

  return showLoader;
}