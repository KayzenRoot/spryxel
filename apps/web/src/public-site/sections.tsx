import type { ReactNode } from 'react';
import Image from 'next/image';

export type SectionHeading = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export type TextItem = {
  title: string;
  description: string;
};

export type CategoryItem = TextItem & {
  image: string;
  imageAlt: string;
  status?: string;
};

export type StatusItem = TextItem & {
  label: string;
  status: 'available' | 'planned' | 'future';
};

export function SectionTitle({ eyebrow, title, description }: Readonly<SectionHeading>) {
  return (
    <div className="public-section-heading">
      {eyebrow ? <p className="public-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p className="public-section-description">{description}</p> : null}
    </div>
  );
}

export function Badge({ children }: Readonly<{ children: ReactNode }>) {
  return <span className="public-badge">{children}</span>;
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4 12 12 4M5 4h7v7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8 3v10m-4-4 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatusPill({
  children,
  status = 'planned',
}: Readonly<{
  children: ReactNode;
  status?: string;
}>) {
  return <span className={`public-status-pill public-status-pill--${status}`}>{children}</span>;
}

export function FeatureCard({ title, description, icon }: Readonly<TextItem & { icon?: string }>) {
  return (
    <article className="public-feature-card">
      {icon ? (
        <span className="public-feature-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function CategoryCard({ title, description, image, imageAlt, status }: Readonly<CategoryItem>) {
  return (
    <article className="public-category-card">
      <div className="public-category-art">
        <Image
          src={image}
          alt={imageAlt}
          width={1254}
          height={1254}
          sizes="(max-width: 700px) 100vw, 33vw"
          loading="lazy"
        />
        {status ? <StatusPill>{status}</StatusPill> : null}
      </div>
      <div className="public-category-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function MockScreenshotFrame({
  image,
  alt,
  label,
}: Readonly<{
  image: string;
  alt: string;
  label?: string;
}>) {
  return (
    <figure className="public-showcase-frame">
      <div className="public-showcase-chrome" aria-hidden="true">
        <span />
        <span />
        <span />
        {label ? <span className="public-showcase-label">{label}</span> : null}
      </div>
      <Image
        src={image}
        alt={alt}
        width={1200}
        height={800}
        sizes="(max-width: 700px) 100vw, 55vw"
        loading="lazy"
      />
    </figure>
  );
}

export function ShowcasePanel({
  heading,
  image,
  imageAlt,
  children,
}: Readonly<{
  heading: SectionHeading;
  image: string;
  imageAlt: string;
  children?: ReactNode;
}>) {
  return (
    <section className="public-showcase-panel">
      <div>
        <SectionTitle {...heading} />
        {children}
      </div>
      <MockScreenshotFrame image={image} alt={imageAlt} />
    </section>
  );
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  primaryHref,
  secondaryHref,
  image,
  imageAlt,
  badge,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
  image: string;
  imageAlt: string;
  badge?: string;
}>) {
  return (
    <section className="public-hero">
      <div className="public-hero-copy">
        {badge ? <Badge>{badge}</Badge> : null}
        <p className="public-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="public-hero-description">{description}</p>
        <div className="public-hero-actions">
          <a className="public-button public-button--primary" href={primaryHref}>
            {primaryLabel}
            <ArrowUpRightIcon />
          </a>
          <a className="public-button public-button--quiet" href={secondaryHref}>
            {secondaryLabel}
            <ArrowDownIcon />
          </a>
        </div>
      </div>
      <div className="public-hero-visual">
        <div className="public-hero-orbit public-hero-orbit--one" aria-hidden="true" />
        <div className="public-hero-orbit public-hero-orbit--two" aria-hidden="true" />
        <div className="public-hero-art-frame">
          <Image
            src={image}
            alt={imageAlt}
            width={1672}
            height={940}
            sizes="(max-width: 700px) 100vw, 50vw"
            fetchPriority="high"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}

export function SocialProofOrTrustSection({
  heading,
  principles,
}: Readonly<{
  heading: SectionHeading;
  principles: TextItem[];
}>) {
  return (
    <section className="public-trust-section">
      <SectionTitle {...heading} />
      <div className="public-trust-grid">
        {principles.map((item, index) => (
          <article key={item.title} className="public-trust-item">
            <span className="public-trust-index">0{index + 1}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AssetCategoryGrid({
  heading,
  categories,
}: Readonly<{
  heading: SectionHeading;
  categories: CategoryItem[];
}>) {
  return (
    <section className="public-section public-categories" id="categories">
      <SectionTitle {...heading} />
      <div className="public-category-grid">
        {categories.map((category) => (
          <CategoryCard key={category.title} {...category} />
        ))}
      </div>
    </section>
  );
}

export function WorkflowSection({
  heading,
  steps,
}: Readonly<{
  heading: SectionHeading;
  steps: TextItem[];
}>) {
  return (
    <section className="public-section public-workflow" id="workflow">
      <SectionTitle {...heading} />
      <ol className="public-workflow-list">
        {steps.map((step, index) => (
          <li key={step.title} className="public-workflow-step">
            <span className="public-step-number">0{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            {index < steps.length - 1 ? (
              <span className="public-step-connector" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RoadmapStatusSection({
  heading,
  items,
}: Readonly<{
  heading: SectionHeading;
  items: StatusItem[];
}>) {
  return (
    <section className="public-section public-status-section">
      <SectionTitle {...heading} />
      <div className="public-status-grid">
        {items.map((item) => (
          <article className="public-status-card" key={item.title}>
            <StatusPill status={item.status}>{item.label}</StatusPill>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FAQSection({
  heading,
  items,
}: Readonly<{
  heading: SectionHeading;
  items: { question: string; answer: string }[];
}>) {
  return (
    <section className="public-section public-faq-section" id="faq-list">
      <SectionTitle {...heading} />
      <div className="public-faq-list">
        {items.map((item) => (
          <details className="public-faq-item" key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CTASection({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}>) {
  return (
    <section className="public-cta-section">
      <div className="public-cta-glow" aria-hidden="true" />
      <div className="public-cta-copy">
        <p className="public-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="public-cta-actions">
        <a className="public-button public-button--primary" href={primaryHref}>
          {primaryLabel}
          <ArrowUpRightIcon />
        </a>
        <a className="public-button public-button--quiet" href={secondaryHref}>
          {secondaryLabel}
        </a>
      </div>
    </section>
  );
}

export function LegalPageLayout({
  title,
  intro,
  sections,
  draftNotice,
}: Readonly<{
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  draftNotice: string;
}>) {
  return (
    <article className="public-legal-layout">
      <div className="public-legal-heading">
        <Badge>{draftNotice}</Badge>
        <h1>{title}</h1>
        <p className="public-legal-intro">{intro}</p>
      </div>
      <div className="public-legal-sections">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
