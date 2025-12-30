INSERT INTO "public"."developers" ("id", "name", "email", "phone", "status", "created_at") VALUES ('80403476-9cac-432d-970f-f4cdef07cc62', 'Bruce', 'batman@gmail.com', '545454545', 'active', '2025-12-28 10:10:30.471373+00'), ('a9a94378-ccdc-4384-b2cd-1a47025acdb6', 'Richard Saliu Olugbenga', 'maightoguy@gmail.com', '09052580288', 'active', '2025-12-27 13:11:16.846432+00');

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
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Admin delete developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "is_admin()",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Admin insert developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "is_admin()"
  },
  {
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Admin select developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "is_admin()",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Admin update developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "is_admin()",
    "with_check": "is_admin()"
  },
  {
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Admins can do everything with developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(( SELECT users.role\n   FROM users\n  WHERE (users.id = auth.uid())) = 'admin'::text)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "developers",
    "policyname": "Anyone can view developers",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  }
]