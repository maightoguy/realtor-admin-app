INSERT INTO "public"."favorites" ("id", "user_id", "property_id", "created_at") VALUES ('36047fe1-3976-437b-a10d-74f55f87e3f9', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', '700dcefe-b03e-4b09-9f2a-6a525610b94e', '2026-01-02 17:41:29.947824+00');


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



[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "favorites",
        "local_column": "property_id",
        "referenced_table": "properties",
        "referenced_column": "id",
        "constraint_name": "favorites_property_id_fkey"
      }
    ]
  }
]