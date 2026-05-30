# JobSim AI — Security Guide

## Production checklist

### 1. Supabase SQL (required)

Run in order:

1. `SQL_SCHEMA.sql`
2. `SQL_FIX_POLICIES.sql`
3. `SQL_PREMIUM.sql`
4. `SQL_STORAGE.sql`
5. **`SQL_SECURITY.sql`** ← production hardening

### 2. Environment variables (Vercel)

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only — never expose to client |
| `OPENROUTER_API_KEY` | Yes | AI analysis |
| `HR_INVITE_CODE` | Yes | Secret code for HR registration |
| `COURSES_INVITE_CODE` | Yes | Secret code for Courses registration |
| `STRIPE_WEBHOOK_SECRET` | If Stripe | Webhook signature verification |
| `PREMIUM_PROMO_CODES` | Optional | Comma-separated promo codes |

### 3. What `SQL_SECURITY.sql` enforces

- **Role escalation blocked** — users cannot self-assign `hr` / `courses`
- **Attempt scoring integrity** — clients cannot set `score`, `ai_analysis`, or `completed` status
- **Narrow user visibility** — removes overbroad “view all users” policy
- **Secure group join** — join code validated via `join_group_by_code()` RPC
- **API rate limiting** — `check_rate_limit()` for server routes
- **Promo idempotency** — unique index on `(user_id, promo_code)`

### 4. Secured API routes

| Route | Protection |
|-------|------------|
| `POST /api/attempts/complete` | Auth + student + rate limit + server-side scoring |
| `POST /api/auth/register` | Rate limit + invite codes for privileged roles |
| `POST /api/groups/join` | Auth + student + secure RPC |
| `POST /api/ai/analyze` | Auth + rate limit (use `/complete` for exams) |
| `POST /api/reports/pdf` | Auth + HR + company ownership |
| `POST /api/premium/activate` | Auth + rate limit |
| `POST /api/attempts/upload` | Auth + magic-byte validation + 24h signed URLs |

### 5. HTTP security headers

Configured in `next.config.ts`:

- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`

### 6. Middleware

- Page routes: role-based access (`/student`, `/hr`, `/courses`)
- API routes: unauthenticated requests blocked (except `/api/auth/register`, `/api/premium/webhook`)

### 7. Operational recommendations

- Rotate invite codes and API keys periodically
- Enable Supabase email confirmation in production
- Monitor OpenRouter usage and set billing alerts
- Run `cleanup_rate_limits()` via Supabase cron (optional)
- Never commit `.env.local` or service role keys
