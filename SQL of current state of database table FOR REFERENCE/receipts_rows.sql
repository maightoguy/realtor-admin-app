INSERT INTO "public"."receipts" ("id", "realtor_id", "client_name", "property_id", "amount_paid", "receipt_urls", "status", "created_at", "rejection_reason") VALUES ('ba2c2b5e-46f2-42df-b31d-352ebe0cfbfa', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'duke', 'dadddb9b-4377-4f9e-9b6d-7e4adb112989', '0', ARRAY["https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/receipt-uploads/3e5b64dc-902d-4a97-888d-ebc61b873fcc/1767222623758_yfjo3fw.pdf"], 'pending', '2025-12-31 23:10:27.563473+00', null), ('bb804441-76f1-4a03-8452-b502ae843384', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'Heidinburg', '31dee512-3e32-4ab4-8861-c14ce7d32dff', '600000', ARRAY["https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/receipt-uploads/3e5b64dc-902d-4a97-888d-ebc61b873fcc/1767178638487_aff5v1x.pdf"], 'approved', '2025-12-31 10:57:19.668154+00', null);


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

create trigger trg_create_commissions_on_receipt_approved
after INSERT
or
update OF status on receipts for EACH row
execute FUNCTION create_commissions_on_receipt_approved ();

create trigger trg_notify_admin_receipt_pending
after INSERT
or
update OF status on receipts for EACH row
execute FUNCTION notify_admin_receipt_pending ();

create trigger trg_notify_receipt_updates
after INSERT
or
update OF status on receipts for EACH row
execute FUNCTION notify_receipt_updates ();


[
  {
    "policy_name": "receipts_insert_realtor_own",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
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
    "policy_name": "receipts_select_realtor_own",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(realtor_id = auth.uid())",
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