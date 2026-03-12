"use client";

import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export interface AuthorAvatarProps {
  size?: number;
  badgeTone?: "accent" | "neutral";
  badgeVariant?: "label" | "dot" | "none";
  compactBadge?: boolean;
}

export function AuthorAvatar({
  size = 28,
  badgeTone = "accent",
  badgeVariant = "label",
  compactBadge = false,
}: AuthorAvatarProps) {
  const isCompact = size <= 32;
  const badgeClassName = badgeVariant === "dot"
    ? badgeTone === "neutral"
      ? "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-zinc-900 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:bg-zinc-100 dark:shadow-[0_0_0_2px_rgba(24,24,27,0.95)]"
      : "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:shadow-[0_0_0_2px_rgba(24,24,27,0.95)]"
    : compactBadge
      ? badgeTone === "neutral"
        ? "absolute -right-0.5 -top-0.5 flex h-3 min-w-4 items-center justify-center rounded-full bg-zinc-900/92 px-1 text-[6px] font-semibold leading-none text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-900"
        : "absolute -right-0.5 -top-0.5 flex h-3 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[6px] font-semibold leading-none text-white shadow-sm"
      : badgeTone === "neutral"
        ? isCompact
          ? "absolute -right-0.5 -top-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-zinc-900/92 px-0.5 text-[6px] font-semibold leading-none text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-900"
          : "absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900/92 px-1 text-[7px] font-semibold leading-none text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-900"
      : "absolute -right-1 -top-1 flex h-3.5 items-center rounded-full bg-violet-500 px-1 text-[8px] font-bold leading-none text-white";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/images/avatar.jpg"
        alt={siteConfig.author.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
      {badgeVariant === "none" ? null : (
        <span className={badgeClassName}>
          {badgeVariant === "label" ? "AI" : null}
        </span>
      )}
    </div>
  );
}
