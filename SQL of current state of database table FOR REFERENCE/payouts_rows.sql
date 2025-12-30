INSERT INTO "public"."payouts" ("id", "realtor_id", "amount", "status", "bank_details", "created_at", "paid_at") VALUES ('149300de-5b8b-4e50-b60c-65b4025302c4', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', '20000', 'pending', '{"bankName":"United Bank for Africa","accountNo":"2101193001","accountName":"Veriplot Technologies"}', '2025-12-21 10:27:40.388118+00', null), ('c0f836ef-221c-4abd-9ece-21fd64d58235', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', '80000', 'approved', '{"bankName":"Opay","accountNo":"8087292952","accountName":"Saliu Richard Olugbenga"}', '2025-12-22 16:54:36.501677+00', null);

create table public.payouts (
  id uuid not null default extensions.uuid_generate_v4 (),
  realtor_id uuid null,
  amount numeric not null,
  status text null default 'pending'::text,
  bank_details jsonb null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  paid_at timestamp with time zone null,
  constraint payouts_pkey primary key (id),
  constraint payouts_realtor_id_fkey foreign KEY (realtor_id) references users (id) on delete CASCADE,
  constraint payouts_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'paid'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payouts_realtor_id on public.payouts using btree (realtor_id) TABLESPACE pg_default;

create trigger trg_notify_payout_updates
after INSERT
or
update OF status on payouts for EACH row
execute FUNCTION notify_payout_updates ();








[
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "Admins can manage all payouts",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "Realtors can request payouts",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((auth.uid() = realtor_id) AND ((status IS NULL) OR (status = 'pending'::text)) AND (paid_at IS NULL))"
  },
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "Realtors can view own payouts",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = realtor_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "admin_update_payouts_status",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))",
    "with_check": "((EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text)))) AND (status = ANY (ARRAY['paid'::text, 'rejected'::text])))"
  },
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "payouts_select_realtor_or_admin",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "((realtor_id = auth.uid()) OR is_admin())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payouts",
    "policyname": "payouts_update_admin_status_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "is_admin()",
    "with_check": "(is_admin() AND (status = ANY (ARRAY['paid'::text, 'rejected'::text])) AND (( SELECT p.status\n   FROM payouts p\n  WHERE (p.id = payouts.id)) = ANY (ARRAY['pending'::text, 'approved'::text])) AND (amount = ( SELECT p.amount\n   FROM payouts p\n  WHERE (p.id = payouts.id))) AND (NOT (realtor_id IS DISTINCT FROM ( SELECT p.realtor_id\n   FROM payouts p\n  WHERE (p.id = payouts.id)))) AND (NOT (bank_details IS DISTINCT FROM ( SELECT p.bank_details\n   FROM payouts p\n  WHERE (p.id = payouts.id)))) AND (((status = 'paid'::text) AND (paid_at IS NOT NULL)) OR ((status = 'rejected'::text) AND (paid_at IS NULL))))"
  }
]