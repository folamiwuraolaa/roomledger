# Roommate Ledger — Supabase + Vercel Deployment

This project uses:

- **Frontend:** React + TanStack Start on Vercel
- **Backend:** Python + Flask on Vercel
- **Production database:** Supabase PostgreSQL
- **Local database:** SQLite

The simplest deployment is **two Vercel projects from the same Git repository**: one project for the frontend and one for the Flask backend. This keeps the two runtimes independent while allowing the frontend to call the Python API.

## 1. Create the Supabase project

1. Open the Supabase dashboard: https://supabase.com/dashboard
2. Create a new project.
3. Set a strong database password and keep it somewhere safe.
4. Wait for the project to finish provisioning.
5. Open **Connect** in the Supabase dashboard.
6. Choose the **Transaction Pooler** connection for the Vercel serverless backend.
7. Copy the PostgreSQL connection string.
8. Replace the password placeholder with the real database password.
9. Keep `sslmode=require`.

Supabase recommends the transaction pooler for serverless/edge workloads because those environments create short-lived connections. The application disables Psycopg prepared statements and limits the SQLAlchemy pool to one connection per warm instance for this deployment model.

## 2. Put the project on GitHub

From the project root:

```bash
git init
git add .
git commit -m "Prepare Roommate Ledger for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do **not** commit `.env`, `backend/.env`, `roommate_ledger.db`, `node_modules`, or `.venv`.

## 3. Deploy the Flask backend to Vercel

Create a new Vercel project and import the same GitHub repository.

Set:

- **Root Directory:** `backend`
- **Framework:** let Vercel detect Flask

Vercel now has native Flask/Python support, so a separate `/api` wrapper is not required for this Flask backend.

Add these Production environment variables in Vercel:

```text
DATABASE_URL=YOUR_SUPABASE_TRANSACTION_POOLER_URL
FLASK_SECRET_KEY=YOUR_LONG_RANDOM_SECRET
FRONTEND_ORIGIN=https://YOUR-FRONTEND.vercel.app
COOKIE_SECURE=true
```

Optional email variables:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=Roommate Ledger <noreply@example.com>
```

Deploy the backend.

Then test:

```text
https://YOUR-BACKEND.vercel.app/api/health
```

Expected response:

```json
{"service":"roommate-ledger-api","status":"ok"}
```

## 4. Deploy the frontend to Vercel

Create another Vercel project from the same GitHub repository.

Set:

- **Root Directory:** repository root (`./`)
- Framework: TanStack Start/Vite detection

Add this Production environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
```

Deploy the frontend.

## 5. Update the backend CORS origin

After the frontend deployment gives you its URL, make sure the backend has:

```text
FRONTEND_ORIGIN=https://YOUR-FRONTEND.vercel.app
COOKIE_SECURE=true
```

If you later add a custom frontend domain, change `FRONTEND_ORIGIN` to that exact HTTPS origin and redeploy the backend.

## 6. Create the first Super Admin

After both deployments are live, open:

```text
https://YOUR-FRONTEND.vercel.app/super-admin/setup
```

Enter:

- Full name
- Super Admin email
- Password
- Confirm password

The backend only permits this setup when there is no existing Super Admin. Once the account exists, setup returns a locked/complete state.

Then use:

```text
https://YOUR-FRONTEND.vercel.app/super-admin/login
```

The Super Admin dashboard provides system-wide counts and oversight of users, households, expenses and settlements.

## 7. Important security rules

- Never put `DATABASE_URL` in frontend environment variables.
- Never put `FLASK_SECRET_KEY` in `VITE_*` variables.
- Never commit `.env` files.
- Use HTTPS in production.
- Keep `COOKIE_SECURE=true` in production.
- Keep `FRONTEND_ORIGIN` restricted to the actual frontend origin; do not use `*` with credentialed requests.
- Do not add a Super Admin option to ordinary registration.

## 8. Local development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The local API is:

```text
http://localhost:5000/api
```

### Frontend

From the project root:

```bash
npm install --legacy-peer-deps
npm run dev -- --port 8080
```

Local frontend:

```text
http://localhost:8080
```

The frontend `.env` should contain:

```text
VITE_API_URL=http://localhost:5000/api
```

The local backend `.env` should contain:

```text
DATABASE_URL=sqlite:///roommate_ledger.db
FLASK_SECRET_KEY=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:8080
COOKIE_SECURE=false
```

## 9. Database behavior

The application calls `db.create_all()` when the Flask app starts. This is suitable for this student prototype and first deployment.

For a larger production system, introduce Alembic/Flask-Migrate before making schema changes in production.

## 10. Deployment checklist

- [ ] Supabase project created
- [ ] Transaction Pooler URL copied
- [ ] GitHub repository updated
- [ ] Backend Vercel project deployed from `backend/`
- [ ] `DATABASE_URL` added to backend
- [ ] `FLASK_SECRET_KEY` added to backend
- [ ] `FRONTEND_ORIGIN` added to backend
- [ ] `COOKIE_SECURE=true`
- [ ] `/api/health` returns 200
- [ ] Frontend Vercel project deployed
- [ ] `VITE_API_URL` points to backend
- [ ] Super Admin setup completed once
- [ ] Normal member registration tested
- [ ] Household creation/join tested
- [ ] Expense creation tested
- [ ] Balances tested
- [ ] Settle Up tested
- [ ] Settlement receipt tested
- [ ] Logout tested
