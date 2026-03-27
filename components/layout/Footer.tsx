import { siteConfig } from '@/lib/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>{siteConfig.description}</p>
        <p>Built with Next.js and Cloudflare Workers.</p>
      </div>
    </footer>
  );
}
