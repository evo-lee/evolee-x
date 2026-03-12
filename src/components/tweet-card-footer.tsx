import { formatTweetDateTime, formatNumber } from "@/lib/tweet-utils";

interface TweetCardFooterProps {
  createdAt: string;
  likeCount: number;
  replyCount: number;
}

export function TweetCardFooter({
  createdAt,
  likeCount,
  replyCount,
}: TweetCardFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-zinc-700 dark:text-slate-400">
      <span>{formatTweetDateTime(createdAt)}</span>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1" title="回复">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {formatNumber(replyCount)}
        </span>
        <span className="flex items-center gap-1" title="点赞">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {formatNumber(likeCount)}
        </span>
      </div>
    </div>
  );
}
