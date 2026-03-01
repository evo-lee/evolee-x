import type { StrengthGroup } from "@/lib/content/author-profile";

interface AboutStrengthsProps {
  strengths: StrengthGroup[];
}

export function AboutStrengths({ strengths }: AboutStrengthsProps) {
  if (strengths.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        做事方法
      </h2>
      <div className="mt-4 space-y-4">
        {strengths.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {group.title}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {group.points.map((point) => (
                <li key={`${group.title}-${point}`}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
