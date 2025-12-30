INSERT INTO "public"."notifications" ("id", "user_id", "type", "message", "seen", "created_at", "title", "metadata") VALUES ('307fd09a-78bb-41ba-b6b6-cde252e90306', 'f793c5b9-f035-4a3c-9f64-cb75508c7538', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'false', '2025-12-23 14:48:13.502451+00', 'Welcome to Veriplot!', '{}'), ('3ba505ab-fce8-4142-b5e0-a00040d88a01', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'success', 'Your receipt for Donwanchasm has been approved.', 'false', '2025-12-29 00:54:58.852873+00', 'Receipt Approved', '{"status":"approved","receipt_id":"469a1994-6b3d-4b75-922e-bf8ea37f6d69"}'), ('3ba96ba3-dc40-4782-b468-15a013552715', '1dcf37f1-4b2f-428b-84a0-989797a42992', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'true', '2025-12-23 11:28:12.772637+00', 'Welcome to Veriplot!', '{}'), ('3f34e6a1-5ec5-4179-8d18-9c85cd3ef634', '780a3dd1-8f95-4388-89d9-45a51b365788', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'true', '2025-12-23 08:45:33.171746+00', 'Welcome to Veriplot!', '{}'), ('5ed9af92-8aeb-4252-97bc-8a8363db60a7', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'success', 'A new user has joined using your referral code.', 'true', '2025-12-23 09:01:47.292995+00', 'New Referral!', '{"downline_id":"bd52d2a3-43cd-4d4e-a7d3-06a5075345cc"}'), ('6b9ba4ec-db30-4a11-9d85-13f3de8199d6', 'bd52d2a3-43cd-4d4e-a7d3-06a5075345cc', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'true', '2025-12-23 09:01:30.945307+00', 'Welcome to Veriplot!', '{}'), ('83f6f62d-2dc1-4e1c-b60a-d3a33645dadb', '6d593a63-879a-4d40-9c84-489739ef74f5', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'false', '2025-12-25 20:15:54.35693+00', 'Welcome to Veriplot!', '{}'), ('9f85225d-0b00-4964-b111-f950380b2c12', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'error', 'Your receipt for Donwanchasm has been rejected.', 'false', '2025-12-29 00:50:51.048612+00', 'Receipt Rejected', '{"status":"rejected","receipt_id":"469a1994-6b3d-4b75-922e-bf8ea37f6d69"}'), ('af1e0a1c-f704-49b0-8d17-60fb2e9401d7', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'info', 'Receipt for client Donwanchasm has been submitted for review.', 'true', '2025-12-23 10:33:41.901246+00', 'Receipt Submitted', '{"amount":50000,"receipt_id":"469a1994-6b3d-4b75-922e-bf8ea37f6d69"}'), ('d81feb9e-45e6-4254-8e19-e38cc9838132', '24d7bbc1-651a-4a57-9258-37eb26b18008', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'false', '2025-12-23 14:57:17.769926+00', 'Welcome to Veriplot!', '{}'), ('de841416-4efc-4b18-9521-3fd30347af24', '4f139fb0-e98c-42c0-ae2f-55c14353520b', 'auth', 'Your account has been successfully created. Please complete your KYC.', 'true', '2025-12-23 08:55:10.97469+00', 'Welcome to Veriplot!', '{}');

create table public.notifications (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  type text not null,
  message text not null,
  seen boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  title text null,
  metadata jsonb null default '{}'::jsonb,
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id on public.notifications using btree (user_id) TABLESPACE pg_default;

alter table public.notifications
add column if not exists target_role text null;

create index if not exists idx_notifications_user_id_target_role_seen_created_at
on public.notifications using btree (user_id, target_role, seen, created_at);

create or replace function public.notify_admin_receipt_pending()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'pending')
    or (tg_op = 'UPDATE' and new.status = 'pending' and new.status is distinct from old.status) then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'receipt_pending',
      'Receipt pending approval',
      concat('A new receipt from ', coalesce(new.client_name, 'a client'), ' is pending review.'),
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Receipts',
        'receipt_id', new.id,
        'realtor_id', new.realtor_id,
        'status', new.status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_receipt_pending on public.receipts;
create trigger trg_notify_admin_receipt_pending
after insert or update of status on public.receipts
for each row execute function public.notify_admin_receipt_pending();

create or replace function public.notify_admin_payout_pending()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'pending')
    or (tg_op = 'UPDATE' and new.status = 'pending' and new.status is distinct from old.status) then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'payout_pending',
      'Withdrawal pending approval',
      'A new withdrawal request is pending review.',
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Transactions',
        'payout_id', new.id,
        'realtor_id', new.realtor_id,
        'status', new.status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_payout_pending on public.payouts;
create trigger trg_notify_admin_payout_pending
after insert or update of status on public.payouts
for each row execute function public.notify_admin_payout_pending();

create or replace function public.notify_admin_kyc_pending()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'realtor' and new.kyc_status = 'pending' then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'kyc_pending',
      'KYC pending review',
      concat('New realtor ', trim(concat(coalesce(new.first_name, ''), ' ', coalesce(new.last_name, ''))), ' has pending KYC.'),
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Realtors',
        'realtor_id', new.id,
        'kyc_status', new.kyc_status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_kyc_pending on public.users;
create trigger trg_notify_admin_kyc_pending
after insert on public.users
for each row execute function public.notify_admin_kyc_pending();





[
  {
    "schemaname": "public",
    "tablename": "notifications",
    "policyname": "Admins insert notifications",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "notifications",
    "policyname": "Admins read notifications",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "notifications",
    "policyname": "Users read own notifications",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "notifications",
    "policyname": "Users update own notifications",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "notifications",
    "policyname": "Users view own notifications",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  }
]


