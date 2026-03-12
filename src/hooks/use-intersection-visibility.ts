"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

interface UseIntersectionVisibilityOptions {
  once?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionVisibility<T extends Element>(
  ref: RefObject<T | null>,
  {
    once = true,
    root = null,
    rootMargin = "0px",
    threshold = 0,
  }: UseIntersectionVisibilityOptions = {},
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (once && isVisible)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, once, ref, root, rootMargin, threshold]);

  return isVisible;
}
