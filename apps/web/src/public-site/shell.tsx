'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { PublicDictionary, PublicLocale, PublicPageSlug } from './content';

type PublicRoute = 'home' | PublicPageSlug;

const publicLocales: readonly PublicLocale[] = ['en', 'pt-BR', 'es'];
const publicPageRoutes: ReadonlySet<PublicPageSlug> = new Set([
  'features',
  'how-it-works',
  'faq',
  'contact',
  'terms',
  'privacy',
  'cookies',
]);

function publicPath(locale: PublicLocale, page: PublicRoute): string {
  return page === 'home' ? `/${locale}` : `/${locale}/${page}`;
}

function pageFromPathname(
  pathname: string | null,
  locale: PublicLocale,
  fallback: PublicRoute,
): PublicRoute {
  if (!pathname) return fallback;

  const [pathLocale, pathPage, ...extraSegments] = pathname.split('/').filter(Boolean);
  if (pathLocale !== locale || extraSegments.length > 0) return fallback;
  if (pathPage === undefined) return 'home';

  return publicPageRoutes.has(pathPage as PublicPageSlug) ? (pathPage as PublicPageSlug) : fallback;
}

function LeafMark() {
  return (
    <svg
      aria-hidden="true"
      className="public-leaf-mark h-8 w-8 shrink-0 text-brand-primary"
      focusable="false"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M25.5 5.5C16.1 5.5 8 8.3 6.3 16.1c-.9 4.2 1.3 8.3 5.1 9.4 7.6 2.2 15.2-7.7 14.1-20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M8 25c4.1-5.4 8.2-9.1 13.9-12.1M14 19.5c-1.3-2.6-1.7-5.1-1.4-7.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

type PublicNavigationProps = {
  locale: PublicLocale;
  page: PublicRoute;
  labels: PublicDictionary['shell']['nav'];
  ariaLabel: string;
  className?: string;
};

function PublicNavigation({
  locale,
  page,
  labels,
  ariaLabel,
  className = '',
}: Readonly<PublicNavigationProps>) {
  const items: ReadonlyArray<{ page: PublicRoute; label: string }> = [
    { page: 'home', label: labels.home },
    { page: 'features', label: labels.features },
    { page: 'how-it-works', label: labels.howItWorks },
    { page: 'faq', label: labels.faq },
    { page: 'contact', label: labels.contact },
  ];

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="public-navigation-list flex flex-wrap items-center gap-1">
        {items.map((item) => (
          <li key={item.page}>
            <a
              aria-current={page === item.page ? 'page' : undefined}
              className="public-navigation-link inline-flex min-h-11 items-center rounded-control px-3 text-sm text-text-primary"
              href={publicPath(locale, item.page)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export type LocaleSwitcherProps = {
  locale: PublicLocale;
  page: PublicRoute;
  label: string;
  names: Record<PublicLocale, string>;
};

export function LocaleSwitcher({ locale, page, label, names }: Readonly<LocaleSwitcherProps>) {
  return (
    <nav aria-label={label} className="public-locale-switcher">
      <ul className="public-locale-list flex flex-wrap items-center gap-1">
        {publicLocales.map((targetLocale) => (
          <li key={targetLocale}>
            <a
              aria-current={locale === targetLocale ? 'page' : undefined}
              className="public-locale-link inline-flex min-h-11 items-center justify-center rounded-control border border-transparent px-2 text-sm text-text-primary"
              href={publicPath(targetLocale, page)}
              lang={targetLocale}
            >
              {names[targetLocale]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type Theme = 'dark' | 'light';

export type ThemeToggleProps = {
  labels: PublicDictionary['shell']['theme'];
};

export function ThemeToggle({ labels }: Readonly<ThemeToggleProps>) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const selected = getCurrentTheme();
    document.documentElement.dataset.theme = selected;
    setTheme(selected);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      window.localStorage.setItem('spryxel.theme', next);
    } catch {
      // Keep the theme change active for this page when persistence is blocked.
    }
  }

  const targetLabel = theme === 'dark' ? labels.switchToLight : labels.switchToDark;

  return (
    <button
      aria-label={targetLabel}
      className="public-theme-toggle inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary"
      onClick={toggleTheme}
      type="button"
    >
      {targetLabel}
    </button>
  );
}

function getCurrentTheme(): Theme {
  const documentTheme = document.documentElement.dataset.theme;
  if (isTheme(documentTheme)) return documentTheme;

  try {
    const savedTheme = window.localStorage.getItem('spryxel.theme');
    if (isTheme(savedTheme)) return savedTheme;
  } catch {
    // Continue with the system preference when storage is unavailable.
  }

  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function isTheme(value: string | undefined | null): value is Theme {
  return value === 'dark' || value === 'light';
}

export type PublicShellProps = {
  locale: PublicLocale;
  page: PublicRoute;
  dictionary: PublicDictionary;
};

export function PublicHeader({ locale, page, dictionary }: Readonly<PublicShellProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = pageFromPathname(pathname, locale, page);
  const { nav } = dictionary.shell;
  const navigationLabel = dictionary.shell.footer.navigationTitle;

  return (
    <header className="public-header border-b border-border bg-canvas text-text-primary">
      <div className="public-header__inner mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <a
          aria-label={nav.home}
          className="public-header__brand inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control text-text-primary"
          href={publicPath(locale, 'home')}
        >
          <LeafMark />
          <span className="text-lg font-semibold">Spryxel</span>
        </a>

        <PublicNavigation
          ariaLabel={navigationLabel}
          className="public-header__primary-nav hidden lg:flex"
          labels={nav}
          locale={locale}
          page={currentPage}
        />

        <details
          className="public-header__mobile-menu relative ml-auto lg:hidden"
          onToggle={(event) => setMobileMenuOpen(event.currentTarget.open)}
        >
          <summary className="public-header__menu-toggle inline-flex min-h-11 cursor-pointer list-none items-center rounded-control border border-border bg-surface px-3 text-sm font-medium text-text-primary">
            {mobileMenuOpen ? nav.closeMenu : nav.menu}
          </summary>
          <div className="public-header__mobile-panel absolute right-0 top-full z-10 mt-2 min-w-56 rounded-panel border border-border bg-surface p-2">
            <PublicNavigation
              ariaLabel={navigationLabel}
              className="public-header__mobile-nav"
              labels={nav}
              locale={locale}
              page={currentPage}
            />
          </div>
        </details>

        <div className="public-header__actions ml-auto flex w-full flex-wrap items-center justify-between gap-2 lg:w-auto lg:justify-end">
          <LocaleSwitcher
            label={dictionary.shell.locale.label}
            locale={locale}
            names={dictionary.shell.locale.names}
            page={currentPage}
          />
          <ThemeToggle labels={dictionary.shell.theme} />
          <a
            className="public-sign-in inline-flex min-h-11 items-center justify-center rounded-control bg-brand-primary px-4 py-2 text-sm font-semibold text-background"
            href="/sign-in"
          >
            {nav.signIn}
          </a>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ locale, page, dictionary }: Readonly<PublicShellProps>) {
  const pathname = usePathname();
  const currentPage = pageFromPathname(pathname, locale, page);
  const { footer, nav } = dictionary.shell;

  return (
    <footer className="public-footer border-t border-border bg-canvas text-text-primary">
      <div className="public-footer__inner mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="public-footer__brand sm:col-span-2 lg:col-span-1">
          <a
            aria-label={nav.home}
            className="inline-flex min-h-11 items-center gap-2 rounded-control text-text-primary"
            href={publicPath(locale, 'home')}
          >
            <LeafMark />
            <span className="text-lg font-semibold">Spryxel</span>
          </a>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">{footer.tagline}</p>
        </div>

        <nav aria-label={footer.navigationTitle} className="public-footer__nav">
          <h2 className="mb-3 text-sm font-semibold">{footer.navigationTitle}</h2>
          <ul className="space-y-1">
            {[
              { page: 'home' as const, label: nav.home },
              { page: 'features' as const, label: nav.features },
              { page: 'how-it-works' as const, label: nav.howItWorks },
              { page: 'faq' as const, label: nav.faq },
              { page: 'contact' as const, label: nav.contact },
            ].map((item) => (
              <li key={item.page}>
                <a
                  aria-current={currentPage === item.page ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center rounded-control text-sm text-text-secondary"
                  href={publicPath(locale, item.page)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footer.legalTitle} className="public-footer__legal">
          <h2 className="mb-3 text-sm font-semibold">{footer.legalTitle}</h2>
          <ul className="space-y-1">
            {[
              { page: 'terms' as const, label: dictionary.pages.legal.terms.title },
              { page: 'privacy' as const, label: dictionary.pages.legal.privacy.title },
              { page: 'cookies' as const, label: dictionary.pages.legal.cookies.title },
            ].map((item) => (
              <li key={item.page}>
                <a
                  aria-current={currentPage === item.page ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center rounded-control text-sm text-text-secondary"
                  href={publicPath(locale, item.page)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="public-footer__contact">
          <h2 className="mb-3 text-sm font-semibold">{footer.contactTitle}</h2>
          <p className="text-sm leading-6 text-text-secondary">{footer.contactNote}</p>
        </section>

        <section className="public-footer__status">
          <h2 className="mb-3 text-sm font-semibold">{footer.statusLabel}</h2>
          <p className="text-sm leading-6 text-text-secondary">{footer.statusBody}</p>
        </section>

        <div className="public-footer__bottom border-t border-border pt-5 sm:col-span-2 lg:col-span-5">
          <p className="public-footer__copyright text-sm text-text-secondary">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
