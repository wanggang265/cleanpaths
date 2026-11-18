import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/png-to-dxf';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/png-to-dxf/' },
  openGraph: openGraphFor({ title, description, url: '/png-to-dxf/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .PNG. Nothing was uploaded, so nothing was stored.`;

// Stage-1 ticket T4: one inbound link to /png-to-dxf-for-laser-cutting/, hung on the
// existing word "laser" (no sentence-structure change, frozen copy untouched).
// Injected here because src/content/pages/*.ts is gate-regenerated (extract-pages.mjs).
const mainWithLaserLink = mainHtml.replace(
  '"Your plotter, laser or CNC',
  '"Your plotter, <a href="/png-to-dxf-for-laser-cutting/">laser</a> or CNC'
);

export default function PngToDxfPage() {
  return (
    <ToolPage
      route="/png-to-dxf/"
      name="PNG to DXF Converter — Cut-Ready Output"
      description={description}
      mainHtml={mainWithLaserLink}
      kind="trace-raster"
      accept={['.png']}
      errorMessage={ERROR_MESSAGE}
      paramPanel
    />
  );
}
