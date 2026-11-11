# Roommate Ledger Python Backend

Flask REST API for authentication, households, expenses, balances, settlements, notifications and Super Admin monitoring.

## Run locally

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

API:

`http://localhost:5000`

Health:

`http://localhost:5000/api/health`

## Production

The production backend runs on Render and uses Supabase PostgreSQL.

Set these Render environment variables:

```text
DATABASE_URL=<Supabase Session Pooler connection string>
FLASK_SECRET_KEY=<long random secret>
FRONTEND_ORIGIN=https://roomledgers.vercel.app
COOKIE_SECURE=true
```

The database URL must come from Supabase's connection settings. Do not commit credentials or production secrets.

## Important security rules

- Normal member login cannot be used to enter a Super Admin account.
- Super Admin has a dedicated setup and login flow.
- Household creation requires an authenticated account so the server can assign the creator as household admin.
- Household, expense and settlement mutations are validated server-side.
- The browser is not trusted to determine balances or permissions.
