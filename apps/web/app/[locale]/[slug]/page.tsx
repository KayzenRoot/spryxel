import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPublicContent,
  getPublicMetadata,
  isPublicLocale,
  publicPageSlugs,
} from '../../../src/public-site/content';
import type { PublicPageSlug } from '../../../src/public-site/content';
import { PublicStaticPage } from '../../../src/public-site/pages';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return publicPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isPublicLocale(localeParam) || !publicPageSlugs.includes(slug as PublicPageSlug)) notFound();
  return getPublicMetadata(localeParam, slug as PublicPageSlug);
}

export default async function LocalizedPublicPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  if (!isPublicLocale(localeParam) || !publicPageSlugs.includes(slug as PublicPageSlug)) notFound();
  return (
    <main id="public-main" tabIndex={-1}>
      <PublicStaticPage
        locale={localeParam}
        dictionary={getPublicContent(localeParam)}
        slug={slug as PublicPageSlug}
      />
    </main>
  );
}
