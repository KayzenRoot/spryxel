import { notFound } from 'next/navigation';
import { PublicFooter, PublicHeader } from '../../src/public-site/shell';
import { getPublicContent, isPublicLocale, locales } from '../../src/public-site/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PublicLocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  if (!isPublicLocale(localeParam)) notFound();

  const dictionary = getPublicContent(localeParam);

  return (
    <div className="public-site" lang={localeParam}>
      <a className="skip-link public-skip-link" href="#public-main">
        {dictionary.shell.nav.skipToContent}
      </a>
      <PublicHeader locale={localeParam} page="home" dictionary={dictionary} />
      {children}
      <PublicFooter locale={localeParam} page="home" dictionary={dictionary} />
    </div>
  );
}
