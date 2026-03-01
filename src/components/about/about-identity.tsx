import type { IdentityCard } from "@/lib/content/author-profile";

const IDENTITY_EMOJIS: Record<string, string> = {
  工具: "🔧",
  效率: "⚡",
  旅行: "✈️",
  城市: "🏙️",
  前端: "💻",
  工程: "🛠️",
  开源: "🔓",
  网络: "🌐",
  生活: "🌍",
  AI: "🤖",
  写作: "✏️",
  教程: "📝",
  摄影: "📷",
  消费: "💰",
  健康: "❤️",
  部署: "🚀",
};

function getEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(IDENTITY_EMOJIS)) {
    if (name.includes(key)) return emoji;
  }
  return "📌";
}

interface AboutIdentityProps {
  identities: IdentityCard[];
}

export function AboutIdentity({ identities }: AboutIdentityProps) {
  if (identities.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        创作方向
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {identities.map((identity) => (
          <article
            key={identity.name}
            className="rounded-xl border border-zinc-200/70 bg-white p-4 transition-colors hover:border-zinc-300/80 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-zinc-700/80"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {getEmoji(identity.name)}
              </span>
              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                {identity.name}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {identity.description}
            </p>
            <p className="mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-500">
              观察依据：{identity.evidence}
            </p>
            {identity.link ? (
              <a
                href={identity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                查看 →
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
