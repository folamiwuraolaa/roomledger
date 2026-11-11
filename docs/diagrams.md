# Roommate Ledger — Mermaid Design Diagrams

These diagrams describe the implemented Roommate Ledger system. The group labels identify the major architectural or feature areas.

## 1. System architecture

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — PRESENTATION"]
        UI["React + TanStack Frontend"]
    end
    subgraph G2["GROUP 2 — API"]
        API["Python Flask REST API"]
    end
    subgraph G3["GROUP 3 — DOMAIN"]
        LEDGER["Ledger calculations"]
        RULES["Validation + RBAC"]
    end
    subgraph G4["GROUP 4 — PERSISTENCE"]
        ORM["SQLAlchemy"]
        DB["Supabase PostgreSQL / SQLite"]
    end

    UI --> API
    API --> LEDGER
    API --> RULES
    API --> ORM
    ORM --> DB
```

## 2. Feature map

```mermaid
mindmap
  root((GROUP 1 — ROOMMATE LEDGER))
    GROUP 2 — Accounts
      Register
      Login
      Logout
      Household Admin
      Household Member
      Super Admin
    GROUP 3 — Households
      Create household
      Join by invite code
      Member management
      Role management
    GROUP 4 — Expenses
      Add expense
      Categories
      Payer
      Participants
      Equal split
      Custom split
      Expense history
      PDF receipt
    GROUP 5 — Balances
      Net balance
      I owe
      Owed to me
      Who owes whom
    GROUP 6 — Settlements
      Record settlement
      Settlement history
      PDF receipt
    GROUP 7 — Notifications
      Expense notification
      Settlement notification
      Read
      Read all
    GROUP 8 — Super Admin
      One-time setup
      Dedicated login
      Users
      Households
      Expenses
      Settlements
```

## 3. Authentication flow

```mermaid
flowchart TD
    subgraph G1["GROUP 1 — VISITOR"]
        V["Visitor"]
    end
    subgraph G2["GROUP 2 — MEMBER AUTH"]
        R["Register"]
        L["Member Login"]
    end
    subgraph G3["GROUP 3 — HOUSEHOLD SETUP"]
        C["Create household"]
        J["Join household"]
    end
    subgraph G4["GROUP 4 — SUPER ADMIN"]
        S["Super Admin Setup"]
        SL["Super Admin Login"]
        D["Super Admin Dashboard"]
    end

    V --> C
    V --> J
    C --> R
    J --> R
    R --> C
    R --> J
    V --> L
    L --> D
    V --> S --> SL --> D
```

## 4. Expense lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Validating: Submit expense
    Validating --> Saved: Valid shares
    Validating --> Draft: Validation error
    Saved --> Calculated: Ledger recalculation
    Calculated --> Visible: Update dashboard
    Visible --> Deleted: Authorized deletion
    Deleted --> [*]
```

## 5. Settlement lifecycle

```mermaid
flowchart LR
    subgraph G1["GROUP 1 — CURRENT DEBT"]
        A["Outstanding debt"]
    end
    subgraph G2["GROUP 2 — SETTLEMENT"]
        B["Payer confirms amount"]
        C["Server validates amount"]
        D["Settlement saved"]
    end
    subgraph G3["GROUP 3 — UPDATED STATE"]
        E["Debt reduced"]
        F["Debt becomes zero"]
    end

    A --> B --> C --> D --> E
    E --> F
```

## 6. Role access model

```mermaid
flowchart TB
    subgraph G1["GROUP 1 — MEMBER"]
        M["Expenses • Balances • Settlements • Profile"]
    end
    subgraph G2["GROUP 2 — HOUSEHOLD ADMIN"]
        A["Member permissions + household management"]
    end
    subgraph G3["GROUP 3 — SUPER ADMIN"]
        S["System-wide monitoring and administration"]
    end

    A --> M
    S --> A
```

## 7. Deployment

```mermaid
flowchart LR
    subgraph G1["GROUP 1 — FRONTEND HOSTING"]
        V["Vercel"]
    end
    subgraph G2["GROUP 2 — BACKEND HOSTING"]
        R["Render"]
    end
    subgraph G3["GROUP 3 — DATABASE"]
        P["Supabase PostgreSQL"]
    end

    V -->|"HTTPS API"| R
    R -->|"PostgreSQL"| P
```

## 8. SDLC

```mermaid
flowchart LR
    A["GROUP 1 — Requirements"] --> B["GROUP 2 — Analysis"]
    B --> C["GROUP 3 — Design"]
    C --> D["GROUP 4 — Implementation"]
    D --> E["GROUP 5 — Testing"]
    E --> F["GROUP 6 — Deployment"]
    F --> G["GROUP 7 — Maintenance"]
    G --> A
```
