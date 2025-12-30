INSERT INTO "public"."referrals" ("id", "upline_id", "downline_id", "level", "commission_earned", "created_at") VALUES ('5c7da931-86ff-4b6a-9fd6-561af64c1fe8', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'bd52d2a3-43cd-4d4e-a7d3-06a5075345cc', '1', '0', '2025-12-23 09:01:47.292995+00');

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