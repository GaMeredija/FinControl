import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useFocusRouteTitle() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [pathname]);

  return ref;
}
