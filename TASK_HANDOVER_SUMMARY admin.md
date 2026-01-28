## Scope

This document is a complete handover for the entire repository, with extra detail on the work completed in this chat session.

Primary scoped work completed in this chat:

- Implement “View details” behavior in the Realtor Details section so that:

  - Properties “View details” navigates to the Properties section and opens the clicked property inside the existing AdminPropertyDetails flow (no duplicate property-detail logic in RealtorDetailsSection).
  - Receipts / Transactions / Withdrawals “View details” open the already-existing detail modals from their corresponding dashboard sections (no new modals created for realtor details).
  - The same behavior works when viewing a referred realtor’s details (callbacks are passed through referrals).

- Add Search + Filter support for the Properties → Developers tab so that:
  - The shared search bar works for Developers (without affecting Properties search state).
  - The shared filter modal switches config when on Developers tab and filters locally (Name/Email/Phone/Status/Date Added).
  - Switching tabs resets the search input to avoid cross-tab query confusion.

- Expand and stabilize admin dashboard filtering across sections (matching realtor webapp patterns) so that:
  - Receipts/Realtors/Transactions/Referrals/Notifications/Properties filters behave consistently and do not break state.
  - Filters support richer inputs (text fields, date ranges, number ranges) with validation.
  - Properties search UX avoids loader spam while typing.

- Implement a comprehensive responsive UI pass (mobile-first) so that:
  - Navigation works on mobile via a slide-in drawer while preserving the desktop sidebar.
  - Tables remain readable on small screens via horizontal scroll wrappers (no desktop layout regression).
  - Touch targets meet minimum tap sizing on mobile.

## Project Overview

- App type: React + TypeScript + Vite admin dashboard
- Routing: `react-router-dom` (BrowserRouter, Routes/Route)
- Backend: Supabase (DB + Auth + Storage + Edge Functions)
- Styling: Tailwind (via `@tailwindcss/vite`)
- Runtime ports: dev + preview run on port `5000`

## Repo Layout (high level)

- [src](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src)
  - [App.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/App.tsx): router (Login + Dashboard)
  - [main.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/main.tsx): React bootstrap
  - [pages](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages)
    - [LoginPage.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages/LoginPage.tsx): admin-only login/forgot/OTP/reset flows
    - [AdminDashboardPage.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages/AdminDashboardPage.tsx): main dashboard shell + section switching
  - [components](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components): UI modules (Admin Dashboard sections + shared UI)
  - [services](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services): Supabase client + data access layer
  - [utils](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/utils): logger + helpers
- [SQL of current state of database table FOR REFERENCE](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/SQL%20of%20current%20state%20of%20database%20table%20FOR%20REFERENCE): sample/exported table rows (reference only)
- [realtor webapp src DO NOT MODIFY JUST REFERENCE](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/realtor%20webapp%20src%20DO%20NOT%20MODIFY%20JUST%20REFERENCE): separate app source kept for reference (excluded from build)

## Entry Points & Routing

