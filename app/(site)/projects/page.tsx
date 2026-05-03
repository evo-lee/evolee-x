import type { Metadata } from 'next';
import { CoverPlaceholder, pickCoverColor } from '@/components/site/CoverPlaceholder';
import { StructuredData } from '@/components/seo/StructuredData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

const TITLE = '作品集';
const DESCRIPTION = '正在构建中，敬请期待。';

const PORTFOLIO_PLACEHOLDERS = [
  { id: 'evonote', title: 'EvoNote', status: '构建中', summary: '一个为公开学习设计的笔记产品' },
  { id: 'weather', title: '极简天气', status: '构建中', summary: '一个有意做减法的 Web App' },
  { id: 'reads', title: '读书笔记站', status: '构建中', summary: '面向自己的阅读卡片库' },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/projects', title: TITLE, description: DESCRIPTION });
}

export default function ProjectsPage() {
  return (
    <main className="container page-shell">
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: TITLE,
          description: DESCRIPTION,
          path: '/projects',
        })}
      />
      <header className="page-header">
        <h1 className="page-header__title">{TITLE}</h1>
        <p className="page-header__sub">{DESCRIPTION}</p>
      </header>

      <div className="works-grid">
        {PORTFOLIO_PLACEHOLDERS.map((work) => (
          <div key={work.id} className="work-card">
            <div className="work-card__cover work-card__cover--lg" style={{ background: pickCoverColor(work.id) }}>
              <CoverPlaceholder color={pickCoverColor(work.id)} label="project" />
            </div>
            <div className="work-card__body">
              <p className="work-card__title">{work.title}</p>
              <p className="work-card__status">{work.status}</p>
              <p className="post-card__excerpt" style={{ marginTop: 8 }}>
                {work.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
