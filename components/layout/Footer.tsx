import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getSiteConfig } from '@/lib/site';

export async function Footer({ locale }: { locale: AppLocale }) {
  const siteConfig = getSiteConfig(locale);
  const messages = getLocaleMessages(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}>
<p className="footer-desc">{siteConfig.description}</p>
        <p>{messages.footer.builtWith}</p>
      </div>
    </footer>
  );
}
