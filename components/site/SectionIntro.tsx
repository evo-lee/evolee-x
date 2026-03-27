import type { ReactNode } from 'react';

export function SectionIntro({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: ReactNode;
}) {
  return (
    <div className="section-intro">
      <p className="section-intro__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}
