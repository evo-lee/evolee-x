import HomePage from '@/app/(site)/page';
import { APP_LOCALES, isAppLocale } from '@/lib/i18n/config';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

async function localeSearchParams(params: PageProps['params']) {
  const { locale } = await params;
  return { __locale: isAppLocale(locale) ? locale : 'zh-CN' };
}

export default function LocaleHomePage({ params }: PageProps) {
  return <HomePage searchParams={localeSearchParams(params)} />;
}
