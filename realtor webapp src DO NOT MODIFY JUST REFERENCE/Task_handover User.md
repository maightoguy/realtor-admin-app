# Realtor App - Task Handover & Developer Documentation

## 1. Project Overview
**Application Type**: Single Page Application (SPA) for Realtor management.
**Primary Users**: Realtors (Sales, Receipts, Referrals) & Admins (Oversight).
**Current State**: Functional MVP for Realtors. Admin panel code exists as reference but is not fully integrated.
**Core Goal**: Enable realtors to register, complete KYC, manage property sales, upload receipts, and track multi-level referrals.

## 2. Architecture & Tech Stack
| Layer | Technology | Key Libraries/Notes |
|-------|------------|---------------------|
| **Frontend** | React (Vite) | TypeScript, Tailwind CSS, Lucide React (Icons) |
| **Routing** | React Router v6 | `BrowserRouter` wrapping `AppContent` |
| **State** | React Context | `UserContext` for global auth/user state |
| **Backend** | Supabase | Auth, PostgreSQL, Storage, Edge Functions |
| **Logging** | Custom Logger | `src/utils/logger.ts` (Use this instead of console.log) |
| **Deployment**| Netlify | Client-side routing handled via `_redirects` |

## 3. Critical Developer Guidelines (READ THIS)
*   **Authentication**:
    *   **ALWAYS** use `useUser()` hook to access current user data.
    *   **ALWAYS** await `authService.signOut()` before navigating away during logout to prevent race conditions.
    *   **NEVER** access `localStorage` directly for auth tokens; let Supabase client handle it.
*   **Routing Protection**:
    *   Wrap protected routes in `<RequireAuth>`. This component handles the loading state and redirects unauthenticated users.
*   **Database Interactions**:
    *   Use `src/services/*.ts` files (e.g., `authService`, `propertyService`). Do not make raw Supabase calls in components.
*   **Styling**:
    *   Use Tailwind CSS utility classes.
    *   For mobile responsiveness, ensure containers have appropriate padding (e.g., `px-4`) and buttons handle overflow (avoid `text-nowrap` on small screens).

## 4. Recent Changes & Fixes (Context for Next Session)
### A. Session Security (High Priority)
*   **Issue**: Users could navigate back to dashboard after logout.
*   **Fix**: Added `async/await` to `handleLogout` in `ProfileModal` and `MobileMenuModal`.
*   **Idle Timeout**:
    *   Implemented via `useIdleTimeout` hook.
    *   **Policy**: 30 mins for Realtors, 15 mins for Admins.
    *   **UX**: Warning modal appears 1 minute before expiration.
    *   **Cleanup**: Hook correctly clears timers and event listeners on unmount.

### B. Mobile Responsiveness
*   **Issue**: Partnership section CTA button overflowed on mobile.
*   **Fix**: Removed `text-nowrap`, centered text, and adjusted container padding in `Partnership.tsx`.

### C. Mobile File Picker Reload Resilience (KYC + Receipts)
Great catch — Android Developer Options (“limit background processes”) can aggressively kill the browser tab when switching to the system file picker. With that setting disabled, the issue typically disappears. Still, the app now gracefully resumes the user’s context if a reload happens due to low memory/OS behavior.

**Outcome**
*   The app restores the user’s previous dashboard context (tab + deep-link state) after a reload.
*   KYC upload and Receipt upload flows resume to the correct screen/modal, with a clear “please re-select your file(s)” banner when a reload is detected.

**What Changed**
*   Persisted dashboard query state to `localStorage` and restored it after reload (prevents dumping back to default dashboard view):
    *   `src/pages/Dashboard.tsx`
*   Made Property Details resumable via URL (`propertyId`), and avoided unnecessary list refetches when deep-linking to details:
    *   `src/components/Dashboard components/Dashboard Property component/DashboardProperties.tsx`
