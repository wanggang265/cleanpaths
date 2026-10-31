/**
 * ToolPage — server-side composition for the 7 tool routes:
 * PageShell (frozen mainHtml + chrome) + ToolController (client state machine)
 * + SoftwareApplication/FAQPage JSON-LD.
 */
import PageShell from './PageShell';
import ToolController, { type ToolKind } from './tool/ToolController';
import { faqPageFromHtml, jsonLd, SITE_URL, softwareApplication } from '@/lib/schema';

export default function ToolPage({
  route,
  lang = 'en',
  name,
  description,
  mainHtml,
  kind,
  accept,
  errorMessage,
  paramPanel,
}: {
  route: string; // '/png-to-dxf/'
  lang?: 'en' | 'pt';
  name: string; // frozen H1 (schema name)
  description: string;
  mainHtml: string;
  kind: ToolKind;
  accept: string[];
  errorMessage: string;
  paramPanel?: boolean; // 05 v1.12 #82 — /png-to-dxf/ only
}) {
  const schema = jsonLd(
    softwareApplication({ name, url: `${SITE_URL}${route}`, description }),
    faqPageFromHtml(mainHtml),
  );
  return (
    <>
      <PageShell route={route} lang={lang} mainHtml={mainHtml} schemaJson={schema} />
      <ToolController kind={kind} lang={lang} accept={accept} errorMessage={errorMessage} paramPanel={paramPanel} />
    </>
  );
}
