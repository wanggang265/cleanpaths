import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata = { title: 'Page not found | CleanPaths' };

/** Route Contract: anything outside the 15 frozen routes lands here. */
export default function NotFound() {
  return (
    <>
      <SiteHeader activeRoute="/404" />
      <main>
        <section className="section">
          <div className="wrap" style={{ textAlign: 'center', padding: '80px 0' }}>
            <span className="spec">404</span>
            <h1 style={{ marginTop: 12 }}>This page doesn&apos;t exist.</h1>
            <p style={{ margin: '14px auto 24px', maxWidth: '32em', color: 'var(--ink-2)' }}>
              The link may be old or mistyped. The converters are one click away.
            </p>
            <Link className="btn btn--primary" href="/">
              Back to the converter →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
