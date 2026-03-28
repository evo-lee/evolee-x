import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SearchModal } from '@/components/search/SearchModal';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';

export async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">{children}</main>
      <SearchModal
        closeAriaLabel={messages.search.closeAriaLabel}
        dialogLabel={messages.search.dialogLabel}
        emptyHint={messages.search.emptyHint}
        eyebrow={messages.search.eyebrow}
        failed={messages.search.failed}
        locale={locale}
        placeholder={messages.search.placeholder}
        resultsAriaLabel={messages.search.resultsAriaLabel}
        searching={messages.search.searching}
        unavailable={messages.search.unavailable}
      />
      <Footer />
    </div>
  );
}
