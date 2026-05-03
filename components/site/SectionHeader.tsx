import Link from 'next/link';

export function SectionHeader({
  num,
  title,
  subtitle,
  linkLabel,
  linkHref,
}: {
  num: string;
  title: string;
  subtitle: string;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <div className="section-header">
      <div className="section-header__rail">
        <span className="section-header__sym">§</span>
        <span className="section-header__num">{num}</span>
        <div className="section-header__line" />
        {linkHref && linkLabel ? (
          <Link href={linkHref} className="section-header__link">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <h2 className="section-header__title">
        {title} <span className="section-header__sep">—</span> <em>{subtitle}</em>
      </h2>
    </div>
  );
}
