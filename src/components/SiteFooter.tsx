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

/** Footer social icon SLOTS ONLY — real account URLs are open-items (#12), no invented handles. PT page must NOT carry these (neutral tool page). */
function SocialSlots() {
  const x = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20z" />
    </svg>
  );
  const yt = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.4c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.9 15.1V8.4l6.2 3.4-6.2 3.3z" />
    </svg>
  );
  const pin = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2-1.3 2.7.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
  return (
    <span className="social-slots" aria-label="Social links">
      <a href="#" data-pending="account-url" aria-label="X" onClick={undefined}>
        {x}
      </a>
      <a href="#" data-pending="account-url" aria-label="YouTube">
        {yt}
      </a>
      <a href="#" data-pending="account-url" aria-label="Pinterest">
        {pin}
      </a>
    </span>
  );
}

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
          </span>
          <SocialSlots />
        </div>
      </div>
    </footer>
  );
}
