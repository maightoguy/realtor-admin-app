INSERT INTO "public"."commissions" ("id", "realtor_id", "receipt_id", "amount", "status", "paid_on", "created_at", "commission_type", "downline_id") VALUES ('106b14ba-82fe-45f3-984a-77da0bfcec04', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '841180de-1818-46d6-82ce-9a6ca086b051', '40000000.000000000000', 'paid', '2026-01-03 12:01:55.893+00', '2026-01-03 11:56:52.981387+00', 'sale', null), ('32fa17db-bdbe-45c8-8932-a08a8c5fc8c8', '4743d57e-789e-46c5-851d-22a8868507f2', '764bf860-7789-4f7e-8529-db90155fc052', '100000.000000000000', 'paid', '2026-01-05 12:49:15.021+00', '2026-01-05 12:46:02.915162+00', 'sale', null), ('4bff1c29-be80-40f1-814f-dbed57271414', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'bb556fe2-d969-40e7-b856-1a2bd3c9a9af', '600.0000000000000000', 'paid', '2026-01-02 17:56:56.185+00', '2026-01-02 17:55:19.82747+00', 'referral', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494'), ('5b59a143-5fb7-4863-b256-1416a583e44e', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '190d4d27-bab1-4277-a81e-72df62665056', '20000.00000000000000', 'pending', null, '2026-01-05 10:56:03.043346+00', 'referral', '957d85d4-77b2-40ee-b030-e565c1b1a5d2'), ('5e5de2b6-18b0-4d92-9ff5-51b3c538895c', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', 'fea803c5-9b8f-46f9-b12b-ade386394229', '500000.000000000000', 'paid', '2026-01-04 19:26:33.346+00', '2026-01-04 19:26:09.690966+00', 'sale', null), ('7237af29-fad1-45dd-8b7b-041d20028b9f', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', 'bb556fe2-d969-40e7-b856-1a2bd3c9a9af', '30000.000000000000', 'paid', '2026-01-02 17:56:52.626+00', '2026-01-02 17:55:19.82747+00', 'sale', null), ('7576046c-64ee-4d2a-93e7-e9e835d46045', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '576c5d72-579d-4b9b-9081-8caa7cd0bffb', '2000.0000000000000000', 'rejected', null, '2026-01-05 12:41:29.831092+00', 'referral', '4743d57e-789e-46c5-851d-22a8868507f2'), ('77e218c2-98d4-4705-b823-6aa369bf00e7', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '764bf860-7789-4f7e-8529-db90155fc052', '2000.0000000000000000', 'paid', '2026-01-05 12:48:47.96+00', '2026-01-05 12:46:02.915162+00', 'referral', '4743d57e-789e-46c5-851d-22a8868507f2'), ('8997a1b5-8f4e-4816-9889-a9491d99757e', '957d85d4-77b2-40ee-b030-e565c1b1a5d2', '711995d7-3910-4a14-aaf6-690c5c937ac7', '1000000.000000000000', 'paid', '2026-01-04 19:38:18.582+00', '2026-01-04 19:37:21.11108+00', 'sale', null), ('b4f30ee7-2928-4928-bb05-e9f956426540', '4743d57e-789e-46c5-851d-22a8868507f2', '576c5d72-579d-4b9b-9081-8caa7cd0bffb', '100000.000000000000', 'rejected', null, '2026-01-05 12:41:29.831092+00', 'sale', null), ('baacde2d-0146-4843-881e-8bce203e15ea', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '6c7aeeb3-8264-4cf8-9c53-565982946d7e', '2000.0000000000000000', 'pending', null, '2026-01-05 12:06:17.016572+00', 'referral', null), ('bbdd709f-30cc-4456-a78d-d837ef077c6a', null, '6c7aeeb3-8264-4cf8-9c53-565982946d7e', '100000.000000000000', 'paid', '2026-01-05 12:19:35.06+00', '2026-01-05 12:06:17.016572+00', 'sale', null), ('f4a42137-d122-4ec7-adb7-bcedbac50155', '957d85d4-77b2-40ee-b030-e565c1b1a5d2', '190d4d27-bab1-4277-a81e-72df62665056', '1000000.000000000000', 'pending', null, '2026-01-05 10:56:03.043346+00', 'sale', null), ('feffba6f-c81f-44b2-b171-75105ffee796', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '711995d7-3910-4a14-aaf6-690c5c937ac7', '20000.00000000000000', 'paid', '2026-01-04 19:38:28.798+00', '2026-01-04 19:37:21.11108+00', 'referral', '957d85d4-77b2-40ee-b030-e565c1b1a5d2');


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



[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "commissions",
        "local_column": "downline_id",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "commissions_downline_id_fkey"
      },
      {
        "local_table": "commissions",
        "local_column": "realtor_id",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "commissions_realtor_id_fkey"
      },
      {
        "local_table": "commissions",
        "local_column": "receipt_id",
        "referenced_table": "receipts",
        "referenced_column": "id",
        "constraint_name": "commissions_receipt_id_fkey"
      }
    ]
  }
]