*   Made “Upload Receipt” resumable via URL (`receiptUpload=1`) and added a recovery banner after reload:
    *   `src/components/Dashboard components/Dashboard Property component/PropertyDetails.tsx`
    *   `src/components/Dashboard components/Dashboard Property component/UploadReceiptModal.tsx`
*   Made “Upload KYC document” resumable by reopening the modal after reload and showing a recovery banner:
    *   `src/components/Dashboard components/Dashboard settings/DashboardSettingsKYCTab.tsx`
*   Reduced “Checking session…” disruption by hydrating the user context from cached profile first, then refreshing:
    *   `src/context/UserContext.tsx`
*   Improved draft persistence typings and fixed existing draft restore call sites for typecheck/build stability:
    *   `src/services/draftService.ts`
    *   `src/components/Dashboard components/BankDetailsModal.tsx`
    *   `src/components/Dashboard components/Dashboard Property component/UploadReceiptModal.tsx`

**Notes / Limitations**
*   If the browser kills the tab before the file input `change` event fires, no web app can recover the selected file. The UI now recovers the user’s place and prompts re-selection.

**Tips To Avoid Future Reloads (Mobile)**
*   Keep “limit background processes” disabled in Developer options.
*   Avoid aggressive battery saver modes that restrict background tasks.
*   Close extra tabs/apps before starting uploads on low-memory devices.

### D. Nigerian Phone Validation + Settings Email Lock
**Outcome**
*   Phone numbers are validated and normalized to a consistent Nigerian format before saving.
*   Users can no longer edit their email address from Settings → Profile (email is display-only).

**What Changed**
*   Added a shared Nigerian phone utility that normalizes and validates:
    *   Accepts `08012345678`, `8012345678`, `2348012345678`, `+2348012345678`
    *   Normalizes to `+234XXXXXXXXXX`
    *   `src/utils/ngPhone.ts`
*   Registration phone validation now blocks invalid Nigerian numbers and stores normalized values:
    *   `src/components/registration components/PersonalInfoForm.tsx`
    *   `src/services/registrationService.ts`
*   Profile Settings phone is validated on save and stored normalized:
    *   `src/components/Dashboard components/Dashboard settings/DashboardSettings.tsx`
*   Profile Settings email field is read-only and no longer sent in the update payload:
    *   `src/components/Dashboard components/Dashboard settings/DashboardSettings.tsx`

**Verification**
*   `npm run lint`
*   `npm run build`

### E. Email Confirmation Landing Page
**Outcome**
*   Confirmation links now land on a dedicated page that tells the user their email is confirmed and to proceed to login.
*   If confirmation fails, users can resend the confirmation email from the same page.

**What Changed**
*   Added an email confirmation landing page:
    *   `src/pages/EmailConfirmed.tsx`
*   Wired the new route into the app router:
    *   `src/App.tsx` (`/email-confirmed`)
*   Updated Supabase signup + resend-confirmation redirect targets to use the new landing page:
    *   `src/services/authService.ts` (`emailRedirectTo: /email-confirmed`)
*   Updated registration success instructions so users know what to expect after clicking the email link:
    *   `src/pages/Registration.tsx`
*   Added a resend-confirmation form on the error state of the email confirmation page:
    *   `src/pages/EmailConfirmed.tsx`

**Verification**
*   `npm run lint`
*   `npm run build`

### F. Edge Function CORS Allowlist
**Outcome**
*   Edge functions used by the web app now support an allowlist-based CORS policy (safer than `*`).

**What Changed**
*   Added allowlist-based CORS headers driven by `ALLOWED_ORIGINS` (comma-separated) and echoed per-request origin when allowed:
    *   `supabase/functions/referrals-attach/index.ts`
    *   `supabase/functions/users-update-self/index.ts`

**How To Configure**
*   Set `ALLOWED_ORIGINS` in your Supabase Edge Function environment to a comma-separated list, e.g.:
    *   `https://yourdomain.com,https://www.yourdomain.com,https://your-site.netlify.app`

**Verification**
*   `npm run lint`
*   `npm run build`

