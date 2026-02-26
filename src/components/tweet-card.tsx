import tweetsCache from "@/../data/tweets-cache.json";

interface TweetData {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
  };
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
  media?: Array<{
    type: string;
    url: string;
    preview_image_url: string;
  }>;
}

interface TweetCardProps {
  tweetId: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}千`;
  return num.toString();
}

export function TweetCard({ tweetId }: TweetCardProps) {
  const tweet = (tweetsCache.tweets as unknown as Record<string, TweetData | undefined>)[tweetId];

  if (!tweet) {
    return (
      <div className="my-8 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          推文数据未找到 (ID: {tweetId})
        </p>
      </div>
    );
  }

  const { author, text, created_at, public_metrics, media } = tweet;
  const image = media?.[0]?.preview_image_url || media?.[0]?.url;

  return (
    <div className="my-8 px-2">
      <div className="relative m-auto flex h-full w-full max-w-[32rem] flex-col gap-3 overflow-hidden rounded-xl border border-gray-200 p-4 shadow-lg backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-800/50">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <a
              href={`https://x.com/${author.username}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
            >
              <img
                src={author.profile_image_url}
                alt={author.name}
                width={48}
                height={48}
                className="rounded-full border border-gray-200 dark:border-zinc-600"
              />
            </a>
            <div>
              <a
                href={`https://x.com/${author.username}`}
                target="_blank"
                rel="noreferrer"
                className="block font-semibold text-gray-900 hover:underline dark:text-slate-200"
              >
                {author.name}
              </a>
              <div className="text-sm text-gray-500">@{author.username}</div>
            </div>
          </div>
          <a
            href={`https://x.com/${author.username}/status/${tweetId}`}
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

        {/* Image */}
        {image && (
          <a
            href={`https://x.com/${author.username}/status/${tweetId}`}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-xl"
          >
            <img
              src={image}
              alt="Tweet media"
              className="h-auto w-full border-0 transition-transform hover:scale-[1.02]"
              loading="lazy"
            />
          </a>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-zinc-700 dark:text-slate-400"
        >
          <span>{formatTimeAgo(created_at)}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1" title="回复">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {formatNumber(public_metrics.reply_count)}
            </span>
            <span className="flex items-center gap-1" title="点赞">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {formatNumber(public_metrics.like_count)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
