import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getSiteConfig } from '@/lib/site';

export async function Footer() {
  const locale = await detectRequestLocale();
  const siteConfig = getSiteConfig(locale);
  const messages = getLocaleMessages(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}>
        <p className="garden-ornament">❀ ✿ ❀</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic' }}>{siteConfig.description}</p>
        <p>{messages.footer.builtWith}</p>
      </div>
    </footer>
  );
}