### G. Netlify + Namecheap DNS Fix (Apex + WWW)
**Outcome**
*   `https://veriplot.com` and `https://www.veriplot.com` resolve correctly and load the Netlify site.

**Root Cause**
*   Domain was delegated to Netlify DNS (NS1 nameservers), but the apex `veriplot.com` was not resolving consistently due to missing/incorrect apex records during setup/propagation.

**Working Fix (What We Did)**
*   Kept Namecheap nameservers pointing to Netlify DNS:
    *   `dns1.p01.nsone.net`
    *   `dns2.p01.nsone.net`
    *   `dns3.p01.nsone.net`
    *   `dns4.p01.nsone.net`
*   In Netlify DNS for `veriplot.com`, set explicit apex A records:
    *   `veriplot.com` → A → `75.2.60.5`
    *   `veriplot.com` → A → `99.83.190.102`
*   Pointed `www` at the apex:
    *   `www.veriplot.com` → CNAME → `veriplot.com`
*   Waited for DNS propagation and re-verified HTTPS in Netlify once the records were visible to resolvers.

**Notes**
*   When using Netlify DNS, avoid adding a `www` CNAME directly to `*.netlify.app` if Netlify is already managing the domain mapping (can trigger “Potentially conflicting DNS record” warnings).

### H. Transactions Status (Approved vs Paid)
**Outcome**
*   Realtor dashboard no longer shows `approved` transactions as `Paid`.
*   Realtor dashboard now supports a distinct `Approved` status for both commissions and withdrawals.

**Root Cause**
*   The user dashboard UI mapping treated all non-`pending` credit transactions as `Paid`, which collapsed `approved` into `paid`.

**What Changed**
*   Updated UI status mapping to handle `approved` explicitly:
    *   `src/components/Dashboard components/Dashboard transactions/DashboardTransactions.tsx`
    *   `src/components/Dashboard components/Dashboard transactions/TransactionDetails.tsx`
*   Added `Approved` option to the transaction status filter config:
    *   `src/components/Dashboard components/filterConfigs.ts`
*   Aligned commission status typing in the user app service with the DB check constraint (includes `rejected`):
    *   `src/services/transactionService.ts`

**Backend Notes**
*   No Supabase SQL changes required (both `commissions.status` and `payouts.status` already support `approved` and `paid`).
*   Admin implementation already distinguishes `approved` vs `paid` and sends the chosen status to edge functions; the incorrect mapping was only in the user UI.

**Verification**
*   `npm run lint`
*   `npm run build`

### I. Referrals Table (Prefer Downline Name)
**Outcome**
*   Referrals table now prioritizes displaying the referred user's (downline) full name before any fallback.

**Root Cause**
*   The downline `users` row can be blocked by `users_select_self_or_admin` RLS, causing the `downline:users!referrals_downline_id_fkey(...)` join to return `null` and forcing the UI fallback to an ID-based label.

**What Changed**
*   Added an RPC fallback path in the referrals fetch to populate missing downline profile data when the join is unavailable:
    *   `src/services/apiService.ts` (`referralService.getByUplineId`)
*   Tightened UI display preference to show only full name, then fall back to a short ID label:
    *   `src/components/Dashboard components/Dashboard referrals/DashboardReferrals.tsx`

**Backend Step Required (Supabase)**
*   Create an RPC function named `get_downline_public_profiles` that returns only safe public fields (e.g., `id`, `first_name`, `last_name`) for downlines of the requesting upline. Without this, the UI will still fall back when RLS blocks the join.

**Verification**
*   `npm run lint`
*   `npm run build`

### J. Mobile Notifications Back Button Hit Area
**Outcome**
*   Mobile notifications header back button has a larger tap/click area.

**Root Cause**
*   The header title used negative margin which could overlap the button, reducing the effective hit area.
*   A non-standard width class on the button prevented the intended sizing from applying.

**What Changed**
*   Reworked the mobile header layout to center the title without overlapping the back button, and increased the back button size:
    *   `src/components/Dashboard components/NotificationModal.tsx`

