# Roommate Ledger Python API

Flask + SQLAlchemy backend for the Roommate Ledger shared dorm expense splitter.

## Responsibilities

- Authentication with secure password hashing and HTTP-only sessions
- Household creation and joining
- Household membership and roles
- Expense creation and deletion authorization
- Exact kobo-based expense splitting
- Authoritative balance and debt calculation
- Settlement recording and validation
- In-app notifications
- PDF expense receipts
- PDF settlement receipts
- SQLite for local development
- PostgreSQL/Neon for deployment

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The API listens on `http://localhost:5000`.

## API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/state`

### Household
- `POST /api/households`
- `POST /api/households/join`
- `PATCH /api/household/members/:id/role`
- `DELETE /api/household/members/:id`

### Expenses
- `POST /api/expenses`
- `DELETE /api/expenses/:id`
- `GET /api/expenses/:id/receipt`

### Settlements
- `POST /api/settlements`
- `GET /api/settlements/:id/receipt`

### Notifications
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

## Money representation

All amounts are stored as integer **kobo**. This prevents floating-point drift.

Example:

`₦40,000 = 4,000,000 kobo`

The frontend may format the value as Naira, but the backend remains authoritative.

## Database

SQLite is the default for local development.

For deployment use PostgreSQL:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The app automatically creates the current tables on startup. For a production release, introduce Alembic/Flask-Migrate migrations before changing deployed schemas.

## Security

- Passwords are hashed with Werkzeug.
- Authentication uses an HTTP-only session cookie.
- Household membership is checked server-side.
- Roles are checked server-side.
- Expense participants must belong to the household.
- Settlement amounts cannot exceed the current outstanding debt.
- Users cannot access another household's records.
- The frontend is never trusted for identity, roles or balance calculations.
