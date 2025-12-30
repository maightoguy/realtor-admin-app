INSERT INTO "public"."favorites" ("id", "user_id", "property_id", "created_at") VALUES ('6c4d54a7-3c5f-4081-8a79-ac163c0b8eb8', '68436d36-2bd6-446c-9ca2-6c1411bd58f3', 'dadddb9b-4377-4f9e-9b6d-7e4adb112989', '2025-12-29 11:07:34.03582+00');

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
    "schemaname": "public",
    "tablename": "favorites",
    "policyname": "Users can add favorites",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "favorites",
    "policyname": "Users can remove their own favorites",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "favorites",
    "policyname": "Users can view their own favorites",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  }
]