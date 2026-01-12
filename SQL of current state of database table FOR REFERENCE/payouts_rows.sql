INSERT INTO "public"."payouts" ("id", "realtor_id", "amount", "status", "bank_details", "created_at", "paid_at") VALUES ('1036d962-5795-4f38-b0e4-ab2bf6c99035', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '10000000', 'paid', '{"bankName":"United Bank for Africa","accountNo":"2036682892","accountName":"Oladunni Rotimi"}', '2026-01-03 12:02:26.419173+00', '2026-01-03 12:03:19.943+00'), ('1edce378-3b1a-45a8-a846-e4497f6b1932', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:44:36.799068+00', '2026-01-05 10:46:02.257+00'), ('469a3f88-899b-446d-a024-18bebbca11c7', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:33:32.262609+00', '2026-01-05 10:34:12.082+00'), ('4746e451-04cc-4ce9-8c05-44c42ddf33de', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:41:33.719999+00', '2026-01-05 10:46:06.006+00'), ('671b6dec-89a9-4801-be2c-98f43502ed7e', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:20:35.415222+00', '2026-01-05 10:21:35.014+00'), ('c2952ef7-288e-4c1b-9a5c-4b6b70a4600c', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:24:18.61639+00', '2026-01-05 10:25:03.832+00'), ('c51655a8-c8d1-4359-9d54-3544816e4336', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '20000000', 'paid', '{"bankName":"United Bank for Africa","accountNo":"2036682892","accountName":"Oladunni Rotimi"}', '2026-01-03 11:59:28.829752+00', '2026-01-03 12:02:01.671+00'), ('cae3fa2d-6146-402f-ae4f-854d0db22b24', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '10520000', 'pending', '{"bankName":"United Bank for Africa","accountNo":"2036682892","accountName":"Oladunni Rotimi"}', '2026-01-04 19:59:08.87374+00', null), ('eb6576a9-2ac0-49ee-8518-20a5fc8e18e4', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '5000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-05 10:12:19.212753+00', '2026-01-05 10:20:04.856+00'), ('f79d4eea-a779-40cc-b8f0-8d3c07d74b9d', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '20000', 'paid', '{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}', '2026-01-02 18:03:00.782445+00', '2026-01-02 18:07:44.845+00');


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



[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "payouts",
        "local_column": "realtor_id",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "payouts_realtor_id_fkey"
      }
    ]
  }
]