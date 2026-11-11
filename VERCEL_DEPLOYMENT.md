# Vercel quick reference

## Backend project

Repository: this repository

Root Directory:

```text
backend
```

Environment variables:

```text
DATABASE_URL=Supabase transaction-pooler URL
FLASK_SECRET_KEY=long-random-secret
FRONTEND_ORIGIN=https://your-frontend.vercel.app
COOKIE_SECURE=true
```

Test:

```text
https://your-backend.vercel.app/api/health
```

## Frontend project

Repository: the same repository

Root Directory:

```text
.
```

Environment variable:

```text
VITE_API_URL=https://your-backend.vercel.app/api
```

Then redeploy after changing environment variables.
