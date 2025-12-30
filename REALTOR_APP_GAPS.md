# Realtor App Functionality Gaps (Current Codebase)

Date: 2025-12-30

## Confirmed “Bridge” Model (Exists)

- Developer → Property is modeled via `properties.developer_id` → `developers.id`.
- Property → Receipt is modeled via `receipts.property_id` → `properties.id`.
- Receipt → Realtor is modeled via `receipts.realtor_id` (and `commissions.realtor_id`, `payouts.realtor_id`) → `users.id`.

References:
- Schema: [developers_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/developers_rows.sql), [properties_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/properties_rows.sql), [receipts_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/receipts_rows.sql)
- Admin UI receipt status updates: [AdminDashboardReceipts.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20receipts%20components/AdminDashboardReceipts.tsx)

Notes:
- `receipts.property_id` is nullable, so receipts can exist without an attached property (and therefore without a path back to a developer).

## Money Flow (Partially Exists)

Implemented pieces:
- Admin can update receipt status (pending/under_review/approved/rejected) via `receiptService.updateStatus`.
- Commissions and payouts are modeled in the database and displayed together in Admin “Transactions”.
- Admin can mark commissions and withdrawals as `paid` (or `rejected`) via `commissionService.updateStatus` and `payoutService.updateStatus`.
- Realtor “balance” is computed from commissions (approved/paid) minus payouts (paid) and minus pending payouts.

References:
- Admin services: [apiService.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/apiService.ts)
- Admin transactions UI: [AdminDashboardTransactions.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20transactions%20components/AdminDashboardTransactions.tsx)
- Realtor (reference) transactions/balance logic: [transactionService.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/realtor%20webapp%20src%20DO%20NOT%20MODIFY%20JUST%20REFERENCE/services/transactionService.ts)

Not implemented / incomplete:
- There is no automation that creates a `commissions` row when a receipt is approved.
  - No SQL trigger/function in the provided schema that inserts into `commissions` on receipt status change.
  - No client-side code inserts into `commissions` when `receiptService.updateStatus()` is called.
- There is no “commission approval” step separate from “mark as paid” in the admin UI; anything not `paid` or `rejected` is treated as “Pending”.

## Receipt → Commission Automation (Missing)

What’s missing right now:
- A deterministic rule and implementation for computing commission amount on receipt approval.
  - `properties` contains `commission_percent`, but there is no implemented logic that uses it to create/update commissions.
- A DB-level trigger (recommended) or server-side function (RPC / edge function) to:
  - On receipt status transition to `approved`, insert a commission row:
    - `commissions.realtor_id = receipts.realtor_id`
    - `commissions.receipt_id = receipts.id`
    - `commissions.amount = <calculated>`
    - `commissions.status = 'pending'` (or `approved` if you want to skip the approval stage)
  - Prevent duplicate commissions for the same receipt.

## Referral Tracking (Exists) but Referral Commissions (Missing)

Implemented pieces:
- `users` includes `referral_code` and `referred_by`.
- Signup flow (reference app) can resolve a referral code to a referrer and set `users.referred_by`.
- A `referrals` table exists (upline/downline, level, commission_earned).
- A trigger exists to notify the upline when a referral record is inserted.

References:
- Referral schema: [users_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/users_rows.sql), [referrals_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/referrals_rows.sql)
- Reference signup referral lookup: [authService.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/realtor%20webapp%20src%20DO%20NOT%20MODIFY%20JUST%20REFERENCE/services/authService.ts)
- Referral record insertion (reference): [authManager.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/realtor%20webapp%20src%20DO%20NOT%20MODIFY%20JUST%20REFERENCE/services/authManager.ts)

Not implemented / incomplete:
- No mechanism stages referral commissions for admin approval or payment:
  - `referrals.commission_earned` is not automatically computed/updated.
  - There is no “referral commission” ledger table comparable to `commissions` and nothing ties referrals to earnings events.

## Missing / Undefined DB Functions (Schema Gaps)

In the provided SQL snapshots, these triggers reference functions that are not defined in the same snapshot set:
- `receipts_rows.sql`: `notify_receipt_updates()`
- `commissions_rows.sql`: `notify_commission_updates()`
- `payouts_rows.sql`: `notify_payout_updates()`
- `users_rows.sql`: `notify_user_welcome()`
- `referrals_rows.sql`: `notify_upline_on_referral()`

Separately, the admin app calls `rpc("create_notification", ...)`, but no `create_notification(...)` definition exists in the SQL snapshots. The code does fall back to a direct insert into `notifications` if the RPC fails.

References:
- Notifications functions that do exist in snapshot: [notifications_rows.sql](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE/notifications_rows.sql)

