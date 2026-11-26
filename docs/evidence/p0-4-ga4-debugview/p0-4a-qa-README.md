# P0-4a local QA evidence (qa-p0-4a.cjs)

- Environment: qa-server :8899 (static `out/`), Chromium headless, GA network blocked (hermetic).
- Event capture: push-time dataLayer shim (`window.__reportGa`) — nav-immune; params = gtag event params verbatim.
- Results: `p0-4a-qa-results.json`; checkout request bodies: `p0-4a-checkout-contract.json`.
- Production network/DebugView evidence: `p0-4a-prod-*.log` (collected post-deploy, real GA4 G-9T8XY5EB0Y stream).
