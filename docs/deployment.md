# Deployment Guide

## Supabase
1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Set backend `DATABASE_URL` to the Supabase URL.
4. Set a long random `FLASK_SECRET_KEY`.
5. Set `COOKIE_SECURE=true`.
6. Set `FRONTEND_ORIGIN` to the exact Vercel domain.

## Vercel frontend
Set:

```env
VITE_API_URL=https://YOUR-BACKEND/api
```

Then run the Vercel build using the project's existing `npm run build` command.

## Backend
The Flask backend can be deployed as a Python web service/serverless function. Its `gunicorn` Procfile is suitable for a conventional Python host. The database should be Supabase PostgreSQL in production.

## Production checks
- Health endpoint responds.
- Login works.
- Browser can call API with credentials.
- Secure session cookie is present.
- Registration can list households.
- Expense splitting works.
- Settlement works.
- Super Admin setup is locked after creation.
