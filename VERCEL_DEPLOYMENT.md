# Vercel Frontend Deployment

Vercel hosts the **frontend only**.

## Settings

```text
Root Directory: .
Build Command: npm run build
```

Production environment:

```env
VITE_API_URL=https://build-it-better-main.onrender.com/api
```

The Python backend is deployed separately on Render:

```text
https://build-it-better-main.onrender.com
```

Do not configure the frontend Vercel project as a Python/Flask backend.

Backend settings:

```text
Root Directory: backend
Start Command: gunicorn run:app
```

See `DEPLOYMENT.md` for the complete deployment process.
