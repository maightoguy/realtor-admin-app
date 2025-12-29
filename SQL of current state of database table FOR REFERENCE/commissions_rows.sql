INSERT INTO "public"."commissions" ("id", "realtor_id", "receipt_id", "amount", "status", "paid_on", "created_at") VALUES ('1531336c-39b9-4498-9b7f-f75e1255c471', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, '500000', 'approved', null, '2025-12-18 18:22:41.187628+00'), ('25235fce-a456-4e06-9aef-f040f219790b', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, '50000', 'approved', null, '2025-12-22 17:31:54.04531+00'), ('2973fa08-584e-4158-aa87-4d3d70ba6bce', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, '50000', 'approved', null, '2025-12-22 17:17:18.617757+00'), ('e452a2cf-d1d2-4d33-9658-f7f06a57b2c9', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, '50000', 'approved', null, '2025-12-22 17:32:30.912373+00'), ('ff6c1742-7f71-4ac6-8998-0333ac3fc7c5', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, '50000', 'pending', null, '2025-12-22 17:53:53.603222+00');

create table public.commissions (
  id uuid not null default extensions.uuid_generate_v4 (),
  realtor_id uuid null,
  receipt_id uuid null,
  amount numeric not null,
  status text null default 'pending'::text,
  paid_on timestamp with time zone null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint commissions_pkey primary key (id),
  constraint commissions_realtor_id_fkey foreign KEY (realtor_id) references users (id) on delete set null,
  constraint commissions_receipt_id_fkey foreign KEY (receipt_id) references receipts (id) on delete CASCADE,
  constraint commissions_status_check check (
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

create index IF not exists idx_commissions_realtor_id on public.commissions using btree (realtor_id) TABLESPACE pg_default;

create trigger trg_notify_commission_updates
after
update OF status on commissions for EACH row
execute FUNCTION notify_commission_updates ();