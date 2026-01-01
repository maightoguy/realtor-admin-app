INSERT INTO "public"."favorites" ("id", "user_id", "property_id", "created_at") VALUES ('19f249c6-834a-4fae-80f4-ad48f9257ecf', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'f6cdd2b7-d602-4724-8ad4-b92173a2f5cc', '2025-12-30 17:59:10.613432+00');


create table public.favorites (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  property_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint favorites_pkey primary key (id),
  constraint favorites_user_id_property_id_key unique (user_id, property_id),
  constraint favorites_property_id_fkey foreign KEY (property_id) references properties (id) on delete CASCADE,
  constraint favorites_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;


[
  {
    "policy_name": "Users can remove their own favorites",
    "operation": "DELETE",
    "applied_to": "{public}",
    "using_expression": "(auth.uid() = user_id)",
    "check_expression": null
  },
  {
    "policy_name": "Users can add favorites",
    "operation": "INSERT",
    "applied_to": "{public}",
    "using_expression": null,
    "check_expression": "(auth.uid() = user_id)"
  },
  {
    "policy_name": "Users can view their own favorites",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "(auth.uid() = user_id)",
    "check_expression": null
  }
]