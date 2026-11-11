# Non-Functional Requirements

- **Security:** password hashing, secure sessions, RBAC, input validation and household isolation.
- **Accuracy:** all monetary calculations use integer kobo.
- **Usability:** plain-language balances and obvious settlement actions.
- **Responsiveness:** mobile-first layout with no horizontal overflow.
- **Performance:** common reads/writes should complete within a few seconds under expected project load.
- **Reliability:** errors are returned clearly and failed writes do not silently appear successful.
- **Maintainability:** backend business rules are centralized in Flask/ledger services.
- **Scalability:** PostgreSQL/Supabase supports growth beyond local SQLite.
- **Portability:** application can run locally and in a cloud deployment.
- **Testability:** ledger arithmetic is deterministic and suitable for unit tests.
