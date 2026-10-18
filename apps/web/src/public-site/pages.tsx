import type { PublicDictionary, PublicLocale, PublicPageSlug } from './content';
import {
  AssetCategoryGrid,
  CTASection,
  FAQSection,
  HeroSection,
  LegalPageLayout,
  RoadmapStatusSection,
  SocialProofOrTrustSection,
  StatusPill,
  WorkflowSection,
} from './sections';

type LocalizedPageProps = Readonly<{ locale: PublicLocale; dictionary: PublicDictionary }>;

function localizedPath(locale: PublicLocale, page: 'home' | PublicPageSlug) {
  return page === 'home' ? `/${locale}` : `/${locale}/${page}`;
}

function HomePage({ locale, dictionary }: LocalizedPageProps) {
  const { home } = dictionary;
  const statusItems = [
    {
      label: dictionary.shell.footer.statusLabel,
      title: home.status.title,
      description: home.status.currentBody,
      status: 'available' as const,
    },
    ...home.status.plannedItems.map((item) => ({
      label: home.categories.plannedLabel,
      title: item.title,
      description: item.body,
      status: 'planned' as const,
    })),
  ];

  return (
    <>
      <HeroSection
        eyebrow={home.hero.eyebrow}
        title={home.hero.title}
        description={home.hero.description}
        primaryLabel={home.hero.primaryCta}
        primaryHref={localizedPath(locale, 'features')}
        secondaryLabel={home.hero.secondaryCta}
        secondaryHref={`${localizedPath(locale, 'how-it-works')}#workflow`}
        image={home.hero.image}
        imageAlt={home.hero.imageAlt}
      />
      <SocialProofOrTrustSection
        heading={{ title: home.trust.title, description: home.trust.description }}
        principles={home.trust.principles.map(({ title, body }) => ({ title, description: body }))}
      />
      <AssetCategoryGrid
        heading={{ title: home.categories.title, description: home.categories.description }}
        categories={Object.values(home.categories.items).map((item) => ({
          title: item.title,
          description: item.description,
          status: item.statusLabel,
          image: item.image,
          imageAlt: item.alt,
        }))}
      />
      <WorkflowSection
        heading={{ title: home.workflow.title, description: home.workflow.description }}
        steps={home.workflow.steps.map(({ title, body }) => ({ title, description: body }))}
      />
      <RoadmapStatusSection
        heading={{ title: home.status.plannedTitle, description: home.status.plannedBody }}
        items={statusItems}
      />
      <FAQSection
        heading={{ title: home.faq.title, description: home.faq.description }}
        items={home.faq.items}
      />
      <CTASection
        eyebrow={home.status.label}
        title={home.cta.title}
        description={home.cta.body}
        primaryLabel={home.cta.primaryCta}
        primaryHref={localizedPath(locale, 'features')}
        secondaryLabel={home.cta.secondaryCta}
        secondaryHref={localizedPath(locale, 'faq')}
      />
    </>
  );
}

function FeaturesPage({ locale, dictionary }: LocalizedPageProps) {
  const page = dictionary.pages.features;
  const statusItems = page.sections.map((section) => ({
    label: page.plannedLabel,
    title: section.title,
    description: section.body,
    status: 'planned' as const,
  }));

  return (
    <>
      <section className="public-info-page">
        <p className="public-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <div className="public-current-status">
          <StatusPill status="available">{page.currentTitle}</StatusPill>
          <p>{page.currentBody}</p>
        </div>
      </section>
      <RoadmapStatusSection
        heading={{
          title: dictionary.home.status.plannedTitle,
          description: dictionary.home.status.plannedBody,
        }}
        items={statusItems}
      />
      <AssetCategoryGrid
        heading={{
          title: dictionary.home.categories.title,
          description: dictionary.home.categories.description,
        }}
        categories={Object.values(dictionary.home.categories.items).map((item) => ({
          title: item.title,
          description: item.description,
          status: item.statusLabel,
          image: item.image,
          imageAlt: item.alt,
        }))}
      />
      <CTASection
        eyebrow={page.eyebrow}
        title={dictionary.home.cta.title}
        description={dictionary.home.cta.body}
        primaryLabel={dictionary.home.cta.primaryCta}
        primaryHref={localizedPath(locale, 'how-it-works')}
        secondaryLabel={dictionary.home.cta.secondaryCta}
        secondaryHref={localizedPath(locale, 'faq')}
      />
    </>
  );
}

function HowItWorksPage({ locale, dictionary }: LocalizedPageProps) {
  const page = dictionary.pages.howItWorks;

  return (
    <>
      <section className="public-info-page">
        <p className="public-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <span className="public-status-pill public-status-pill--planned">{page.plannedLabel}</span>
      </section>
      <WorkflowSection
        heading={{
          title: dictionary.home.workflow.title,
          description: page.statusNote,
        }}
        steps={page.steps.map(({ title, body }) => ({ title, description: body }))}
      />
      <CTASection
        eyebrow={page.plannedLabel}
        title={dictionary.home.cta.title}
        description={page.statusNote}
        primaryLabel={dictionary.home.cta.primaryCta}
        primaryHref={localizedPath(locale, 'features')}
        secondaryLabel={dictionary.home.cta.secondaryCta}
        secondaryHref={localizedPath(locale, 'faq')}
      />
    </>
  );
}

function FAQPage({ dictionary }: Readonly<{ dictionary: PublicDictionary }>) {
  const page = dictionary.pages.faq;
  return (
    <>
      <section className="public-info-page">
        <p className="public-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </section>
      <FAQSection
        heading={{
          title: dictionary.home.faq.title,
          description: dictionary.home.faq.description,
        }}
        items={page.items}
      />
    </>
  );
}

function ContactPage({ dictionary }: Readonly<{ dictionary: PublicDictionary }>) {
  const page = dictionary.pages.contact;
  return (
    <section className="public-info-page public-contact-page">
      <p className="public-eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p>{page.intro}</p>
      <article className="public-contact-note">
        <span className="public-contact-mark" aria-hidden="true">
          ✳
        </span>
        <h2>{page.noteTitle}</h2>
        <p>{page.noteBody}</p>
      </article>
    </section>
  );
}

function LegalPage({
  dictionary,
  slug,
}: Readonly<{
  dictionary: PublicDictionary;
  slug: 'terms' | 'privacy' | 'cookies';
}>) {
  const page = dictionary.pages.legal[slug];
  return (
    <LegalPageLayout
      title={page.title}
      intro={page.intro}
      draftNotice={page.draftNotice}
      sections={page.sections.map(({ title, body }) => ({ heading: title, paragraphs: [body] }))}
    />
  );
}

export function PublicStaticPage({
  locale,
  dictionary,
  slug,
}: Readonly<{
  locale: PublicLocale;
  dictionary: PublicDictionary;
  slug: 'home' | PublicPageSlug;
}>) {
  if (slug === 'home') return <HomePage locale={locale} dictionary={dictionary} />;
  if (slug === 'features') return <FeaturesPage locale={locale} dictionary={dictionary} />;
  if (slug === 'how-it-works') return <HowItWorksPage locale={locale} dictionary={dictionary} />;
  if (slug === 'faq') return <FAQPage dictionary={dictionary} />;
  if (slug === 'contact') return <ContactPage dictionary={dictionary} />;
  if (slug === 'terms' || slug === 'privacy' || slug === 'cookies') {
    return <LegalPage dictionary={dictionary} slug={slug} />;
  }
  return null;
}
