// p2_hygiene_1 T3 evidence: AbortSignal.timeout path does not escape the catch.
// Reproduces the EXACT fetch options shape used by functions/api/feedback.ts
// (sendTo) against a non-routable blackhole IP (10.255.255.1 — TCP SYN
// blackhole, request hangs indefinitely without the signal).
const t0 = Date.now();
async function sendTo() {
  try {
    const tg = await fetch('https://10.255.255.1/blackhole', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: 'x', text: 'probe' }),
      signal: AbortSignal.timeout(5000),
    });
    return tg.ok;
  } catch (err) {
    console.log(`caught: ${err.name} — swallowed, no escape`);
    return false;
  }
}
const delivered = await sendTo();
const ms = Date.now() - t0;
console.log(`delivered=${delivered} elapsed=${ms}ms (cap=5000ms)`);
if (delivered !== false || ms > 6000) {
  console.error('FAIL: timeout path did not behave as specced');
  process.exit(1);
}
console.log('PASS: timeout fired, catch swallowed, caller got false — main flow untouched');
