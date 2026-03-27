import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Current and upcoming work.',
};

export default function ProjectsPage() {
  return (
    <section className="page-grid">
      <header className="page-header">
        <p className="meta-note">Projects</p>
        <h1>Things in progress</h1>
        <p>A placeholder shelf for experiments, shipped tools, and works still taking shape.</p>
      </header>
      <div className="section">
        <p className="empty-state">
          No project entries are published yet. This page is ready for structured content in a later
          phase.
        </p>
      </div>
    </section>
  );
}