**Verification**
*   `npm run lint`
*   `npm run build`

### K. Navbar Logo Scroll-To-Hero
**Outcome**
*   Clicking the landing navbar logo navigates to the hero section at the top of the page.

**What Changed**
*   React Router hash navigation does not auto-scroll (it uses `history.pushState`), so the logo now performs an explicit scroll to the hero section and updates the hash:
    *   `src/components/Navbar.tsx` (logo uses an anchor + `scrollIntoView`, updates `#home`)

**Verification**
*   `npm run lint`
*   `npm run build`

### L. Mobile Menu Logo Scroll-To-Hero
**Outcome**
*   Clicking the logo in the landing mobile menu closes the modal and scrolls to the hero section.

**What Changed**
*   Made the logo clickable and reuse the same scroll-to-hero behavior (close modal → smooth scroll → update `#home`):
    *   `src/components/LandingMobileMenuModal.tsx`

**Verification**
*   `npm run lint`
*   `npm run build`

### M. Password Reset Flow (No Redirect Loops)
**Outcome**
*   Password reset no longer bounces users to the dashboard.
*   Opening a reset link no longer makes the app appear “logged in” on the landing page.
*   After a successful password reset, the app signs the user out (must log in again).

**Root Cause**
*   The login page redirected any authenticated user to `/dashboard`, but Supabase password recovery creates a temporary session (`PASSWORD_RECOVERY`) which triggered that redirect.
*   Cached user profiles could make the UI look logged in during recovery.
*   Supabase can emit `SIGNED_IN` during recovery; profile-hydration logic treated it as a normal login.

**What Changed**
*   Added recovery-mode handling to prevent restoring user profiles and prevent dashboard redirects during password recovery:
    *   `src/services/authManager.ts` (recovery mode flag + skip profile restore)
    *   `src/context/UserContext.tsx` (do not hydrate `user` during recovery)
    *   `src/App.tsx` (route `PASSWORD_RECOVERY` events to `/login?mode=recovery`)
    *   `src/pages/LoginPage.tsx` (skip dashboard redirect when in recovery; reset flow returns to login)
    *   `src/components/auth/ResetPasswordForm.tsx` (sign out after successful password update)
*   Added a dedicated reset password route to isolate recovery from login/dashboard redirects:
    *   `src/pages/ResetPasswordPage.tsx` (`/reset-password`)
    *   `src/App.tsx` (route registered)
*   Added an early recovery-link redirect before React renders, so links that land on `/` with recovery tokens still open the reset UI:
    *   `src/main.tsx` (if `#type=recovery` / tokens present → redirect to `/reset-password` preserving the hash)
*   Updated the reset email redirect target to `/reset-password`:
    *   `src/services/authService.ts` (`resetPasswordForEmail` uses `redirectTo: /reset-password`)
*   Prevented auth persistence logic from treating recovery `SIGNED_IN` as a normal login:
    *   `src/services/authManager.ts` (skip profile fetch/save during recovery sessions)
*   Prevented Supabase client from consuming recovery hash before the app can route:
    *   `src/services/supabaseClient.ts` (lazy initialization instead of module-load initialization)

### N. Account Deletion Magic Link Confirmation Page
**Outcome**
*   Account deletion “magic link” no longer gets routed into reset password.
*   Clicking the deletion confirmation email opens a dedicated confirmation page, then forwards into the dashboard delete confirmation modal.

**Root Cause**
*   Recovery routing originally treated any `#access_token=...` hash as a password reset, but Supabase magic links also use `#access_token=...`.

**What Changed**
*   Recovery routing now triggers only for `#type=recovery`:
    *   `src/main.tsx`
    *   `src/App.tsx`
    *   `src/services/authManager.ts`
*   Account deletion email now redirects to a dedicated confirmation page:
    *   `src/services/authService.ts` (`sendAccountDeletionEmail` → `/confirm-delete`)
    *   `src/pages/ConfirmDeletePage.tsx` (waits for session then navigates to dashboard with `confirmDelete=1`)
    *   `src/App.tsx` (route added)

