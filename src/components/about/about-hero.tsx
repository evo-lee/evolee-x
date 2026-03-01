import { siteConfig } from "@/lib/site-config";
import type { ProfileMeta } from "@/lib/content/author-profile";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

interface AboutHeroProps {
  title: string;
  summary: string;
  intro?: string;
  meta: ProfileMeta;
}

export function AboutHero({ title, summary, intro, meta }: AboutHeroProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 p-6 md:p-8 dark:border-zinc-800/80 dark:from-zinc-900 dark:to-zinc-950">
      {/* AI provenance bar */}
      <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3.5 py-2.5 dark:border-zinc-800/60 dark:bg-zinc-800/30">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 font-medium text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path d="M8 1a.75.75 0 0 1 .692.462l1.476 3.56 3.567.453a.75.75 0 0 1 .424 1.296l-2.636 2.42.712 3.63a.75.75 0 0 1-1.106.803L8 11.79l-3.129 1.834a.75.75 0 0 1-1.106-.803l.712-3.63-2.636-2.42a.75.75 0 0 1 .424-1.296l3.567-.453L7.308 1.462A.75.75 0 0 1 8 1Z" />
            </svg>
            AI Generated
          </span>
          <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">|</span>
          <span>{meta.modelName} by {meta.provider}</span>
          <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">·</span>
          <span>{formatDate(meta.lastUpdated)}</span>
          <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">·</span>
          <span className="text-zinc-400 dark:text-zinc-500">
            来源 {meta.sources.join(" / ")}
          </span>
        </div>
      </div>

      {/* Title + social links */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-100">
          {title}
        </h1>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <SocialLink href={siteConfig.social.github} label="GitHub">
            <GitHubIcon />
          </SocialLink>
          <SocialLink href={siteConfig.social.twitter} label="X">
            <XIcon />
          </SocialLink>
          <SocialLink href={siteConfig.social.youtube} label="YouTube">
            <YouTubeIcon />
          </SocialLink>
        </div>
      </div>

      {/* Summary — editorial serif style */}
      <p className="mt-4 max-w-3xl text-lg leading-9 text-zinc-800 [font-family:var(--font-serif-cn)] md:text-xl md:leading-10 dark:text-zinc-200">
        {summary}
      </p>
      {intro ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          {intro}
        </p>
      ) : null}

      {/* 移动端社交链接 */}
      <div className="mt-5 flex items-center gap-2 md:hidden">
        <SocialLink href={siteConfig.social.github} label="GitHub">
          <GitHubIcon />
        </SocialLink>
        <SocialLink href={siteConfig.social.twitter} label="X">
          <XIcon />
        </SocialLink>
        <SocialLink href={siteConfig.social.youtube} label="YouTube">
          <YouTubeIcon />
        </SocialLink>
      </div>
    </section>
  );
}

// ─── Social link components ──────────────────────────────────

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/80 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
    >
      {children}
    </a>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
