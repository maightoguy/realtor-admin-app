INSERT INTO "public"."commissions" ("id", "realtor_id", "receipt_id", "amount", "status", "paid_on", "created_at", "commission_type", "downline_id") VALUES ('47421f21-df20-4c6c-bd96-82270e355f68', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'bb804441-76f1-4a03-8452-b502ae843384', '540000.000000000000', 'paid', '2025-12-31 16:40:43.192+00', '2025-12-31 10:58:33.073368+00', 'sale', null);


create table public.commissions (
  id uuid not null default extensions.uuid_generate_v4 (),
  realtor_id uuid null,
  receipt_id uuid null,
  amount numeric not null,
  status text null default 'pending'::text,
  paid_on timestamp with time zone null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  commission_type text not null default 'sale'::text,
  downline_id uuid null,
  constraint commissions_pkey primary key (id),
  constraint commissions_downline_id_fkey foreign KEY (downline_id) references users (id) on delete set null,
  constraint commissions_realtor_id_fkey foreign KEY (realtor_id) references users (id) on delete set null,
  constraint commissions_receipt_id_fkey foreign KEY (receipt_id) references receipts (id) on delete CASCADE,
  constraint commissions_commission_type_check check (
    (
      commission_type = any (array['sale'::text, 'referral'::text])
    )
  ),
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

create index IF not exists idx_commissions_commission_type on public.commissions using btree (commission_type) TABLESPACE pg_default;

create index IF not exists idx_commissions_downline_id on public.commissions using btree (downline_id) TABLESPACE pg_default;

create unique INDEX IF not exists uniq_sale_commission_per_receipt on public.commissions using btree (receipt_id) TABLESPACE pg_default
where
  (
    (receipt_id is not null)
    and (commission_type = 'sale'::text)
  );

create unique INDEX IF not exists uniq_referral_commission_per_receipt_upline on public.commissions using btree (receipt_id, realtor_id) TABLESPACE pg_default
where
  (
    (receipt_id is not null)
    and (commission_type = 'referral'::text)
  );

create trigger trg_notify_commission_updates
after
update OF status on commissions for EACH row
execute FUNCTION notify_commission_updates ();

create trigger trg_update_referrals_commission_earned_on_paid
after
update OF status on commissions for EACH row
execute FUNCTION update_referrals_commission_earned_on_referral_commission_paid ();



[
  {
    "policy_name": "Admins can manage all commissions",
    "operation": "ALL",
    "applied_to": "{authenticated}",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))",
    "check_expression": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))"
  },
  {
    "policy_name": "Realtors can view own commissions",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(auth.uid() = realtor_id)",
    "check_expression": null
  },
  {
    "policy_name": "Realtors view own commissions",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "(realtor_id = auth.uid())",
    "check_expression": null
  }
]