import Link from 'next/link';
import { Logo } from './SiteHeader';
import { FeedbackInline } from './feedback';

const TOOLS_MENU: Array<[string, string]> = [
  ['/png-to-dxf/', 'PNG to DXF'],
  ['/jpg-to-dxf/', 'JPG to DXF'],
  ['/svg-to-dxf-converter/', 'SVG to DXF'],
  ['/screenshot-to-svg/', 'Screenshot to SVG'],
  ['/jfif-to-jpg/', 'JFIF to JPG'],
];

/**
 * Footer social icon SLOTS — REMOVED from render (08 SEO P2-⑦ / QA #26):
 * placeholder href="#" data-pending links are dead weight until real account
 * URLs exist (open-items #12). Re-add with real URLs when accounts are live.
 */

export default function SiteFooter({ lang = 'en' }: { lang?: 'en' | 'pt' }) {
  if (lang === 'pt') {
    return (
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-trust" style={{ borderTop: 0 }}>
            <span>🔒 Seus arquivos nunca saem do seu dispositivo · Sem cadastro · Sem cookies de rastreamento</span>
            <span className="links">
              <Link href="/privacy/">Política de Privacidade</Link>
              <span>·</span>
              <Link href="/jfif-to-jpg/">English version</Link>
              <span>·</span>
              <a href="mailto:support@cleanpaths.io">Suporte: support@cleanpaths.io</a>
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-feedback" id="footer-feedback">
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div>
              <span className="spec">Feedback — no account needed</span>
              <p style={{ margin: '10px 0 14px', color: 'var(--ink-2)', fontSize: 15, maxWidth: '38em' }}>
                Something off with a conversion? Tell the person building CleanPaths — it goes straight to the workshop
                bench, not a ticket queue.
              </p>
              <p style={{ margin: '0 0 4px' }}>
                <a className="btn btn--sm" href="#feedback-modal">
                  Open the feedback dialog →
                </a>
              </p>
            </div>
            <FeedbackInline context="footer" />
          </div>
        </div>
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ marginTop: 12, color: 'var(--ink-2)', fontSize: 14, maxWidth: '26em' }}>
              Cut-ready DXF &amp; SVG from the images clients actually send — processed entirely in your browser.
            </p>
            <p style={{ marginTop: 10 }}>
              <Link href="/samples/">See before / after samples →</Link>
            </p>
          </div>
          <div>
            <h4>Converters</h4>
            <ul>
              {TOOLS_MENU.map(([r, n]) => (
                <li key={r}>
                  <Link href={r}>{n}</Link>
                </li>
              ))}
              <li>
                <Link href="/samples/">Samples gallery</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>For makers</h4>
            <ul>
              <li>
                <Link href="/for/cricut-sellers/">For Cricut sellers</Link>
              </li>
              <li>
                <Link href="/for/embroidery/">For embroidery</Link>
              </li>
              <li>
                <Link href="/pricing/">Pricing</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy/">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms/">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund/">Refund Policy</Link>
              </li>
              <li>
                <Link href="/cookies/">Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-trust">
          <span>Files never leave your device · No account · No tracking cookies</span>
          <span className="links">
            <Link href="/privacy/">Privacy</Link>
            <span>·</span>
            <Link href="/terms/">Terms</Link>
            <span>·</span>
            <Link href="/refund/">Refund</Link>
            <span>·</span>
            <Link href="/cookies/">Cookies</Link>
            <span>·</span>
            <Link href="/pricing/">Pricing</Link>
            <span>·</span>
            <Link href="/samples/">Samples</Link>
            <span>·</span>
            <a href="#feedback-modal">Feedback</a>
            <span>·</span>
            <a href="mailto:support@cleanpaths.io">Support: support@cleanpaths.io</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
