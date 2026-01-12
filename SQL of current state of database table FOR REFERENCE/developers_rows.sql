INSERT INTO "public"."developers" ("id", "name", "email", "phone", "status", "created_at") VALUES ('0f91b147-69d2-42d6-b413-f2e0ed30313a', 'Gbengus', 'olugbenga.rich@gmail.com', '08056484665', 'active', '2026-01-02 17:35:55.750065+00');


create table public.developers (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text null,
  phone text null,
  status text not null default 'active'::text,
  created_at timestamp with time zone not null default now(),
  constraint developers_pkey primary key (id),
  constraint developers_status_check check (
    (
      status = any (array['active'::text, 'inactive'::text])
    )
  )
) TABLESPACE pg_default;


[
  {
    "policy_name": "Admins can do everything with developers",
    "operation": "ALL",
    "applied_to": "{public}",
    "using_expression": "(( SELECT users.role\n   FROM users\n  WHERE (users.id = auth.uid())) = 'admin'::text)",
    "check_expression": null
  },
  {
    "policy_name": "Admin delete developers",
    "operation": "DELETE",
    "applied_to": "{public}",
    "using_expression": "is_admin()",
    "check_expression": null
  },
  {
    "policy_name": "Admin insert developers",
    "operation": "INSERT",
    "applied_to": "{public}",
    "using_expression": null,
    "check_expression": "is_admin()"
  },
  {
    "policy_name": "Admin select developers",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "is_admin()",
    "check_expression": null
  },
  {
    "policy_name": "Anyone can view developers",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "true",
    "check_expression": null
  },
  {
    "policy_name": "Admin update developers",
    "operation": "UPDATE",
    "applied_to": "{public}",
    "using_expression": "is_admin()",
    "check_expression": "is_admin()"
  }
]