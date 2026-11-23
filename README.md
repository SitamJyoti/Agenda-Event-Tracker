# Event Tracker

A responsive, calendar-based event tracker: dashboard, monthly/weekly/daily calendar, event CRUD, search and filters, and in-app reminders.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, FullCalendar 6, Supabase (optional), Netlify.

## Storage modes

| Mode | When | Where events live |
| --- | --- | --- |
| Supabase | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set | Postgres, per-user accounts, protected by Row Level Security |
| Local-only | Either variable is missing | This browser's `localStorage`, no accounts |

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | For cloud mode | Project URL from Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | For cloud mode | The public **anon** key. Never use the service-role key. |

Copy `.env.example` to `.env` for local development. `.env` is git-ignored.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test
npm run build      # typecheck + production build into dist/
```

## Database setup (Supabase mode)

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/001_events.sql`. It creates the `events` table, check constraints (length limits, time order, allowed categories/statuses), and Row Level Security policies so each user can only read and change their own rows.
3. Under Authentication → Providers, keep Email enabled. Decide whether to require email confirmation.
4. Under Authentication → URL Configuration, set the Site URL to your Netlify URL.
5. Add the two environment variables above.

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify: Add new site → Import an existing project → pick the repository.
3. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`, Node 22, SPA redirect, security headers).
4. Site configuration → Environment variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (skip both to run in local-only mode).
5. Deploy. Redeploy after changing environment variables, since they are baked in at build time.

## Security controls

- Authorization is enforced by Postgres RLS (`user_id = auth.uid()` on select/insert/update/delete); the client never sends `user_id`, and anonymous access is revoked.
- Input is trimmed and stripped of control characters, validated in the UI, and re-validated by database check constraints.
- All data access uses the Supabase query builder (parameterized), so there is no string-built SQL.
- React escapes all rendered text; there is no `dangerouslySetInnerHTML`.
- `netlify.toml` sets a restrictive Content Security Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, a referrer policy and a permissions policy.
- Auth errors are generic; data errors shown to users never include database details.
- No secrets in the repo; only the public anon key is used in the browser.
- `npm audit` reported 0 vulnerabilities at build time.

## Known limitations

- Supabase's browser client keeps the session in `localStorage`. The strict CSP reduces XSS risk, but a cookie-based session via serverless functions would be stronger.
- The CSP allows inline styles (`style-src 'unsafe-inline'`) because FullCalendar injects styles at runtime.
- There is no custom rate limiting; Supabase Auth's built-in limits apply. No serverless functions are used.
- Reminders are in-app only and update while the app is open; there are no push or email notifications.
- Events use local wall-clock time without time zones, and are single-day.
- No recurring events.
