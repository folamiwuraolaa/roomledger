# Roommate Ledger

Roommate Ledger is a web-based shared dorm expense splitter for roommates to record groceries, utilities and other household expenses, calculate exact shares, see who owes whom, and record settlements.

> **Project scope:** This is an expense-sharing system, not a bank. There is no wallet, deposit, withdrawal, loan or artificial account balance.

## 1. Core workflow

```mermaid
flowchart LR
    A["1. ADD EXPENSE"] --> B["2. SPLIT EXPENSE"]
    B --> C["3. CALCULATE BALANCES"]
    C --> D["4. SEE WHO OWES WHOM"]
    D --> E["5. SETTLE"]
    E --> F["6. UPDATED BALANCES"]
```

## 2. System architecture

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — CLIENT / PRESENTATION"]
        Browser["Web Browser"]
        Frontend["React + TanStack Router
Responsive UI"]
    end

    subgraph G2["GROUP 2 — APPLICATION / API"]
        Flask["Python Flask REST API"]
        Auth["Session Authentication"]
        RBAC["Role & Household Access Control"]
    end

    subgraph G3["GROUP 3 — DOMAIN / BUSINESS LOGIC"]
        Ledger["Ledger Engine
Balances • Debts • Equal Split"]
        Validation["Validation Rules"]
        Notifications["Notification Logic"]
        Receipts["PDF Receipt Generation"]
    end

    subgraph G4["GROUP 4 — DATA / PERSISTENCE"]
        ORM["SQLAlchemy ORM"]
        SQLite["SQLite
Local Development"]
        Postgres["Supabase PostgreSQL
Production"]
    end

    Browser --> Frontend
    Frontend -->|"HTTPS / JSON"| Flask
    Flask --> Auth
    Flask --> RBAC
    Flask --> Ledger
    Flask --> Validation
    Flask --> Notifications
    Flask --> Receipts
    Flask --> ORM
    ORM --> SQLite
    ORM --> Postgres
```

## 3. Production deployment architecture

```mermaid
flowchart LR
    subgraph G1["GROUP 1 — USER"]
        U["Student / Roommate"]
    end

    subgraph G2["GROUP 2 — FRONTEND"]
        V["Vercel
roomledgers.vercel.app"]
    end

    subgraph G3["GROUP 3 — BACKEND"]
        R["Render
Flask + Gunicorn"]
    end

    subgraph G4["GROUP 4 — DATABASE"]
        S["Supabase PostgreSQL"]
    end

    U -->|"HTTPS"| V
    V -->|"API requests"| R
    R -->|"SQLAlchemy / PostgreSQL"| S
```

## 4. Main features

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — ACCOUNT & ACCESS"]
        F1["Register"]
        F2["Login / Logout"]
        F3["Household Admin account flow"]
        F4["Household Member account flow"]
        F5["Dedicated Super Admin setup"]
        F6["Dedicated Super Admin login"]
    end

    subgraph G2["GROUP 2 — HOUSEHOLDS"]
        F7["Create household"]
        F8["Join with invite code"]
        F9["View members"]
        F10["Manage member roles"]
        F11["Remove settled members"]
    end

    subgraph G3["GROUP 3 — EXPENSES"]
        F12["Add expense"]
        F13["Choose payer"]
        F14["Choose participants"]
        F15["Equal / custom share validation"]
        F16["Expense history"]
        F17["Expense PDF receipt"]
    end

    subgraph G4["GROUP 4 — BALANCES & SETTLEMENTS"]
        F18["Net balance"]
        F19["I owe"]
        F20["Owed to me"]
        F21["Who owes whom"]
        F22["Record settlement"]
        F23["Settlement history"]
        F24["Settlement PDF receipt"]
    end

    subgraph G5["GROUP 5 — SYSTEM ADMINISTRATION"]
        F25["System-wide user statistics"]
        F26["Household statistics"]
        F27["Recent expenses"]
        F28["Recent settlements"]
        F29["Super Admin-only access"]
    end
```

## 5. User roles

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — HOUSEHOLD MEMBER"]
        M1["Register / Login"]
        M2["Join household"]
        M3["Add expenses"]
        M4["View balances"]
        M5["Record settlements"]
        M6["View receipts"]
    end

    subgraph G2["GROUP 2 — HOUSEHOLD ADMIN"]
        A1["Everything a member can do"]
        A2["Create household"]
        A3["Manage members"]
        A4["Change member roles"]
        A5["Remove members when balance is settled"]
    end

    subgraph G3["GROUP 3 — SUPER ADMIN"]
        S1["One-time setup"]
        S2["Dedicated login"]
        S3["System-wide dashboard"]
        S4["View users"]
        S5["View households"]
        S6["View recent system records"]
    end
```

**Important:** Super Admin is not a selectable normal household account and should not use the ordinary member login.

## 6. Authentication and onboarding flow

```mermaid
flowchart TD
    subgraph G1["GROUP 1 — ENTRY"]
        A["Landing page"]
        B["Create household"]
        C["Join household"]
        D["Log in"]
        E["Super Admin"]
    end

    subgraph G2["GROUP 2 — ACCOUNT"]
        F["Register"]
        G["Member login"]
        H["Super Admin setup"]
        I["Super Admin login"]
    end

    subgraph G3["GROUP 3 — HOUSEHOLD SETUP"]
        J["Create household"]
        K["Enter invite code"]
        L["Household dashboard"]
    end

    A --> B --> F
    A --> C --> F
    A --> D --> G
    A --> E --> I
    E --> H
    F --> J
    F --> K
    G --> L
    J --> L
    K --> L
    H --> I
```

A visitor does **not** need to log in before choosing **Create household**. If they are not authenticated, the app sends them through registration first; the server then authenticates the new account before creating the household. This preserves secure ownership without forcing an unnecessary login-first dead end.

## 7. Expense and settlement design

```mermaid
sequenceDiagram
    participant U as GROUP 1 — User
    participant F as GROUP 2 — Frontend
    participant A as GROUP 3 — Flask API
    participant L as GROUP 4 — Ledger Engine
    participant D as GROUP 5 — Database

    U->>F: Add expense
    F->>A: POST /api/expenses
    A->>A: Authenticate + validate household
    A->>L: Validate shares and calculate split
    L-->>A: Exact shares
    A->>D: Save expense + shares
    D-->>A: Saved
    A-->>F: Updated household state
    F-->>U: Show updated balances
```

```mermaid
sequenceDiagram
    participant U as GROUP 1 — Debtor
    participant F as GROUP 2 — Frontend
    participant A as GROUP 3 — Flask API
    participant L as GROUP 4 — Ledger Engine
    participant D as GROUP 5 — Database

    U->>F: Settle debt
    F->>A: POST /api/settlements
    A->>L: Calculate outstanding debt
    L-->>A: Maximum valid settlement
    A->>D: Save settlement
    D-->>A: Saved
    A-->>F: Updated balances
    F-->>U: Debt reduced / settled
```

## 8. Balance formula

For each household member:

`Net Balance = Amount Paid - Individual Shares + Settlements Sent - Settlements Received`

- **Positive:** the household owes this person.
- **Negative:** this person owes the household.
- **Zero:** settled.

Example:

- Wura pays ₦40,000.
- Wura, Tolu, Ada and John participate.
- Equal share = ₦10,000 each.
- Wura's net = ₦40,000 − ₦10,000 = **+₦30,000**.
- Tolu, Ada and John each have **−₦10,000**.

## 9. Exact splitting

```mermaid
flowchart LR
    subgraph G1["GROUP 1 — INPUT"]
        A["Total amount"]
        B["Participants"]
    end

    subgraph G2["GROUP 2 — SPLIT ENGINE"]
        C["Integer division"]
        D["Remainder distribution"]
    end

    subgraph G3["GROUP 3 — VALIDATION"]
        E["Share total = expense total"]
    end

    A --> C
    B --> C
    C --> D --> E
```

For ₦10,000 shared by three people:

**₦3,334 + ₦3,333 + ₦3,333 = ₦10,000**

The system stores money in **kobo** to avoid floating-point calculation errors.

## 10. Security boundaries

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — UNTRUSTED CLIENT"]
        Browser["Browser / React UI"]
    end

    subgraph G2["GROUP 2 — TRUSTED SERVER"]
        Session["Authenticated Session"]
        Permission["Role + Household Checks"]
        Validation["Input Validation"]
        Logic["Ledger Rules"]
    end

    subgraph G3["GROUP 3 — DATA"]
        DB["SQLite / Supabase PostgreSQL"]
    end

    Browser --> Session
    Session --> Permission
    Permission --> Validation
    Validation --> Logic
    Logic --> DB
```

The browser is never the source of truth for authentication, balances, permissions or household ownership. The Flask server validates protected operations.

## 11. Local development

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Local API:

`http://localhost:5000`

Health endpoint:

`http://localhost:5000/api/health`

Frontend environment:

```env
VITE_API_URL=http://localhost:5000/api
```

### Production environment

Frontend:

```env
VITE_API_URL=https://build-it-better-main.onrender.com/api
```

Backend on Render:

```env
DATABASE_URL=<Supabase Session Pooler connection string>
FLASK_SECRET_KEY=<long random secret>
FRONTEND_ORIGIN=https://roomledgers.vercel.app
COOKIE_SECURE=true
```

Never commit `.env`, production database credentials, or secret keys.

## 12. Documentation

- `docs/SRS.md` — software requirements
- `docs/architecture.md` — architectural design
- `docs/database-design.md` — database design
- `docs/functional-requirements.md` — functional requirements
- `docs/non-functional-requirements.md` — non-functional requirements
- `docs/security-and-rbac.md` — security and role access
- `docs/deployment.md` — deployment
- `docs/user-manual.md` — user guide
- `docs/testing.md` — testing
- `docs/diagrams.md` — Mermaid diagrams
- `docs/requirements-traceability.md` — requirements traceability
- `docs/SDLC.md` — software development lifecycle

## 13. Project structure

```text
.
├── src/                    # React + TanStack frontend
│   ├── routes/             # Application pages and flows
│   ├── components/         # Reusable UI
│   └── lib/                # Client ledger helpers and API state
├── backend/
│   └── app/
│       ├── routes.py       # Flask API
│       ├── models.py       # SQLAlchemy models
│       ├── ledger.py       # Balance and split logic
│       └── __init__.py     # Application factory
├── docs/                   # Software engineering documentation
└── public/                 # Static assets
```
