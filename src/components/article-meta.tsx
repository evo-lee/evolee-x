"use client";

import type { PostDetail } from "@/lib/content/types";
import { getBannerImage } from "@/lib/content/utils";
import { usePageHits } from "@/hooks/use-article-hits";
import { IconCalendar, IconEye, IconLoading, IconClock } from "@/components/icons";

interface ArticleMetaProps {
  post: PostDetail;
}

export function ArticleMeta({ post }: ArticleMetaProps) {
  const banner = getBannerImage(post.cover);
  const { loading, hits } = usePageHits(post.slug);

  return (
    <section className="overflow-hidden rounded-md">
      <div
        className="h-64 bg-zinc-200 bg-cover bg-center dark:bg-zinc-800"
        style={banner ? { backgroundImage: `url(${banner})` } : undefined}
      >
        <div className="flex h-full items-center bg-black/30 px-5 md:px-10">
          <div>
            <h1 className="line-clamp-3 max-w-xl break-normal text-xl font-bold leading-10 text-white md:line-clamp-2 md:text-2xl">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-200 md:text-sm">
              <span className="inline-flex items-center gap-1">
                <IconCalendar className="h-3.5 w-3.5" />
                {post.date}
              </span>
              <span className="text-neutral-400/60 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1">
                <IconEye className="h-3.5 w-3.5" />
                {loading ? (
                  <IconLoading className="h-2.5 w-2.5 animate-spin text-neutral-300" />
                ) : (
                  <>{hits.toLocaleString()} 浏览</>
                )}
              </span>
              <span className="text-neutral-400/60 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
