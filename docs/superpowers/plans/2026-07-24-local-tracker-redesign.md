# Local Tracker Redesign Plan

## Goal

Replace authentication with a shared cloud tracker protected in the page by the `1024` operation lock. Keep company information public, sort active recruiting companies by launch date descending, and place not-yet-open companies last.

## Files

- `index.html`: local lock, shared Supabase state, company launch metadata, sorting, filters, and card interactions.
- `supabase_shared_tracker.sql`: the shared single-document table and its anonymous read/write policies.
- `scripts/update-companies.mjs`: append only new companies with launch status and launch-date metadata; never write user data.
- `user-data.json`: remains `{}` permanently.

## Implementation

1. Remove Supabase authentication, login controls, and per-user application persistence while retaining the publishable-key Supabase client for shared state.
2. Persist one shared tracker document in Supabase and protect page mutations and filters behind the `1024` lock. The lock prevents casual editing only; it is not a server-side authorization boundary.
3. Normalize each company at render time with `launchStatus` (`open` or `not_open`) and `launchDate` (ISO date or empty). Infer legacy values from public company text where possible, otherwise mark the record as `not_open`.
4. Render launch status/time, sort open records by newest launch date first, then list not-open records below them.
5. Replace category buttons with industry, launch-status, and application-status selects.
6. Extend the update script's newly appended company literal with `launchStatus` and `launchDate`; require the public user-data guard before changing the company list.

## Validation

- Assert no Supabase auth/login identifiers remain in the page.
- Assert shared-state access, the `1024` lock, all three selects, launch sorting, and official application links exist.
- Assert public `user-data.json` is `{}` and the updater rejects nonempty public user data.
- Publish to GitHub Pages and fetch the deployed page to verify the same invariants.
