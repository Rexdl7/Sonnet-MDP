import { useState, useEffect } from 'react';

export function useYouTubeSearch(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/suggestions?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // ignore network aborts
        }
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, isLoading };
}
