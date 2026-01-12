INSERT INTO "public"."referrals" ("id", "upline_id", "downline_id", "level", "commission_earned", "created_at") VALUES ('1d9e5114-7cb4-4702-b5e7-fab017dca49a', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '4743d57e-789e-46c5-851d-22a8868507f2', '1', '2000.0000000000000000', '2026-01-05 12:34:46.982543+00'), ('1ee631c0-8458-46aa-97ae-bc47b1693275', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '1', '600.0000000000000000', '2026-01-02 17:25:33.64714+00'), ('26e29f17-115f-43b8-a2a5-9546fa43493f', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '957d85d4-77b2-40ee-b030-e565c1b1a5d2', '1', '20000.00000000000000', '2026-01-04 18:57:07.794391+00');


create table public.referrals (
  id uuid not null default extensions.uuid_generate_v4 (),
  upline_id uuid null,
  downline_id uuid null,
  level integer not null default 1,
  commission_earned numeric null default 0,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint referrals_pkey primary key (id),
  constraint referrals_downline_id_fkey foreign KEY (downline_id) references users (id) on delete CASCADE,
  constraint referrals_upline_id_fkey foreign KEY (upline_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_referrals_upline_id on public.referrals using btree (upline_id) TABLESPACE pg_default;

create trigger trg_notify_upline_on_referral
after INSERT on referrals for EACH row
execute FUNCTION notify_upline_on_referral ();


[
  {
    "policy_name": "Users can insert their own referral record",
    "operation": "INSERT",
    "applied_to": "{public}",
    "using_expression": null,
    "check_expression": "(auth.uid() = downline_id)"
  },
  {
    "policy_name": "referrals_insert_by_downline",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
    "check_expression": "((auth.uid() = downline_id) AND (upline_id <> downline_id))"
  },
  {
    "policy_name": "Realtors view own referrals",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "(upline_id = auth.uid())",
    "check_expression": null
  },
  {
    "policy_name": "Users can view their own referrals",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "((auth.uid() = upline_id) OR (auth.uid() = downline_id))",
    "check_expression": null
  },
  {
    "policy_name": "referrals_select_upline_or_downline",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "((auth.uid() = upline_id) OR (auth.uid() = downline_id))",
    "check_expression": null
  }
]


[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "referrals",
        "local_column": "downline_id",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "referrals_downline_id_fkey"
      },
      {
        "local_table": "referrals",
        "local_column": "upline_id",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "referrals_upline_id_fkey"
      }
    ]
  }
]