import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-hub';
import PageShell from '@/components/PageShell';
import SetLang from '@/components/SetLang';
import { faqPageFromHtml, jsonLd, openGraphFor } from '@/lib/schema';

/**
 * /pt/ — PT 导航枢纽（落站单 P0-3b · 05-copy-freeze-v1.19 addendum）。
 * 定位纪律（附录 §F-2）：导航枢纽 —— 无 dropzone、无工具 UI、无 states 板。
 * §D：schema 只有 FAQPage，且由本页冻结 FAQ 标记程序化生成（faqPageFromHtml），
 * 与可见 FAQ 逐字同源（同一 mainHtml，结构性保证）。
 * §E-3：hreflang = pt-BR 自身 + en / x-default → EN 首页（/）。
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/',
    languages: { en: '/', 'pt-BR': '/pt/', 'x-default': '/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/', locale: 'pt_BR' }),
};

export default function PtHubPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <PageShell
        route="/pt/"
        lang="pt"
        mainHtml={mainHtml}
        schemaJson={jsonLd(faqPageFromHtml(mainHtml))}
      />
    </>
  );
}
