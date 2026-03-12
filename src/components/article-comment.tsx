"use client";

import { useEffect, useRef, useState } from "react";
import { useArtalkComments } from "@/hooks/use-artalk-comments";
import { useIntersectionVisibility } from "@/hooks/use-intersection-visibility";

interface ArticleCommentProps {
  slug: string;
  title: string;
}

export function ArticleComment({ slug, title }: ArticleCommentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useIntersectionVisibility(containerRef, {
    rootMargin: "200px",
  });
  const [shouldLoad, setShouldLoad] = useState(false);

  // Load comments when visible
  useEffect(() => {
    if (!isVisible || shouldLoad) return;

    // Small delay to prioritize critical content
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible, shouldLoad]);

  useArtalkComments({
    containerRef,
    enabled: shouldLoad,
    slug,
    title,
  });

  return (
    <div id="Comments" ref={containerRef} className="mt-6">
      {!shouldLoad && (
        <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
          <span>评论加载中...</span>
        </div>
      )}
    </div>
  );
}
