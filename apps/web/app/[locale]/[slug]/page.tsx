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

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return publicPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isPublicLocale(localeParam) || !publicPageSlugs.includes(slug as PublicPageSlug)) notFound();
  const metadata = getPublicMetadata(localeParam, slug as PublicPageSlug);
  // Contact details and legal text are unfinished drafts. Never index them as final policies.
  if (slug === 'contact' || slug === 'terms' || slug === 'privacy' || slug === 'cookies') {
    return { ...metadata, robots: { index: false, follow: false } };
  }
  return metadata;
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
