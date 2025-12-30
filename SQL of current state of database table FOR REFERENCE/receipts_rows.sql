INSERT INTO "public"."receipts" ("id", "realtor_id", "client_name", "property_id", "amount_paid", "receipt_urls", "status", "created_at", "rejection_reason") VALUES ('469a1994-6b3d-4b75-922e-bf8ea37f6d69', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'Donwanchasm', null, '50000', ARRAY["https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/receipt-uploads/3e5b64dc-902d-4a97-888d-ebc61b873fcc/1766486020170_cf80lio.pdf"], 'approved', '2025-12-23 10:33:41.901246+00', null);

create table public.receipts (
  id uuid not null default extensions.uuid_generate_v4 (),
  realtor_id uuid null,
  client_name text not null,
  property_id uuid null,
  amount_paid numeric not null,
  receipt_urls text[] not null,
  status text null default 'pending'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  rejection_reason text null,
  constraint receipts_pkey primary key (id),
  constraint receipts_property_id_fkey foreign KEY (property_id) references properties (id) on delete set null,
  constraint receipts_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text,
          'under_review'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_receipts_realtor_id on public.receipts using btree (realtor_id) TABLESPACE pg_default;

create trigger trg_notify_receipt_updates
after INSERT
or
update OF status on receipts for EACH row
execute FUNCTION notify_receipt_updates ();





[
  {
    "policy_name": "Realtors can view/upload own receipts",
    "operation": "ALL",
    "applied_to": "{public}",
    "using_expression": "(realtor_id = auth.uid())",
    "check_expression": "(realtor_id = auth.uid())"
  },
  {
    "policy_name": "receipts_select_admin_all",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))",
    "check_expression": null
  },
  {
    "policy_name": "receipts_update_admin_all",
    "operation": "UPDATE",
    "applied_to": "{authenticated}",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))",
    "check_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))"
  }
]