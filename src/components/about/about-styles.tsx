import type { StyleItem } from "@/lib/content/author-profile";

interface AboutStylesProps {
  styles: StyleItem[];
}

export function AboutStyles({ styles }: AboutStylesProps) {
  if (styles.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        读者会注意到的习惯
      </h2>
      <ul className="mt-4 space-y-3">
        {styles.map((style) => (
          <li
            key={style.trait}
            className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/70"
          >
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {style.trait}
            </h3>
            <p className="mt-1 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {style.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
