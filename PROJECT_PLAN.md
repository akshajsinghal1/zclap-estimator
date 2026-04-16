# ZCLAP Estimator Delivery Plan

Last updated: 2026-04-15
Owner: Akshaj + AI implementation support

## Status Legend
- DONE: Completed and verified locally
- IN PROGRESS: Partially complete / under active development
- TODO: Not started
- BLOCKED: Waiting for credentials or external dependency

## Workstream Tracker

| Area | Item | Status | Remarks |
|---|---|---|---|
| Platform | Local Vercel dev setup | DONE | Running at `http://localhost:3000` |
| Public UX | Landing page at `/` | DONE | Added `public/landing.html` and routing |
| Public UX | Estimator route `/estimate` | DONE | Existing estimator moved behind explicit route |
| Public UX | Dual estimator selection (implementation/modernization) | DONE | Added chooser and dynamic step flow |
| Public UX | Modernization extra questions | DONE | Added `parallelWeeks` and `legacyHandling` |
| Public UX | Hide estimate values on UI | DONE | Confirmation-only result screen implemented |
| Validation | Email blocklist source wired | DONE | Shared utility parses `email-domain-blocklist (1).txt` |
| Validation | Early email validation in gate | DONE | Inline validation + API validation endpoint |
| Validation | Backend email validation enforcement | DONE | `api/submit.js` blocks invalid/blocked emails |
| Admin | Admin login/session scaffold | DONE | `/admin/login`, cookie session, logout |
| Admin | Pending/Done queue UI | DONE | Supabase-backed request listing |
| Admin | Approve action | DONE | `pending -> done` + `approved_by/approved_at` |
| Admin | Email status badges | DONE | Queued / Not Sent / Sent states in admin |
| Data | Supabase schema + integration | DONE | `supabase/schema.sql` + API client |
| Ops | Environment variable registry | DONE | Added `ENVIRONMENT_VARIABLES.md` and root `.env.example` |
| Delivery | Submit creates pending request | DONE | No direct email send at submit |
| Email | AWS SES send on approval | BLOCKED | Waiting for SES credentials/config |
| Security | CAPTCHA (Cloudflare Turnstile) | DONE | Enforced on real domains; localhost bypass default for dev |
| Formula | Spreadsheet parity (SaaS + Migration) | DONE | Default and edge-case behavior suites passed; workbook-aligned outputs in place |
| Formula | +20% / +30% bound rule | DONE | Implemented on sheet-equivalent base value in frontend calc |
| Public UX | Carousel/tab layout for estimator section | DONE | Added 3-step tabbed flow indicator (`Project Type`, `Scope Questions`, `Submission`) |
| Content | Assets page with 14 videos | DONE | `/assets` page with topic library + player controls scaffold created |

## Continuous Remarks
- Admin-first approach is complete enough to collect and review requests safely before outbound email is live.
- SES integration will be plugged into approval workflow once credentials are available.
- CAPTCHA plumbing is now wired end-to-end with graceful dev fallback when secret key is missing.
- Env var requirements are now centrally documented and will be updated at each checkpoint.
- Edge-case behavior suite executed for 5 non-default scenarios; bounds and modernization branching behaved as expected.

## Change Log
- 2026-04-15: Admin scaffold, Supabase integration, pending/done workflow, approve action completed.
- 2026-04-15: Landing page + `/estimate` route separation completed.
- 2026-04-15: Dual estimator flow and modernization-specific questions completed.
- 2026-04-15: UI result hiding + early email validation + blocklist enforcement completed.
- 2026-04-15: Cloudflare Turnstile integration added (public config endpoint, frontend widget, backend submit verification).
- 2026-04-15: Added environment variable registry (`ENVIRONMENT_VARIABLES.md`) and root `.env.example`.
- 2026-04-15: Implemented formula split by estimator type and switched bounds to +20%/+30%.
- 2026-04-15: Calibrated formula base values so default workbook scenarios now match expected cost and timeline.
- 2026-04-15: Added Assets page (`/assets`) with 14-topic list and video player controls.
- 2026-04-15: Added tabbed 3-step estimator flow indicator as section-2 UI enhancement.
