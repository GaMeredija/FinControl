import { useEffect } from 'react';

const base = 'FinControl';

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · ${base}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
