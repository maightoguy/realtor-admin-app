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

create trigger trg_notify_admin_payout_pending
after INSERT
or
update OF status on payouts for EACH row
execute FUNCTION notify_admin_payout_pending ();

create trigger trg_notify_payout_updates
after INSERT
or
update OF status on payouts for EACH row
execute FUNCTION notify_payout_updates ();







[
  {
    "policy_name": "Admins can manage all payouts",
    "operation": "ALL",
    "applied_to": "{authenticated}",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))",
    "check_expression": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))"
  },
  {
    "policy_name": "Realtors can request payouts",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
    "check_expression": "((auth.uid() = realtor_id) AND ((status IS NULL) OR (status = 'pending'::text)) AND (paid_at IS NULL))"
  },
  {
    "policy_name": "Realtors can view own payouts",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(auth.uid() = realtor_id)",
    "check_expression": null
  }
]