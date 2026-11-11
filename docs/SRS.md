# Software Requirements Specification (SRS)

## 1. Introduction
Roommate Ledger is a web-based shared dorm expense splitter. It records shared expenses, allocates participant shares, calculates balances and records settlements.

## 2. Purpose
The system reduces ambiguity and manual arithmetic when roommates share groceries, utilities and household costs.

## 3. Users
- Member
- Household Admin
- Super Admin

## 4. Functional Requirements
1. Registration and authentication.
2. Household discovery and invite-code joining.
3. Household creation and membership management.
4. Expense recording.
5. Equal/custom share validation.
6. Balance and debt calculation.
7. Settlement recording.
8. Notifications and receipts.
9. Super Admin one-time setup and system monitoring.

## 5. Non-Functional Requirements
Security, usability, accuracy, availability, responsiveness, maintainability, scalability, auditability and deployability.

## 6. Constraints
The project is not a bank. Wallets, loans and artificial balances are excluded from the core system. PostgreSQL/Supabase is the production database target; SQLite is the local-development option.

## 7. Acceptance Criteria
The system is acceptable when a household can register users, record shared expenses, calculate exact debts, settle debts, preserve original expense records, enforce roles and isolate household data.
