import Image from "next/image";
import type { ProofItem } from "@/lib/content/author-profile";
import { siteConfig } from "@/lib/site-config";

interface AboutProofsProps {
  posts: ProofItem[];
  tweets: ProofItem[];
  projects: ProofItem[];
  postCovers: Record<string, string>;
}

/** Extract slug from a luolei.org post URL */
function extractSlug(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== new URL(siteConfig.siteUrl).hostname) return null;
    // URL pattern: https://luolei.org/{slug}
    const slug = u.pathname.replace(/^\/|\/$/g, "");
    return slug || null;
  } catch {
    return null;
  }
}

function PostProofSection({
  title,
  items,
  postCovers,
}: {
  title: string;
  items: ProofItem[];
  postCovers: Record<string, string>;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const slug = extractSlug(item.url);
          const coverUrl = slug ? postCovers[slug] : undefined;

          return (
            <li
              key={`${title}-${item.url}-${item.title}`}
              className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/70"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                {/* Thumbnail */}
                {coverUrl ? (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:h-20 sm:w-32">
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 128px, 96px"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {/* Text content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {item.reason}
                  </p>
                  {item.date ? (
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {item.date}
                    </p>
                  ) : null}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ProofSection({
  title,
  items,
}: {
  title: string;
  items: ProofItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={`${title}-${item.url}-${item.title}`}
            className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/70"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:text-zinc-300"
            >
              {item.title}
            </a>
            <p className="mt-1 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              {item.reason}
            </p>
            {item.date ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {item.date}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutProofs({ posts, tweets, projects, postCovers }: AboutProofsProps) {
  if (posts.length === 0 && tweets.length === 0 && projects.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <PostProofSection title="代表文章" items={posts} postCovers={postCovers} />
      <ProofSection title="X 动态" items={tweets} />
      <ProofSection title="GitHub 项目" items={projects} />
    </div>
  );
}
