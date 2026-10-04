import Link from 'next/link';

export const LOGO_SVG = (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="28" height="28" rx="6" fill="#1E2430" />
    <path d="M7 21 C7 12, 13 9, 17 9 S 24 12, 23 17" stroke="#E4572E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="7" cy="21" r="2.6" fill="#FAF6EE" />
    <circle cx="17" cy="9" r="2.6" fill="#FAF6EE" />
    <circle cx="23" cy="17" r="2.6" fill="#E4572E" />
  </svg>
);

export function Logo() {
  return (
    <Link className="logo" href="/">
      {LOGO_SVG}
      <span className="word">
        Clean<em>Paths</em>
      </span>
    </Link>
  );
}

const TOOLS_MENU: Array<[string, string, string]> = [
  ['/png-to-dxf/', 'PNG to DXF', 'PNG→DXF'],
  ['/jpg-to-dxf/', 'JPG to DXF', 'JPG→DXF'],
  ['/svg-to-dxf-converter/', 'SVG to DXF', 'SVG→DXF'],
  ['/screenshot-to-svg/', 'Screenshot to SVG', 'SHOT→SVG'],
  ['/jfif-to-jpg/', 'JFIF to JPG', 'JFIF→JPG'],
];

/** Routes that have an on-page #convert dropzone anchor. */
const TOOL_ROUTES = new Set([
  '/',
  '/png-to-dxf/',
  '/jpg-to-dxf/',
  '/svg-to-dxf-converter/',
  '/screenshot-to-svg/',
  '/jfif-to-jpg/',
  '/pt/jfif-para-jpg/',
]);

function nl(route: string, activeRoute: string, label: string) {
  return (
    <Link key={route} className={`navlink navlink--desktop${activeRoute === route ? ' active' : ''}`} href={route}>
      {label}
    </Link>
  );
}

export default function SiteHeader({ activeRoute = '/', lang = 'en' }: { activeRoute?: string; lang?: 'en' | 'pt' }) {
  if (lang === 'pt') {
    // PT page is a neutral tool page: minimal nav, language switch visible
    return (
      <header className="site-header">
        <div className="wrap bar">
          <Logo />
          <nav className="main-nav" aria-label="Main">
            <Link className="navlink" href="/jfif-to-jpg/">
              English version →
            </Link>
          </nav>
          <details className="nav-mobile">
            <summary aria-label="Menu">☰</summary>
            <div className="menu">
              <Link href="/jfif-to-jpg/">English version →</Link>
              <Link href="/privacy/">Política de Privacidade</Link>
            </div>
          </details>
        </div>
      </header>
    );
  }

  // Header CTA anchors to the on-page dropzone on tool pages; elsewhere it
  // must go to the homepage tool (design emitted bare #convert everywhere —
  // dead anchor on non-tool pages; fixed here).
  const convertHref = TOOL_ROUTES.has(activeRoute) ? '#convert' : '/#convert';

  const desktopLinks = TOOLS_MENU.slice(0, 3).map(([r, n]) => nl(r, activeRoute, n));
  const moreLinks = TOOLS_MENU.slice(3).map(([r, n, f]) => (
    <Link key={r} href={r}>
      {n}
      <span className="fmt">{f}</span>
    </Link>
  ));
  const mobileLinks = (
    <>
      {TOOLS_MENU.map(([r, n]) => (
        <Link key={r} href={r}>
          {n}
        </Link>
      ))}
      <Link href="/samples/">Samples</Link>
      <Link href="/for/cricut-sellers/">For Cricut sellers</Link>
      <Link href="/for/embroidery/">For embroidery</Link>
      <Link href="/pricing/">Pricing</Link>
    </>
  );

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Logo />
        <nav className="main-nav" aria-label="Main">
          {desktopLinks}
          <details className="nav-more">
            <summary>More tools</summary>
            <div className="menu">{moreLinks}</div>
          </details>
          {nl('/samples/', activeRoute, 'Samples')}
          {nl('/for/cricut-sellers/', activeRoute, 'For Cricut sellers')}
          {nl('/for/embroidery/', activeRoute, 'For embroidery')}
          {nl('/pricing/', activeRoute, 'Pricing')}
          <a className="btn btn--primary btn--sm nav-cta nav-cta-header" href={convertHref}>
            Convert now — free
          </a>
        </nav>
        <details className="nav-mobile">
          <summary aria-label="Menu">☰</summary>
          <div className="menu">{mobileLinks}</div>
        </details>
      </div>
    </header>
  );
}
