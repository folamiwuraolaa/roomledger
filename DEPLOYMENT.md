# Roommate Ledger — Production Deployment

The project uses one repository with two deployed applications:

- **Frontend:** React + TanStack Start on Vercel
- **Backend:** Python + Flask + Gunicorn on Render
- **Database:** Supabase PostgreSQL
- **Local database:** SQLite

## 1. Supabase

1. Create/open the Supabase project.
2. Open **Connect**.
3. Use the **Session Pooler** connection string for the Render backend.
4. Keep SSL enabled (`sslmode=require`).
5. Do not commit the connection string.

## 2. Render backend

Create a Render Web Service from the same GitHub repository.

Settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app
```

Environment variables:

```env
DATABASE_URL=<Supabase Session Pooler connection string>
FLASK_SECRET_KEY=<long random production secret>
FRONTEND_ORIGIN=https://roomledgers.vercel.app
COOKIE_SECURE=true
```

Test:

```text
https://build-it-better-main.onrender.com/api/health
```

Expected:

```json
{"service":"roommate-ledger-api","status":"ok"}
```

The API root is:

```text
https://build-it-better-main.onrender.com/api/
```

## 3. Vercel frontend

Create/import the frontend project from the repository.

Settings:

```text
Root Directory: .
Build Command: npm run build
```

Production environment:

```env
VITE_API_URL=https://build-it-better-main.onrender.com/api
```

Deploy the frontend.

## 4. CORS and sessions

The Render backend must use the exact frontend origin:

```env
FRONTEND_ORIGIN=https://roomledgers.vercel.app
COOKIE_SECURE=true
```

The frontend sends API requests with credentials so the Flask session cookie can authenticate users.

## 5. Super Admin

Open:

```text
https://roomledgers.vercel.app/super-admin/setup
```

Create the first Super Admin account.

After setup, use:

```text
https://roomledgers.vercel.app/super-admin/login
```

The normal member login cannot be used for the Super Admin account, and the setup endpoint cannot create a second Super Admin.

## 6. Production checks

- Render service is live.
- `/api/health` returns 200.
- Frontend loads.
- Registration works.
- Create-household flow works without a login-first dead end.
- Join-household flow validates invite codes.
- Login works.
- Super Admin setup/login works.
- Expense creation and exact splitting work.
- Balances update correctly.
- Settlements cannot exceed outstanding debts.
- CORS and secure cookies work.

## 7. Local development

Backend:

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

Frontend:

```bash
npm install
npm run dev
```

Local API:

```text
http://localhost:5000/api
```

Local frontend:

```text
http://localhost:8080
```

## 8. Security

Never commit:

- `.env`
- database credentials
- Flask secret keys
- `.venv`
- `node_modules`
- local SQLite databases

The repository includes `backend/.env.example` as the safe configuration template.
