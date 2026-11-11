# Testing Strategy and Test Cases

## Test levels
1. Unit testing — split and balance calculations.
2. API integration testing — authentication, households, expenses and settlements.
3. System testing — complete member/admin/Super Admin journeys.
4. Security testing — authorization, household isolation and invalid inputs.
5. Responsive testing — mobile, tablet and desktop layouts.

## Core cases

| ID | Input | Expected |
|---|---|---|
| TC-EXP-001 | ₦40,000; 4 participants | ₦10,000 each |
| TC-EXP-002 | ₦10,000; 3 participants | ₦3,334 + ₦3,333 + ₦3,333 |
| TC-SET-001 | Pay full outstanding debt | Pairwise debt becomes zero |
| TC-SET-002 | Pay half | Remaining debt is half |
| TC-SET-003 | Pay more than debt | API rejects request |
| TC-SET-004 | Recipient outside household | API rejects request |
| TC-SA-001 | First setup | Super Admin created |
| TC-SA-002 | Second setup | API rejects request |
| TC-RBAC-001 | Member changes role | API returns 403 |
| TC-RBAC-002 | User reads another household | API denies access |
