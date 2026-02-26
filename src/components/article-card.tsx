"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconCalendar,
  IconEye,
  IconFire,
  IconLoading,
} from "@/components/icons";
import type { PostItem } from "@/lib/content/types";
import { getPreviewImage } from "@/lib/content/utils";
import { hotArticleViews } from "@/lib/site-config";

interface ArticleCardProps {
  post: PostItem;
  hits?: number;
  hitsLoading?: boolean;
  priority?: boolean;
}

export function ArticleCard({
  post,
  hits = 0,
  hitsLoading = false,
  priority = false,
}: ArticleCardProps) {
  const imageUrl = getPreviewImage(post.cover);
  const isVideo = post.categories.includes("zuoluotv");
  const isHot = hits > hotArticleViews;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      return;
    }

    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [imageUrl]);

  return (
    <article className="group flex h-full flex-col">
      <div className="overflow-hidden flex-1 h-full rounded-t bg-white shadow-lg duration-300 ease-in-out group-hover:shadow-2xl dark:bg-zinc-800">
        <div className="flex min-h-60 flex-wrap no-underline hover:no-underline md:min-h-40 lg:min-h-40">
          <Link
            href={post.url}
            className="block overflow-hidden relative h-60 w-full bg-zinc-100 dark:bg-neutral-900 md:h-40 lg:h-40"
          >
            {imageUrl && (
              <>
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt={post.title}
                  loading={priority ? "eager" : "lazy"}
                  decoding={priority ? "sync" : "async"}
                  className="hidden h-0 w-0"
                  onLoad={() => setIsLoaded(true)}
                  onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                  }}
                />
                <span
                  style={{ backgroundImage: `url(${imageUrl})` }}
                  className={`absolute top-0 left-0 h-full w-full bg-cover bg-center duration-300 ease-in hover:scale-105 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            )}

            {isVideo && (
              <img
                src="/icons/youtube.svg"
                alt="YouTube"
                className="absolute bottom-2 left-6 h-7 w-7 md:h-5 md:w-5 z-10"
              />
            )}
          </Link>

          <div className="mt-5 w-full px-6">
            <Link
              href={post.url}
              className="line-clamp-2 h-auto break-normal text-base antialiased font-medium text-gray-800 dark:!text-slate-300 sm:text-lg md:h-12 md:text-base"
            >
              {post.title}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden mt-auto h-12 flex-none rounded-b rounded-t-none bg-white px-6 py-3 shadow-lg dark:bg-zinc-800">
        <div className="flex items-center justify-between">
          <p className="flex items-center font-mono text-sm text-slate-500 dark:text-slate-400">
            <IconCalendar className="mr-1 h-3 w-3" />
            {post.formatShowDate}
          </p>
          <div className="flex items-center text-sm text-gray-400 dark:text-slate-400">
            {hitsLoading ? (
              <IconLoading className="mr-1 h-3 w-3 animate-spin text-gray-200 dark:text-gray-600" />
            ) : isHot ? (
              <IconFire className="mr-1 h-3 w-3 text-red-400 dark:text-red-500" />
            ) : (
              <IconEye className="mr-1 h-3 w-3 text-gray-400 dark:text-slate-400" />
            )}
            <span className={isHot ? "text-red-400 dark:text-red-500" : ""}>
              {hits.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
