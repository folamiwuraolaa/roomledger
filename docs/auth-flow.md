# Roommate Ledger Authentication Flow

## Create Household (logged out)

The Create Household path is intentionally unauthenticated until registration completes.

1. User enters a unique household name.
2. `POST /api/households/check-name` verifies availability without requiring login.
3. User enters name, email, password and confirmation.
4. `POST /api/auth/register` atomically creates the user, household and admin membership.
5. Flask creates the authenticated session in the same response.
6. Frontend stores the returned state and navigates directly to `/dashboard`.

The protected `POST /api/households` endpoint is only used when an already authenticated user creates an additional household; it is not used by the logged-out signup flow.

## Join Household

Joining an existing household still requires an account. A logged-out visitor is sent to registration with the invite code preserved.

## Super Admin

Super Admin has separate setup and login routes. Normal member login rejects Super Admin accounts and instructs the user to use the dedicated Super Admin login.
