/**
 * config.ts — single source for tunable product parameters (open-items #45).
 *
 * Pure client-side architecture: values are compile-time constants, no
 * server dependency. Changing a value here + rebuild = site-wide effect.
 *
 * NOTE: FREE_DAILY_CAP feeds quota LOGIC ONLY. The cap-state copy ("10/10",
 * "That's your 10 for today…") is frozen literal text (05 §11.2 / CAP_COPY)
 * and must NOT be interpolated from this value — copy changes go through
 * the 05 freeze process, not this file.
 */

/** Free tier daily conversion cap (04 pricing: 10/day). Value unchanged — #45 is about tunability, not a new number. */
export const FREE_DAILY_CAP = 10;
