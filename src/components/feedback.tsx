'use client';

/**
 * Feedback system (06c-A): FAB + modal (4 states) + inline form (footer/result).
 * Frozen copy from src/lib/copy.ts (05 §12 / §0.7). Structure mirrors
 * design-source/build/components.py feedback_fab/feedback_modal/feedback_block.
 *
 * Endpoint: POST /api/feedback — PLACEHOLDER, wired by 08 (open-items #3/#13:
 * Worker+D1+Telegram bot preferred). Until then submissions hit 404 and the
 * frozen error state (with mailto fallback address) is shown.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FB_COPY, INLINE_FEEDBACK } from '@/lib/copy';

type Lang = 'en' | 'pt';
type ModalState = 'default' | 'submitting' | 'success' | 'error';

const OPEN_EVENT = 'cp:feedback:open';
export const TOOL_BUSY_EVENT = 'cp:tool-busy';

export function openFeedbackDialog() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

async function postFeedback(payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Global delegation: any a[href="#feedback-modal"] (static footer CTA, fab) opens the dialog. */
function useFeedbackDelegation() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href="#feedback-modal"]');
      if (a) {
        e.preventDefault();
        openFeedbackDialog();
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export function FeedbackFab({ lang = 'en' }: { lang?: Lang }) {
  const c = FB_COPY[lang];
  const [quiet, setQuiet] = useState(false);
  useEffect(() => {
    const onBusy = (e: Event) => setQuiet(Boolean((e as CustomEvent).detail));
    window.addEventListener(TOOL_BUSY_EVENT, onBusy);
    return () => window.removeEventListener(TOOL_BUSY_EVENT, onBusy);
  }, []);
  return (
    <a className={`fab-feedback${quiet ? ' is-quiet' : ''}`} href="#feedback-modal" aria-label={c.fab_aria}>
      <span className="dot"></span>
      <span className="fab-label">{c.fab.toUpperCase()}</span>
    </a>
  );
}

export function FeedbackModal({ lang = 'en' }: { lang?: Lang }) {
  const c = FB_COPY[lang];
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ModalState>('default');
  const [typeIdx, setTypeIdx] = useState<number | null>(null); // default: none selected
  const textRef = useRef<HTMLTextAreaElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setState('default');
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = useCallback(async () => {
    if (state === 'submitting') return;
    setState('submitting');
    const ok = await postFeedback({
      kind: 'modal',
      type: typeIdx === null ? null : c.types[typeIdx],
      message: textRef.current?.value ?? '',
      contact: contactRef.current?.value ?? '',
      page: window.location.pathname,
      lang: document.documentElement.lang || lang,
      ts: new Date().toISOString(),
    });
    setState(ok ? 'success' : 'error');
  }, [state, typeIdx, c.types, lang]);

  return (
    <div
      className={`fb-modal${open ? ' is-open' : ''}`}
      id="feedback-modal"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="fb-modal__card" data-page-context={typeof window === 'undefined' ? '/' : window.location.pathname}>
        <button type="button" className="fb-modal__close" aria-label={c.close_aria} onClick={() => setOpen(false)}>
          ✕
        </button>
        {state === 'success' ? (
          <>
            <h3>{c.title}</h3>
            <div className="fb-success">
              <div className="big">✅</div>
              <p style={{ fontWeight: 600 }}>{c.success}</p>
            </div>
          </>
        ) : (
          <>
            <h3>{c.title}</h3>
            <p className="sub">{c.sub}</p>
            <div className="fb-types" role="group" aria-label="Feedback type">
              {c.types.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={typeIdx === i}
                  onClick={() => setTypeIdx(typeIdx === i ? null : i)}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea ref={textRef} placeholder={c.placeholder} aria-label="Feedback"></textarea>
            <input ref={contactRef} type="text" placeholder={c.contact} aria-label="Contact (optional)" />
            <div className="fb-trust" dangerouslySetInnerHTML={{ __html: c.trust }} />
            {state === 'error' && <div className="fb-error-note">{c.error}</div>}
            <div className="actions">
              {state === 'error' ? (
                <button className="btn btn--primary" type="button" onClick={submit}>
                  {c.retry}
                </button>
              ) : (
                <button className="btn btn--primary" type="button" disabled={state === 'submitting'} style={state === 'submitting' ? { opacity: 0.6 } : undefined} onClick={submit}>
                  {state === 'submitting' ? `${c.submit}…` : c.submit}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Inline feedback form (Amend A001) — footer + tool result state.
 * Rendered as a client island; markup mirrors components.py feedback_block().
 * In tool result state this component is NOT used — ToolController renders the
 * same markup into the swapped DOM and calls attachInlineFeedback() below.
 */
export function FeedbackInline({ context, lang = 'en' }: { context: 'footer' | 'result'; lang?: Lang }) {
  const [rating, setRating] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const f = INLINE_FEEDBACK;
  const submitLabel = f.submit[lang];

  if (sent) {
    return (
      <div className="feedback">
        <span className="ok">{f.success[lang]}</span>
      </div>
    );
  }

  const submit = async () => {
    if (sending) return;
    setSending(true);
    const ok = await postFeedback({
      kind: 'inline',
      context,
      rating: rating === null ? null : f.ratings[rating].label,
      message: textRef.current?.value ?? '',
      page: window.location.pathname,
      lang: document.documentElement.lang || lang,
      ts: new Date().toISOString(),
    });
    // Inline form has no frozen error state; on endpoint failure fall back to
    // the feedback dialog (frozen error + mailto copy lives there).
    if (ok) setSent(true);
    else openFeedbackDialog();
    setSending(false);
  };

  return (
    <div className="feedback" {...(context === 'footer' ? { style: { padding: 16 } } : {})} data-context={context}>
      <h3>{f.heading}</h3>
      <div className="emojis" role="group" aria-label="Rate this result">
        {f.ratings.map((r, i) => (
          <button key={r.label} className="emoji" type="button" aria-pressed={rating === i} onClick={() => setRating(rating === i ? null : i)}>
            {r.emoji} <span>{r.label}</span>
          </button>
        ))}
      </div>
      <textarea ref={textRef} placeholder={f.textareaPlaceholder} aria-label="Optional feedback"></textarea>
      <button className="btn btn--sm" type="button" disabled={sending} onClick={submit}>
        {submitLabel}
      </button>
    </div>
  );
}

/** Mounts FAB + modal + link delegation. Placed once in the root layout. */
export default function FeedbackRoot({ lang = 'en' }: { lang?: Lang }) {
  useFeedbackDelegation();
  return (
    <>
      <FeedbackFab lang={lang} />
      <FeedbackModal lang={lang} />
    </>
  );
}
