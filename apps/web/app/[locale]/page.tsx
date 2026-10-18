import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicContent, getPublicMetadata, isPublicLocale } from '../../src/public-site/content';
import { PublicStaticPage } from '../../src/public-site/pages';

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isPublicLocale(localeParam)) notFound();
  return getPublicMetadata(localeParam, 'home');
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isPublicLocale(localeParam)) notFound();
  return (
    <main id="public-main" tabIndex={-1}>
      <PublicStaticPage
        locale={localeParam}
        dictionary={getPublicContent(localeParam)}
        slug="home"
      />
    </main>
  );
}
