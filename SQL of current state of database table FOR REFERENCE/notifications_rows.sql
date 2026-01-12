INSERT INTO "public"."notifications" ("id", "user_id", "type", "message", "seen", "created_at", "title", "metadata", "target_role") VALUES ('f4761fd7-6f1d-4c32-ada0-e54dba1b62bc', '1dcf37f1-4b2f-428b-84a0-989797a42992', 'user_deletion', 'Ludwig Dreir (ludwigdreir@gmail.com) requested account deletion.', 'true', '2026-01-03 10:10:00.219442+00', 'Account deletion requested', '{"name":"Ludwig Dreir","email":"ludwigdreir@gmail.com","section":"Realtors","deleted_at":"2026-01-03T10:10:00.195Z","realtor_id":"0bbcb14d-256d-4a05-89be-5f4ffa5c1d45","target_role":"admin","deleted_user_id":"0bbcb14d-256d-4a05-89be-5f4ffa5c1d45"}', 'admin');


create table public.notifications (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  type text not null,
  message text not null,
  seen boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  title text null,
  metadata jsonb null default '{}'::jsonb,
  target_role text null,
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id on public.notifications using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id_target_role_seen_created_at on public.notifications using btree (user_id, target_role, seen, created_at) TABLESPACE pg_default;


[
  {
    "policy_name": "Users view own notifications",
    "operation": "ALL",
    "applied_to": "{public}",
    "using_expression": "(user_id = auth.uid())",
    "check_expression": "(user_id = auth.uid())"
  },
  {
    "policy_name": "Admins insert notifications",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
    "check_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))"
  },
  {
    "policy_name": "Admins read notifications",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))",
    "check_expression": null
  },
  {
    "policy_name": "Users read own notifications",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "(user_id = auth.uid())",
    "check_expression": null
  },
  {
    "policy_name": "Users update own notifications",
    "operation": "UPDATE",
    "applied_to": "{authenticated}",
    "using_expression": "(user_id = auth.uid())",
    "check_expression": "(user_id = auth.uid())"
  }
]



