# Environment Variables Registry

Last updated: 2026-04-15
Scope: `zclap-site`

This file is the single source of truth for environment variables used by this project.
Keep this updated whenever new env vars are introduced or old ones are retired.

## Required Now (Current Build)

| Variable | Required | Used In | Purpose |
|---|---|---|---|
| `SUPABASE_URL` | Yes | `api/_supabase.js` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `api/_supabase.js` | Server-side DB access for admin + submit APIs |

## Security / Validation

| Variable | Required | Used In | Purpose |
|---|---|---|---|
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | Recommended now, required for production CAPTCHA | `api/public-config.js`, `public/index.html` | Renders Turnstile widget on frontend |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Recommended now, required for production CAPTCHA | `api/_captcha.js`, `api/submit.js` | Server-side token verification |
| `TURNSTILE_SITE_KEY` | Optional alias | same as above | Backward-compatible alias for site key |
| `TURNSTILE_SECRET_KEY` | Optional alias | same as above | Backward-compatible alias for secret key |
| `CAPTCHA_ENFORCE_LOCALHOST` | Optional | `api/_captcha.js` | Set to `true` to force CAPTCHA on localhost; default bypasses localhost for smoother local dev |

## Admin Authentication

Use one of the options below:

| Variable | Required | Used In | Purpose |
|---|---|---|---|
| `ADMIN_USERS_JSON` | Optional (preferred for multi-user) | `api/admin/_auth.js` | JSON array of admin users (`[{email,password}]`) |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD` | Optional | `api/admin/_auth.js` | Single admin login credentials |
| `ADMIN_SESSION_SECRET` | Recommended | `api/admin/_auth.js` | HMAC signing key for admin session cookie |

Notes:
- If neither `ADMIN_USERS_JSON` nor `ADMIN_EMAIL`/`ADMIN_PASSWORD` is set, local dev fallback is used.
- In production, always set real admin credentials and session secret.

## Email Delivery (Planned)

These are not active yet in the current code path, but should be prepared for SES integration:

| Variable | Required | Planned Use |
|---|---|---|
| `AWS_REGION` | Yes (when SES starts) | AWS SDK SES region |
| `AWS_ACCESS_KEY_ID` | Yes (when SES starts) | SES API authentication |
| `AWS_SECRET_ACCESS_KEY` | Yes (when SES starts) | SES API authentication |
| `SES_FROM_EMAIL` | Yes (when SES starts) | Sender address for outbound estimate emails |
| `SES_FROM_NAME` | Optional | Display name for sender |

## Legacy Variables (Not in active submit flow)

These may still exist in older docs/config but are currently not used by active submission workflow:

- `POSTMARK_SERVER_TOKEN`
- `FROM_EMAIL`
- `FROM_NAME`
- `SALES_ALERT_EMAIL`

## Operational Notes

- Do not commit `.env.local`.
- Keep `.env.example` aligned with this file.
- When adding a new env var in code, update:
  1. `ENVIRONMENT_VARIABLES.md`
  2. `.env.example`
  3. `PROJECT_PLAN.md` remarks/change log if relevant
