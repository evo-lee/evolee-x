import AboutPage, { generateMetadata as generateBaseMetadata } from '@/app/(site)/about/page';
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

export async function generateMetadata({ params }: PageProps) {
  return generateBaseMetadata({ searchParams: localeSearchParams(params) });
}

export default function LocaleAboutPage({ params }: PageProps) {
  return <AboutPage searchParams={localeSearchParams(params)} />;
}
