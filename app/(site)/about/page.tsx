import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RichContent } from '@/components/site/RichContent';
import { getRuntimePageBySlug } from '@/lib/content/runtime';

export const metadata: Metadata = {
  title: 'About',
  description: 'About the author and the blog.',
};

export default async function AboutPage() {
  const page = getRuntimePageBySlug('about');

  if (!page) {
    notFound();
  }

  return (
    <section className="page-grid">
      <header className="page-header">
        <p className="meta-note">About</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </header>
      <RichContent html={page.html} headings={page.headings} />
    </section>
  );
}
