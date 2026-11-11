# Deployment Guide

## Architecture

- Frontend: Vercel
- Backend: Render Web Service
- Database: Supabase PostgreSQL
- Local database: SQLite
- API: Python Flask + Gunicorn

## Supabase

1. Create a Supabase project.
2. Open **Connect** and use the **Session Pooler** connection string for the Render backend.
3. Put the exact Supabase connection string in Render as `DATABASE_URL`.
4. Set a long random `FLASK_SECRET_KEY`.
5. Set `COOKIE_SECURE=true`.
6. Set `FRONTEND_ORIGIN` to the exact Vercel frontend origin.

Do not put database credentials in the frontend or commit them to Git.

## Render

Set the service root directory to:

```text
backend
```

Use:

```text
gunicorn run:app
```

Required environment variables:

```env
DATABASE_URL=<Supabase Session Pooler connection string>
FLASK_SECRET_KEY=<long random production secret>
FRONTEND_ORIGIN=https://roomledgers.vercel.app
COOKIE_SECURE=true
```

The backend should report **Your service is live** after a successful deployment.

## Vercel frontend

Set:

```env
VITE_API_URL=https://build-it-better-main.onrender.com/api
```

Then deploy using the project's existing build command:

```bash
npm run build
```

## Production checks

- `/api/health` returns HTTP 200.
- Render service starts with `gunicorn run:app`.
- Frontend can send credentialed requests to the backend.
- CORS preflight returns HTTP 200 for the configured frontend origin.
- Registration creates a user session.
- Create-household flow creates the creator as admin.
- Join-household flow validates invite codes.
- Expense splitting works and shares sum exactly to the total.
- Balances update after settlements.
- Super Admin setup succeeds only once.
- Normal member login cannot authenticate a Super Admin account.
- Secure session cookies are enabled in production.
