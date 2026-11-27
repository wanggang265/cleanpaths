# T3 side-task: zhongshu probe garbage cleanup (D1 feedback table)

- DB: cleanpaths Pages production binding `DB` = a7cf5548-7bfc-4ca4-a0c2-a7768ebfd921
- Garbage record found: id=3, created_at=2026-11-27T13:50:34.344Z (~21:50 CST,
  matches ticket "11-27 evening"), kind=modal, type=feedback (default),
  rating='', message='', contact='', page='unknown' (default), lang='',
  ip=43.153.121.133 — empty-JSON POST probe, exactly per ticket description
- Delete: `DELETE FROM feedback WHERE id=3 AND message='' AND page='unknown'`
  (double-guard: could only hit the garbage row) → success, changes=1
- Remaining rows verified: id=1 (real user praise zh-CN 10-14), id=2 (real
  inline feedback en 11-23) — both intact
- Query channel: D1 REST API (Pages token lacks D1 perm code-10000 — known
  token-scope pattern; main token used for D1 query only, no writes elsewhere)
