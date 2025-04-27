// useMediaQuery is a custom React hook that returns true if the current viewport matches the given CSS media query string.
// Example usage: const isMdUp = useMediaQuery('(min-width: 768px)');
// This is useful for rendering components conditionally based on screen size (e.g., responsive modals, drawers, etc.)
import {useEffect, useState} from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
