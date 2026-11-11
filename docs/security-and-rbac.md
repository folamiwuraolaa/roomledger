# Security and RBAC

## Authentication
Passwords are hashed using Werkzeug. A protected server session identifies the current user.

## Authorization
- Member: household operations available to ordinary members.
- Household Admin: member operations plus household member/role management.
- Super Admin: system-level oversight.

## Security controls
- Server-side user identity.
- Household membership checks.
- Server-side amount and participant validation.
- Secure production cookies.
- Exact CORS origin configuration.
- No plaintext passwords.
- No frontend-only role enforcement.
- Super Admin setup lock after first account.

## Threats considered
Unauthorized household access, forged payer IDs, over-settlement, duplicate membership, weak credentials, session theft and accidental disclosure of system-wide data.
