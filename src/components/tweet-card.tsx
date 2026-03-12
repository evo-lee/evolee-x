import Image from "next/image";
import { TweetCardFooter } from "@/components/tweet-card-footer";
import { TweetMediaGrid } from "@/components/tweet-card-media-grid";
import { getTweetCardById } from "@/lib/content/tweet-card-cache";
import { getPreviewImage } from "@/lib/content/utils";
import { siteConfig } from "@/lib/site-config";

interface TweetCardProps {
  tweetId: string;
}

export function TweetCard({ tweetId }: TweetCardProps) {
  const tweet = getTweetCardById(tweetId);

  if (!tweet?.text || !tweet.created_at) {
    return (
      <div className="my-8 px-2">
        <a
          href={`https://x.com/${siteConfig.author.twitterUsername}/status/${tweetId}`}
          target="_blank"
          rel="noreferrer"
          className="m-auto flex max-w-[32rem] items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        >
          <span className="text-lg">𝕏</span>
          <span>该推文不可用，点击在 X 上查看</span>
        </a>
      </div>
    );
  }

  const { author, text, created_at, public_metrics, media } = tweet;
  const authorName = author?.name?.trim() || siteConfig.author.name;
  const authorUsername =
    author?.username?.trim() || siteConfig.author.twitterUsername;
  const images = media
    ?.filter((m) => m.type === "photo")
    .map((m) => m.preview_image_url || m.url)
    .map((url) => getPreviewImage(url))
    .filter(Boolean) ?? [];
  const authorAvatar = getPreviewImage(author?.profile_image_url);
  const tweetUrl = `https://x.com/${authorUsername}/status/${tweetId}`;

  return (
    <div className="my-8 px-2">
      <div className="relative m-auto flex h-full w-full max-w-[32rem] flex-col gap-3 overflow-hidden rounded-xl border border-gray-200 p-4 shadow-lg backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-800/50">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <a
              href={`https://x.com/${authorUsername}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="rounded-full border border-gray-200 dark:border-zinc-600"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100">
                  {authorName.slice(0, 1)}
                </div>
              )}
            </a>
            <div>
              <a
                href={`https://x.com/${authorUsername}`}
                target="_blank"
                rel="noreferrer"
                className="block font-semibold text-gray-900 hover:underline dark:text-slate-200"
              >
                {authorName}
              </a>
              <div className="text-sm text-gray-500">@{authorUsername}</div>
            </div>
          </div>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-2xl text-gray-900 transition-opacity hover:opacity-70 dark:text-slate-200"
            aria-label="View on X"
          >
            𝕏
          </a>
        </div>

        {/* Content */}
        <div className="whitespace-pre-wrap break-words text-base leading-relaxed tracking-wide text-gray-800 dark:text-slate-200">
          {text}
        </div>

        {/* Media */}
        {images.length > 0 && (
          <TweetMediaGrid
            images={images}
            tweetUrl={tweetUrl}
          />
        )}

        <TweetCardFooter
          createdAt={created_at}
          likeCount={Number(public_metrics?.like_count ?? 0)}
          replyCount={Number(public_metrics?.reply_count ?? 0)}
        />
      </div>
    </div>
  );
}
