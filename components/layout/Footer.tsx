import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getSiteConfig } from '@/lib/site';

export async function Footer() {
  const locale = await detectRequestLocale();
  const siteConfig = getSiteConfig(locale);
  const messages = getLocaleMessages(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>{siteConfig.description}</p>
        <p>{messages.footer.builtWith}</p>
      </div>
    </footer>
  );
}
