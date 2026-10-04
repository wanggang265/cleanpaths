/**
 * PageShell — shared chrome for all 15 routes.
 * Renders frozen mainHtml verbatim (dangerouslySetInnerHTML, design truth)
 * plus header / footer / feedback FAB+modal. JSON-LD injected per page.
 */
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { FeedbackFab, FeedbackModal } from './feedback';

export default function PageShell({
  route,
  lang = 'en',
  mainHtml,
  schemaJson,
}: {
  route: string;
  lang?: 'en' | 'pt';
  mainHtml: string;
  schemaJson?: string;
}) {
  return (
    <>
      <SiteHeader activeRoute={route} lang={lang} />
      {/* eslint-disable-next-line react/no-danger */}
      <main dangerouslySetInnerHTML={{ __html: mainHtml }} />
      <SiteFooter lang={lang} />
      <FeedbackFab lang={lang} />
      <FeedbackModal lang={lang} />
      {schemaJson ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} /> : null}
    </>
  );
}
