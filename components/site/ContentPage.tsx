import type { ReactNode } from 'react';
import { StructuredData } from '@/components/seo/StructuredData';
import { PageHeader } from '@/components/site/PageHeader';

export function ContentPage({
  structuredData,
  eyebrow,
  title,
  description,
  children,
}: {
  structuredData: object;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="page-grid">
      <StructuredData data={structuredData} />
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="content-page__body">{children}</div>
    </section>
  );
}
