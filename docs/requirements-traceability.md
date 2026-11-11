# Requirements Traceability Matrix

| Requirement | Design | Implementation | Test |
|---|---|---|---|
| FR-01 Registration | Auth architecture | `/api/auth/register` | TC-AUTH-001 |
| FR-02 Household selection | Registration flow | `/api/households/available` | TC-HH-001 |
| FR-06 Expenses | Expense model | `/api/expenses` | TC-EXP-001 |
| FR-08 Balances | Ledger design | `ledger.py` | TC-BAL-001 |
| FR-10 Settlement | Settlement sequence | `/api/settlements` | TC-SET-001/002/003 |
| FR-12 RBAC | RBAC design | role checks | TC-RBAC-001/002 |
| FR-16 Super Admin | Setup state diagram | `/api/super-admin/setup` | TC-SA-001/002 |
