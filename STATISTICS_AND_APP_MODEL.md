# Realtor App Stats & Roles (How This App Works)

## What the “statistics” are showing in this app

This admin app is currently built like an **agent/realtor network + commission workflow** platform. So the dashboard “statistics” are business KPIs about:

- the number of realtors on the platform
- the number of properties in inventory
- the receipt approval workflow
- commissions earned/paid
- total “sales” inferred from approved receipts

They are **not** buyer-analytics metrics like listing views, lead conversion, tour requests, etc.

## Where the admin overview metrics come from (code + meaning)

Admin overview UI: `src/components/Admin Dashboard components/Admin dashboard overview components/AdminDashboardOverview.tsx`

Data source: `src/services/apiService.ts` (`overviewService.getOverviewSnapshot`)

### KPI cards

- **Total Realtors**
  - Meaning: total users with role `realtor`
  - Code: `src/services/apiService.ts:792-794`

- **Total Properties**
  - Meaning: total inventory rows in `properties`
  - Code: `src/services/apiService.ts:792-794`

- **Pending Receipts**
  - Meaning: number of receipts waiting for review/approval
  - Code: `src/services/apiService.ts:794-795`

- **Commission paid**
  - Meaning: sum of all commission rows where `status = 'paid'`
  - Code: `src/services/apiService.ts:795-796`

- **Total sale**
  - Meaning: sum of receipt amounts where `status = 'approved'`
  - This is “sales” only in the sense that approved receipts represent recorded payments.
  - Code: `src/services/apiService.ts:796-797`

### Charts

- **Commission chart**
  - Meaning: monthly commission totals (current year), based on `commissions` with statuses `approved` + `paid`
  - Code: `src/services/apiService.ts:653-674` and `src/services/apiService.ts:797-798`

- **Realtors chart**
  - Meaning: monthly count of new realtor signups (current year), based on `users.created_at` where `role='realtor'`
  - Code: `src/services/apiService.ts:676-697` and `src/services/apiService.ts:798-799`

### Tables/Lists

- **Top realtors**
  - Meaning: top earners by total commission (year-to-date)
  - Code: `src/services/apiService.ts:699-736` and `src/services/apiService.ts:799-800`

- **Recent receipts**
  - Meaning: recent receipt submissions enriched with realtor + property
  - Code: `src/services/apiService.ts:738-776` and `src/services/apiService.ts:800-801`

## Where the properties page metrics come from (code + meaning)

Properties UI: `src/components/Admin Dashboard components/Admin dashboard properties components/AdminDashboardProperties.tsx`

- **Total properties / Active properties / Sold out properties**
  - Meaning: inventory counts by `properties.status`
  - Code: `src/components/Admin Dashboard components/Admin dashboard properties components/AdminDashboardProperties.tsx:220-235`

These are inventory status metrics, not sales metrics.

## Do we have “users” beyond admins and realtors?

Right now, in your schema/types, `users.role` is only:

- `admin`
- `realtor`

Code: `src/services/types.ts:2`

From your SQL snapshots:

- You do have a `public.users` table with `role` values including `admin` and `realtor`.
- You have **clients** only as text on receipts (e.g., `client_name`), meaning clients are not platform accounts.
- You have **developers** as separate rows in `public.developers`, not auth users.

So yes: you do have “users”, but only in two roles for now.

## How a “standard realtor app” usually works (two common models)

### 1) Consumer marketplace (Zillow/Rightmove pattern)

Typical roles:
- buyers/renters (consumer accounts)
- agents/realtors
- sellers/developers
- admins

Typical flow:
- consumers browse listings
- they inquire (lead) or request tours
- agents respond
- deal closes (often off-platform)

Typical stats:
- listing views, saves, inquiries/leads
- conversion funnels (view → lead → tour → close)
- agent response time, lead response rate
- pipeline and deal analytics

### 2) Agent network / commission platform (closer to this app)

Typical roles:
- realtors/agents
- admins
(customers may exist later, but aren’t required to start)

Typical flow:
- admin curates/creates properties
- realtor finds a client off-platform
- payment happens (often off-platform)
- realtor uploads proof (receipt)
- admin reviews/approves/rejects
- commission gets credited/paid out

Typical stats:
- receipts by status
- commissions pending/approved/paid
- payout requests
- top earning realtors
- referral network performance

## Best-practice conclusion for this project

This app is following best practices **for an agent-network / commission platform**:

- properties are inventory
- receipts are the verification workflow
- commissions/payouts are the financial layer
- admin dashboards focus on approvals, compliance, and payouts

If you want the product to behave like the consumer marketplace model later, you’d typically add:

- a buyer/customer profile and role
- “leads/inquiries” tables and workflows
- property view / engagement analytics
- a deal/pipeline model (optional)