- Routes are defined in [App.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/App.tsx#L1-L14):
  - `/` and `/login` render `LoginPage`
  - `/dashboard` renders `AdminDashboardPage`
- `AdminDashboardPage` is not route-per-section; it is one page that switches sections via `activeSection` state (Overview/Properties/Receipts/Realtors/Transactions/Notifications/Referrals/Settings).

## Environment & Configuration

- Vite env vars are read via [app_url.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/app_url.ts#L1-L3)
  - `VITE_API_BASE_URL`
  - `VITE_API_KEY`
- Supabase client is initialized in [supabaseClient.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/supabaseClient.ts#L1-L38) using those env vars.
- Security note: there is a `.env` in repo root that currently contains sensitive keys. Do not commit or share secrets; prefer `.env.local` and secret managers for deployments.

## Auth Model (Admin-only access)

- Login flow lives in [LoginPage.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages/LoginPage.tsx#L12-L199)
  - Supports sign-in, forgot password, email confirmation OTP, and password recovery.
  - After Supabase auth succeeds, the app fetches `users` table profile via `userService.getById(userId)` and enforces `role === "admin"` before navigating to `/dashboard`.
- Session refresh and protection happens again in [AdminDashboardPage.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages/AdminDashboardPage.tsx#L56-L120):
  - On mount: checks current session, loads profile, kicks user back to `/login` if not admin.
  - On SIGNED_IN: refreshes profile; on SIGNED_OUT: clears cached user and redirects to `/login`.
- Local caching:
  - `authManager` stores a user snapshot in localStorage: [authManager.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/authManager.ts)

## Data Layer & Supabase Integration

Data access is centralized in [apiService.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/apiService.ts) and related service files:

- Supabase client accessor:
  - [getSupabaseClient](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/services/supabaseClient.ts#L27-L38) throws if env vars missing.
- Core table services:
  - `userService`: users CRUD + role/kyc filtering + `removeAsAdmin()` (invokes Edge Function `admin-remove-user`)
  - `propertyService`: list/search/create/update/delete + safe fallbacks for missing `developer_id` column (handles schema drift)
  - `developerService`: CRUD for developers with status normalization
  - `receiptService`: list/filter/updateStatus for receipts + summary helpers
  - `commissionService`: list/updateStatus (invokes Edge Function `admin-update-commission-status`)
  - `payoutService`: list/updateStatus (invokes Edge Function `admin-update-payout-status`)
  - `referralService`: referral stats derived from users + commissions + referrals table
  - `overviewService`: aggregates overview snapshot used by dashboard home
  - `notificationService`: creates notifications, admin logs, and broadcast sending with chunking + RLS fallbacks
- Storage:
  - `propertyMediaService` (bucket `properties`) and `profileAvatarService` (bucket `profile-avatars`) handle uploads and public URL conversion, with explicit RLS error messaging.
- Logging:
  - [logger.ts](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/utils/logger.ts) logs in DEV only; in production builds logs are disabled by default.

## Admin Dashboard: Sections & User Flows

Dashboard section switching is in [AdminDashboardPage.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/pages/AdminDashboardPage.tsx#L180-L242).

- Overview
  - Component: [AdminDashboardOverview.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20overview%20components/AdminDashboardOverview.tsx)
  - Uses `overviewService.getOverviewSnapshot()` to render metrics, charts, top realtors, and recent receipts.
  - Reuses `AdminReceiptsDetailsModal` for receipt drill-in.
- Properties
  - Component: [AdminDashboardProperties.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20properties%20components/AdminDashboardProperties.tsx)
  - Contains list views + add form + details flows:
    - `AdminPropertyDetails` renders a single property details view and computes sales stats via receipts: [AdminPropertyDetails.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20properties%20components/AdminPropertyDetails.tsx)
- Receipts
  - Component: [AdminDashboardReceipts.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20receipts%20components/AdminDashboardReceipts.tsx)
  - Loads receipts, enriches with realtor + property lookup, supports searching/filtering and opens `AdminReceiptsDetailsModal`.
- Transactions
  - Component: [AdminDashboardTransactions.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20transactions%20components/AdminDashboardTransactions.tsx)
  - Merges commissions + payouts into a unified “Transaction” list, with separate modals:
    - `TransactionDetailsModal` (commissions)
    - `WithdrawalDetailsModal` (payouts)
  - Status updates for commissions/payouts go through Edge Functions (permission-aware).
- Realtors
  - Component: [AdminDashboardRealtors.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20realtors%20components/AdminDashboardRealtors.tsx)
  - Shows realtor list + detailed drill-in using `RealtorDetailsSection`.
- Referrals
  - Component: [AdminDashboardReferrals.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20referrals%20components/AdminDashboardReferrals.tsx)
  - Uses `referralService.getReferralStats()` to show recruiter summary, and also drills into `RealtorDetailsSection` for “referred realtor details”.
- Notifications
  - Component: [AdminDashboardNotifications.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20notifications%20components/AdminDashboardNotifications.tsx)
  - Displays “admin logs” derived from notifications, supports creating broadcast notifications and resending.
- Settings
  - Component: [AdminDashboardSettings.tsx](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/src/components/Admin%20Dashboard%20components/Admin%20dashboard%20settings%20components/AdminDashboardSettings.tsx)
  - Profile: updates first/last name + avatar upload.
  - Security: re-authenticates with old password then updates password.

## This Chat’s Implementation (Detailed)

### Problem statement (from chat)

- “View details” inside the Realtor Details tabs should not open bespoke/duplicated UIs.
- It should reuse the existing modals from the Receipts/Transactions sections, and the existing AdminPropertyDetails view for properties.
- The same behavior should also work for the “referred realtor details” view under Referrals.
- Admin dashboard filters needed to be extended to match the user webapp filter patterns and fixed where broken.
- Properties search needed to avoid showing the loader on every character input, and properties filters needed more robust inputs.
- Admin dashboard needed a responsive design implementation (mobile/tablet/desktop) without compromising desktop UI/behavior.

### Key design decisions

- Single source of truth: do not reconstruct a “property details object” in the realtor details screen; instead route to Properties and let `AdminPropertyDetails` render.
- Modal reuse: do not add new modals; use `AdminReceiptsDetailsModal`, `TransactionDetailsModal`, and `WithdrawalDetailsModal`.
- Cross-section navigation is callback-based: drill-in actions from Realtors/Referrals can request “open property X in Properties section”.
- Reuse a single shared filter modal (`AdminSearchFilterModal`) across admin sections and drive it via a per-section config.
- Prefer defensive parsing + validation at the modal boundary so each dashboard section receives clean filter objects.
- Mobile-first CSS approach: apply safe global accessibility improvements (touch targets) and add per-component responsive behavior where required.
- Preserve desktop layouts: add mobile-only wrappers (e.g. table horizontal scrolling) instead of changing column/layout rules.

## What Changed

### Cross-section navigation (Properties)

- Realtor details no longer constructs a standalone “property details” object for display. Instead it calls a navigation callback with the clicked property id.
- Admin dashboard page holds a small piece of state (`pendingPropertyDetailsId`) to carry the selected property id while switching sections.
- The Properties section consumes that id and selects the property so AdminPropertyDetails renders the correct record.

### Modal reuse (Receipts / Transactions / Withdrawals)

- Realtor details “View details” buttons now open the already-existing modals used in the Receipts and Transactions sections, passing the specific selected record.
- No new “receipt details modal” or “transaction details modal” was introduced for RealtorDetailsSection.

### Admin filters (Multi-section)

- Updated multiple admin dashboard sections to use consistent filter patterns (text search, date ranges, number ranges) and to avoid broken filter state when opening/closing the modal.
- Receipts filters were adjusted to remove the location filter and use a realtor name filter instead.
- Transactions filters were adjusted (client filter was added during refinement and later removed per requirement).
- Notifications filters were trimmed to the intended user type options.
- Referrals filters were overhauled to match the expected UX and data joins.

### Properties (Search + Filter robustness)

- Properties search input is debounced to reduce fetch spam and avoid showing the loader on every keystroke.
- Properties “Location” filtering uses a robust free-text input (instead of a brittle fixed options list).
- Properties “Property Type” filtering aligns to the app’s category options and database filtering uses `category` where applicable.
- Price filter min/max fields below the slider act as both display and editable inputs, staying in sync with the range slider.

### Properties → Developers tab (Search + Filter)

- `AdminDashboardProperties` now maintains separate search + filter state for the Properties list vs the Developers table.
- Developers filtering is client-side (it filters the already-fetched developers list):
  - Search matches against name/email/phone (token-based, case-insensitive).
  - Filter modal supports: Name, Email, Phone, Status, Date Added (date range).
- The search bar remounts per active tab (`key={activeTab}`) so switching tabs clears the input visually.

### Responsive design (Mobile / Tablet / Desktop)

- Breakpoints:
  - Mobile-first base styles.
  - Tablet: `min-width: 768px`.
  - Desktop: `min-width: 1024px`.
- Mobile navigation:
  - Desktop sidebar is unchanged (still `lg` only).
  - Mobile gets a slide-in navigation drawer with the same sections, profile access, and logout.
- Tables:
  - Tables are wrapped in a horizontal scroll container on smaller screens to prevent column collapse.
  - Desktop table layout and spacing remain unchanged.
- Touch targets:
  - Mobile enforces minimum 44px tap targets for common interactive elements.

## Files Touched

- [RealtorDetailsSection.tsx](<src/components/Admin Dashboard components/Admin dashboard realtors components/RealtorDetailsSection.tsx>)
  - Properties tab “View details” calls `onNavigateToPropertyDetails?.(property.id)`.
  - Receipts/Transactions/Withdrawals “View details” wire to existing detail modal state.
  - Tables use a horizontal scroll wrapper for mobile usability.
- [AdminDashboardPage.tsx](src/pages/AdminDashboardPage.tsx)
  - Adds `pendingPropertyDetailsId` and `handleNavigateToPropertyDetails(propertyId)`.
  - Passes `onNavigateToPropertyDetails` into Realtors + Referrals sections.
  - Passes `initialSelectedPropertyId` into Properties section and clears it after consumption.
  - Adds a mobile navigation drawer and wires it to the header menu button.
- [AdminDashboardHearder.tsx](src/components/AdminDashboardHearder.tsx)
  - Adds functional mobile header actions (notifications + menu) and connects menu to the drawer.
- [AdminDashboardProperties.tsx](<src/components/Admin Dashboard components/Admin dashboard properties components/AdminDashboardProperties.tsx>)
  - Accepts `initialSelectedPropertyId` and selects the matching property after the list has been fetched.
  - Adds Developers tab search + filter support, with separate state from Properties search + filters.
- [AdminSearchFilterModal.tsx](src/components/AdminSearchFilterModal.tsx)
  - Adds support for configurable text fields, date ranges, and number ranges, with validation.
  - Improves Properties filter robustness (free-text location, category-aligned property type, slider + input sync for price).
- [AdminDashboardRealtors.tsx](<src/components/Admin Dashboard components/Admin dashboard realtors components/AdminDashboardRealtors.tsx>)
  - Plumbs `onNavigateToPropertyDetails` into RealtorDetailsSection.
  - Table uses a horizontal scroll wrapper for mobile usability.
- [AdminDashboardReferrals.tsx](<src/components/Admin Dashboard components/Admin dashboard referrals components/AdminDashboardReferrals.tsx>)
  - Plumbs `onNavigateToPropertyDetails` into RealtorDetailsSection for referred realtor details.
  - Table uses a horizontal scroll wrapper for mobile usability.
- [AdminDashboardReceipts.tsx](<src/components/Admin Dashboard components/Admin dashboard receipts components/AdminDashboardReceipts.tsx>)
  - Updates filters to match intended behavior (includes realtor name filtering; removes receipt location/type filters as required).
  - Table uses a horizontal scroll wrapper for mobile usability.
- [AdminDashboardTransactions.tsx](<src/components/Admin Dashboard components/Admin dashboard transactions components/AdminDashboardTransactions.tsx>)
  - Updates filters to match intended behavior (and removes client entry filter as required).
  - Table uses a horizontal scroll wrapper for mobile usability.
- [AdminDashboardNotifications.tsx](<src/components/Admin Dashboard components/Admin dashboard notifications components/AdminDashboardNotifications.tsx>)
  - Adjusts filter options for user types to the intended set.
  - Table uses a horizontal scroll wrapper for mobile usability.
- [AdminDashboardOverview.tsx](<src/components/Admin Dashboard components/Admin dashboard overview components/AdminDashboardOverview.tsx>)
  - Recent receipts table uses a horizontal scroll wrapper for mobile usability.
- [AdminPropertyDeveloper.tsx](<src/components/Admin Dashboard components/Admin dashboard properties components/AdminPropertyDeveloper.tsx>)
  - Developers table uses a horizontal scroll wrapper for mobile usability.
- [AdminTransactionsData.ts](<src/components/Admin Dashboard components/Admin dashboard transactions components/AdminTransactionsData.ts>)
  - Adds missing fields needed for build correctness after filter/view details enhancements (e.g. `createdAtIso` on Transaction model).
- [apiService.ts](src/services/apiService.ts)
  - Aligns properties filtering with the database schema (uses `category` for property category filtering).
- [index.css](src/index.css)
  - Adds mobile-first touch target sizing and shared table scrolling utilities.

## Related Notes / Existing TODOs

- There is an existing KYC enforcement plan in [KYC_ACCESS_CONTROL_TODO.md](file:///c:/Users/hp/Desktop/Work/Assignment/realtor-admin-app/realtor-admin-app/KYC_ACCESS_CONTROL_TODO.md) outlining a backend-first approach (RLS as source of truth, UI gating as UX).

## How To Verify

1. Open Admin dashboard → Realtors → open any realtor → Properties sold tab → click “View details”.
   - Expected: Dashboard switches to Properties and the clicked property opens in AdminPropertyDetails.
2. In the same realtor details view → Receipts tab → click “View details”.
   - Expected: Receipt details modal opens (existing Receipts detail modal).
3. In the same realtor details view → Transactions tab → click “View details” for:
   - Commission transaction → existing transaction details modal opens.
   - Withdrawal/payout transaction → existing withdrawal details modal opens.
4. Go to Referrals → open a referred realtor’s details → repeat steps 1–3.

5. Go to Properties → switch to Developers tab:
   - Type into search: results should filter by name/email/phone.
   - Click filter icon: modal should show “Filter Developers” and allow filtering by Name/Email/Phone/Status/Date Added.
   - Switch back to Properties tab: search input should be cleared and properties filtering remains separate.

6. Sanity-check filters across sections:
   - Properties: apply price/type/location filters and confirm results update; edit min/max price inputs and confirm slider sync.
   - Receipts/Realtors/Referrals/Notifications: open filter modal, apply/reset, and confirm no broken state when reopening.

7. Responsive UI checks:
   - Mobile (<768px): open the hamburger menu, navigate between sections, open/close notifications, and confirm buttons/inputs are easily tappable.
   - Tablet (≥768px): confirm header layout stays readable and tables remain usable.
   - Desktop (≥1024px): confirm sidebar behavior and all existing hover states/interactions remain unchanged.
   - Small screens: confirm tables scroll horizontally rather than compressing into unreadable columns.

## Build

- `npm run build` (runs `tsc -b` then `vite build`)
