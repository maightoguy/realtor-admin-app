INSERT INTO "public"."properties" ("id", "title", "location", "price", "type", "description", "status", "images", "payment_plan", "contract_docs", "created_at", "developer_id", "category", "commission_percent", "land_size_sqm", "security", "accessibility", "topography") VALUES ('700dcefe-b03e-4b09-9f2a-6a525610b94e', 'Office Complex', '15, Asunju, near ojodu secratariat, Berger', '600000', 'housing', 'This office complex promises an environment that promotes productivity and profitability. ', 'available', ARRAY["3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1767375572937-a7e3waqeb9j.jpg","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1767375575521-1fqq0khxtji.jpg","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1767375577197-1gvt6juc5sb.jpg","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1767375579649-u83evvmeeks.jpg"], null, ARRAY["deed of assignment","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1767375582576-78s3awm8jpi.pdf"], '2026-01-02 17:39:47.22092+00', '0f91b147-69d2-42d6-b413-f2e0ed30313a', 'Commercial', '5.00', null, 'very secured', 'Yes', 'Mixed'), ('80956dc2-42fa-44e0-bd9a-25f3ed52a32d', 'Assert land', 'Ikeji arakeji, Osun state', '1000000', 'land', 'This is a trial for the property ', 'available', ARRAY["1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088178070-pkdpp1t7owo.jpg","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088178982-s33irmw522.jpg","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088179733-r4enkxogd3.jpg","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088180317-l5ftqbo02vl.jpg","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088180917-vljebc8m1p.jpg","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088181486-ht1ju5ejtcv.jpg"], null, ARRAY["Certificate of Occupancy","Excision","survey plan","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088182342-108ivyxkebof.pdf","1dcf37f1-4b2f-428b-84a0-989797a42992/property-1767088182877-zxrv1tw2gbr.pdf"], '2025-12-30 09:49:44.382416+00', null, 'Land', '10.00', '1000', 'very secured', 'Yes', 'Dryland');


create table public.properties (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  location text not null,
  price numeric not null,
  type text not null,
  description text null,
  status text null default 'available'::text,
  images text[] null,
  payment_plan jsonb null,
  contract_docs text[] null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  developer_id uuid null,
  category text null,
  commission_percent numeric(5, 2) null,
  land_size_sqm numeric null,
  security text null,
  accessibility text null,
  topography text null,
  constraint properties_pkey primary key (id),
  constraint properties_developer_id_fkey foreign KEY (developer_id) references developers (id) on delete set null,
  constraint properties_land_size_sqm_check check (
    (
      (land_size_sqm is null)
      or (land_size_sqm >= (0)::numeric)
    )
  ),
  constraint properties_security_check check (
    (
      (security is null)
      or (
        security = any (
          array[
            'very secured'::text,
            'secured'::text,
            'moderate'::text
          ]
        )
      )
    )
  ),
  constraint properties_status_check check (
    (
      status = any (
        array['available'::text, 'sold'::text, 'pending'::text]
      )
    )
  ),
  constraint properties_topography_check check (
    (
      (topography is null)
      or (
        topography = any (
          array['Wetland'::text, 'Dryland'::text, 'Mixed'::text]
        )
      )
    )
  ),
  constraint properties_accessibility_check check (
    (
      (accessibility is null)
      or (
        accessibility = any (array['Yes'::text, 'No'::text])
      )
    )
  ),
  constraint properties_type_check check (
    (type = any (array['land'::text, 'housing'::text]))
  ),
  constraint properties_commission_percent_check check (
    (
      (commission_percent is null)
      or (
        (commission_percent >= (0)::numeric)
        and (commission_percent <= (100)::numeric)
      )
    )
  )
) TABLESPACE pg_default;


[
  {
    "policy_name": "Admin delete properties",
    "operation": "DELETE",
    "applied_to": "{public}",
    "using_expression": "is_admin()",
    "check_expression": null
  },
  {
    "policy_name": "Admin insert properties",
    "operation": "INSERT",
    "applied_to": "{public}",
    "using_expression": null,
    "check_expression": "is_admin()"
  },
  {
    "policy_name": "admins can insert properties",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
    "check_expression": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))"
  },
  {
    "policy_name": "Authenticated users can view properties",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "(auth.uid() IS NOT NULL)",
    "check_expression": null
  },
  {
    "policy_name": "Public read properties",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "true",
    "check_expression": null
  },
  {
    "policy_name": "Admin update properties",
    "operation": "UPDATE",
    "applied_to": "{public}",
    "using_expression": "is_admin()",
    "check_expression": "is_admin()"
  }
]



[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "properties",
        "local_column": "developer_id",
        "referenced_table": "developers",
        "referenced_column": "id",
        "constraint_name": "properties_developer_id_fkey"
      }
    ]
  }
]