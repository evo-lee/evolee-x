import { TrackedLink } from '@/components/analytics/TrackedLink';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export async function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="section related-posts">
      <div className="section-intro">
        <p className="section-intro__eyebrow">{messages.article.relatedEyebrow}</p>
        <h2>{messages.article.relatedTitle}</h2>
      </div>
      <ul className="related-posts__list">
        {posts.map((post) => (
          <li key={post.slug} className="related-posts__item">
            <p className="related-posts__meta">{formatDate(post.date, locale)}</p>
            <h3>
              <TrackedLink
                href={post.url}
                eventName="read_related_post"
                eventParams={{ slug: post.slug }}
              >
                {post.title}
              </TrackedLink>
            </h3>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
