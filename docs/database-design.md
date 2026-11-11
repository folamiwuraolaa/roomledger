# Database Design

## Tables

### users
Stores identity, password hash and the single Super Admin flag.

### households
Stores household name and unique invite code.

### memberships
Associates users with households and stores household role.

### expenses
Stores expense metadata, amount in kobo, payer and creator.

### expense_shares
Stores the exact amount each participant owes for an expense.

### settlements
Stores payments between household members. Settlements do not delete or modify the original expense.

### notifications
Stores in-app event messages.

## Integrity rules
- Email is unique.
- Household invite code is unique.
- User-household membership is unique.
- Expense share is unique per expense/user.
- Expense shares must sum to expense amount.
- Settlement payer and receiver must be different household members.
- Settlement amount cannot exceed current pairwise debt.
