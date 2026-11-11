# Build It Better

build this

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c5a1c9a4-c259-41de-b2c7-295035cd3b8a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Python Backend

The UI is intentionally still TypeScript + React + TanStack because that is the frontend Lovable generated. The **authoritative application server is now Python/Flask**.

Architecture:

```text
React + TanStack Router
        |
        | HTTP / JSON
        v
Python Flask API
        |
        v
SQLAlchemy
        |
        +--> SQLite (local development)
        |
        +--> PostgreSQL / Neon (deployment)
```

The browser no longer needs localStorage as the source of truth. Authentication, households, expenses, shares, balances, settlements and notifications are stored and validated by the Python server.

### Run the Python API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

pip install -r requirements.txt
cp .env.example .env
python run.py
```

The API runs on:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### Run the frontend

In another terminal:

```bash
npm install
npm run dev
```

The frontend expects:

```text
VITE_API_URL=http://localhost:5000/api
```

Create a `.env.local` file in the project root if you want to override the default.

### PostgreSQL / Neon

For deployment, replace the SQLite `DATABASE_URL` in `backend/.env` with a PostgreSQL connection string, for example:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The application uses SQLAlchemy so the application models and API do not need to be rewritten when moving from SQLite to PostgreSQL.

### Important

Do not add a wallet system just to make the backend look more financial. The backend models the actual project requirement:

- Users
- Households
- Household memberships
- Expenses
- Expense shares
- Settlements
- Notifications

The authoritative balance calculation is performed on the Python server.
