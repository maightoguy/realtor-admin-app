INSERT INTO "public"."referrals" ("id", "upline_id", "downline_id", "level", "commission_earned", "created_at") VALUES ('619efd20-3791-404a-9877-7f4aa0d34248', '86edf3ca-7308-49c3-9f95-85aa228e4b1d', '39e3e7d3-b89b-4c05-bc3f-034fa5e75938', '1', '0', '2025-12-31 22:27:19.170728+00'), ('69120051-6ccc-4fb3-8993-21f59e67f4d8', '24d7bbc1-651a-4a57-9258-37eb26b18008', 'd254c8d6-4223-4996-a333-6c16fd8c8d15', '1', '0', '2025-12-31 18:46:27.738921+00'), ('a79168ec-a037-4d74-9f8f-fbaeb61e92f6', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', '86edf3ca-7308-49c3-9f95-85aa228e4b1d', '1', '0', '2025-12-31 22:18:31.397909+00'), ('eb363041-55e3-436a-936a-ea174980f098', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', '86edf3ca-7308-49c3-9f95-85aa228e4b1d', '1', '0', '2025-12-31 22:18:31.37802+00');


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