**Follow-up Fix**
*   Prevented recovery mode from “sticking” in localStorage and hijacking normal routes (login/register/email-confirmed):
    *   `src/App.tsx` (clears `realtor_app_recovery_mode` when not in recovery)
    *   `src/pages/LoginPage.tsx` (no longer redirects based on the storage flag alone)

**Deployment / Supabase Setting**
*   Ensure Supabase Auth URL allowlist includes:
    *   `https://veriplot.com/confirm-delete`
    *   `https://www.veriplot.com/confirm-delete`

**Verification**
*   `npm run lint`
*   `npm run build`

**Deployment / Supabase Setting**
*   Ensure Supabase Auth URL allowlist includes the recovery redirect target:
    *   `https://veriplot.com/reset-password`
    *   `https://www.veriplot.com/reset-password`
*   If the allowlist is missing, Supabase can fall back to the Site URL (`https://veriplot.com/#`), which prevents reaching the reset UI.

**Verification**
*   `npm run lint`
*   `npm run build`

## 5. Codebase Structure & Navigation
### Key Directories
*   `src/context/UserContext.tsx`: **Central Truth**. Handles user hydration, profile fetching, and role management.
*   `src/services/authService.ts`: **Auth Logic**. Handles SignUp (with referral logic), Login, Logout, and `ensureUserProfile` (critical for syncing Auth vs DB).
*   `src/hooks/useIdleTimeout.ts`: **Security**. Manages the auto-logout timer and warning state.
*   `src/components/auth/RequireAuth.tsx`: **Gatekeeper**. Protects routes.
*   `supabase/functions/referrals-attach/`: **Edge Function**. Handles secure referral linking.

### Reference-Only Directories
*   `Admin src.../`: Do not edit. Use only to copy-paste logic when building the actual Admin panel.
*   `SQL of current state.../`: Database schema dumps for reference.

## 6. Supabase Schema & Data Model
See `src/services/types.ts` for exact TypeScript definitions.
*   **`users`**: The core profile.
    *   `id`: References `auth.users.id`.
    *   `role`: 'realtor' or 'admin'.
    *   `referral_code`: Unique code generated at signup.
    *   `referred_by`: UUID of the upline user.
    *   `kyc_status`: 'pending', 'approved', 'rejected'.
*   **`referrals`**: Tracks the relationship tree (Upline -> Downline).
*   **`commissions`**: Ledger of earnings.

## 7. Environment Setup (.env)
Required keys for local development and Netlify:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

## 8. Deployment & Routing
*   **Netlify**:
    *   Requires `public/_redirects` file with `/* /index.html 200` to support React Router.
    *   Env vars must be set in Netlify UI.
*   **Domain**:
    *   Configured via CNAME (`www` -> `netlify-app-url`) and A Record (`@` -> Netlify IP).

## 9. Next Steps / Pending Tasks
1.  **Admin Panel**: The Admin logic needs to be properly integrated into the main `src` folder (currently isolated in reference folder).
2.  **Referral Testing**: The `referrals-attach` edge function needs production testing to ensure commission flows work.
3.  **Unit Tests**: Currently minimal. Critical paths (Auth, Commission calc) need tests.

## 10. Verification Steps
To verify the current state:
1.  **Login**: Use a realtor account.
2.  **Check Idle**: Wait (or lower timeout in `App.tsx`) to see the "Session Expiring" modal.
3.  **Logout**: Click logout; verify you cannot hit "Back" to return to dashboard.
4.  **Mobile**: Resize browser to mobile width; check Partnership section alignment.
5.  **Mobile Upload Recovery** (Optional): Open KYC/Receipt upload, switch to file picker, then return; verify the app restores context and shows the recovery banner if it reloads.

## 11. Ongoing Documentation Rule
After every non-trivial task, add a brief “Outcome / What Changed / Verification” note to this file so future sessions have an accurate running log of fixes and architectural decisions.
