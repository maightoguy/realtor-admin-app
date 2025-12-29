# KYC-Based Access Control (TODO)

## Goal
Enforce platform capabilities based on a realtor’s KYC state using backend-first best practices (database/RLS), with UI gating as a supportive layer.

## Principles
- Backend enforcement is the source of truth (RLS/policies); UI gating is UX only.
- Least privilege: realtors cannot update their own `kyc_status`.
- Explicit, consistent error codes/messages for blocked actions.
- Auditability: KYC decisions and enforcement should be traceable.

## Phase 1 — Data & Ownership
- [ ] Confirm canonical states for `users.kyc_status` (`pending`, `approved`, `rejected`) and when they change.
- [ ] Add KYC metadata fields (as needed): `kyc_reviewed_at`, `kyc_reviewed_by`, `kyc_rejection_reason`, `kyc_submitted_at`.
- [ ] Ensure only admins can write `kyc_status` and review metadata (DB/RLS + app logic).
- [ ] Add an audit log table (e.g., `kyc_audit_logs`) capturing status changes and reviewer identity.

## Phase 2 — Backend Enforcement (Supabase RLS)
- [ ] Define a single “is approved” predicate (SQL function or policy pattern) to avoid duplicated policy logic.
- [ ] Add RLS policies that allow restricted actions only when KYC is approved, for example:
  - [ ] `receipts`: allow `insert`/`update` by realtor only if their `kyc_status = 'approved'`.
  - [ ] `payouts`/withdrawals: allow `insert` only if `kyc_status = 'approved'`.
  - [ ] `properties` (if realtor-created): allow `insert/publish` only if `kyc_status = 'approved'`.
  - [ ] `referrals/commissions` (if user-triggered): restrict creation to approved KYC.
- [ ] Add an admin override pattern in policies (e.g., `users.role = 'admin'`) so admins can manage all rows.
- [ ] Prevent “self-escalation” vectors in RLS (e.g., realtor updating `users.role` or `users.kyc_status`).
- [ ] Add indexes supporting policy predicates (e.g., `users(id, kyc_status)` if needed).

## Phase 3 — App-Layer Guards (Consistent UX)
- [ ] Centralize KYC capability checks in one place (capabilities map), e.g.:
  - `canSubmitReceipt`
  - `canRequestPayout`
  - `canPublishListing`
  - `canAccessReferrals`
- [ ] Apply guards to routes and key entry points (buttons, forms, navigation).
- [ ] Standardize blocked-state UX:
  - “Complete KYC” CTA deep-linking to the KYC screen
  - Clear reason (“KYC pending review” vs “KYC rejected”) with next steps
- [ ] Ensure the UI never assumes success: handle RLS “permission denied” errors and show a friendly blocker message.

## Phase 4 — Admin Workflows (KYC Review)
- [ ] Keep KYC approval/rejection actions server-authoritative (admin-only writes to `users.kyc_status`).
- [ ] Require explicit reviewer actions and store reviewer identity in KYC metadata/audit logs.
- [ ] Add safe document viewing rules (signed URLs or restricted buckets), not public-by-default documents.

## Phase 5 — Testing & Verification
- [ ] Add policy-level tests (SQL-level or integration) proving:
  - Unapproved realtor cannot create restricted records.
  - Approved realtor can create restricted records.
  - Realtor cannot modify their own `kyc_status`.
  - Admin can perform review actions.
- [ ] Add app-level tests for UI guards (route redirects, disabled actions, error handling).

## Phase 6 — Rollout & Observability
- [ ] Feature-flag enforcement to roll out gradually (especially if existing users are unverified).
- [ ] Add structured logging/telemetry for blocked attempts (without leaking sensitive data).
- [ ] Add dashboards/alerts for spikes in blocked actions (to detect policy regressions).

