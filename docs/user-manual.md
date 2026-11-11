# Roommate Ledger — User Manual

## 1. Create an account

1. Open **Create household** or **Join a household** from the landing page, or choose **Get started**.
2. Enter your full name, email and password.
3. Select the account flow:
   - **Create a household** — continue to household creation; the creator becomes Household Admin.
   - **Join a household** — continue to the invite-code flow as a Household Member.
4. The application signs the new user in automatically after successful registration.

A visitor does not have to log in before choosing **Create household**. Authentication is completed through registration before the server creates the household.

## 2. Create a household

1. Choose **Create a household**.
2. Enter the household name.
3. Submit the form.
4. Roommate Ledger creates a unique invite code.
5. Share the invite code with roommates.
6. The creator is automatically the household admin.

## 3. Join a household

1. Choose **Join a household**.
2. Enter the invite code supplied by the household admin.
3. Submit the code.
4. If the code is valid and the account is not already in another household, membership is created.

## 4. Add an expense

1. Open **Add expense**.
2. Enter the expense name, category and amount.
3. Select who paid.
4. Select the participants.
5. Choose the split method.
6. Confirm that the shares add up exactly to the total.
7. Save the expense.

Members can add expenses. The server validates the payer, participants and exact share total.

## 5. View balances

The dashboard and **Balances** page show:

- My net balance
- Amount I owe
- Amount owed to me
- Who owes whom

A positive net balance means the household owes you. A negative balance means you owe.

## 6. Settle a debt

1. Open **Balances**.
2. Choose **Settle** beside a debt you owe.
3. Enter the settlement amount.
4. Confirm.
5. The server rejects an amount greater than the outstanding debt.
6. The original expense remains unchanged; the settlement is stored separately.

## 7. Household administration

Household admins can:

- View the household invite code.
- View members and balances.
- Change a member between **member** and **admin**.
- Remove another member only when that member's balance is settled.

## 8. Super Admin

Super Admin is separate from normal household accounts.

1. Open the dedicated **Super Admin Setup** page.
2. Complete the one-time setup.
3. The first Super Admin account is created and the setup becomes unavailable.
4. Use the dedicated **Super Admin Login** page thereafter.
5. The dashboard provides system-wide overview information for users, households, expenses and settlements.

The normal member login cannot be used to sign in as Super Admin.

## 9. Receipts and notifications

The system can generate expense and settlement PDF receipts. Household members can also receive in-app notifications for relevant expense and settlement activity.
