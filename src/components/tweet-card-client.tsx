"use client";

import { useEffect, useState } from "react";
import { TweetCard } from "./tweet-card";
import tweetsCache from "@/../data/tweets-cache.json";

interface TweetCardClientProps {
  tweetId: string;
}

export function TweetCardClient({ tweetId }: TweetCardClientProps) {
  // 直接同步渲染，数据已在构建时获取
  return <TweetCard tweetId={tweetId} />;
}

// 客户端 hydration 后替换占位符
export function TweetCardHydrator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR 阶段不渲染，避免 hydration mismatch
  if (!mounted) return null;

  return null;
}
