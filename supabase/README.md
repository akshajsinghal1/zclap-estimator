# Supabase Setup

1. Open Supabase SQL Editor for project `nqwwwpwpufvckgntmwvr`.
2. Run `supabase/schema.sql`.
3. Ensure `.env.local` contains:

```bash
SUPABASE_URL=https://nqwwwpwpufvckgntmwvr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

After this, estimator submissions will be stored as `pending` records and `/admin` will load data from Supabase.
