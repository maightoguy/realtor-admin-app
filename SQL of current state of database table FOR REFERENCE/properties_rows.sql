INSERT INTO "public"."properties" ("id", "title", "location", "price", "type", "description", "status", "images", "payment_plan", "contract_docs", "created_at", "developer_id", "category", "commission_percent", "land_size_sqm", "security", "accessibility", "topography") VALUES ('48af22c7-c01e-4108-b785-4782dce8ed24', 'Titans Tower', '10, Olaniyi Close, Itoki, Ogun State.', '500000000', 'housing', 'The home of the Titans.', 'available', ARRAY["3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766948658851-7vade5cgm16.PNG","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766948662555-jblwnehi9g.png","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766948671709-t8887gwkjbk.png"], null, ARRAY["deed of assignment","deed of sublease","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766948701136-kyfd9qlfpgk.pdf","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766948701920-j7171q2kuf.pdf"], '2025-12-28 19:05:07.795792+00', '80403476-9cac-432d-970f-f4cdef07cc62', 'Mixed-Use', '50.00', '50000', 'very secured', 'Yes', 'Mixed'), ('dadddb9b-4377-4f9e-9b6d-7e4adb112989', 'Shire', 'Worcestershire', '9000000000', 'land', 'Do you remember the Shire, Mr. Frodo? It''ll be spring soon. And the orchards will be in blossom. And the birds will be nesting in the hazel thicket. And they''ll be sowing the summer barley in the lower fields. And the first of the strawberries with cream... Do you remember the taste of strawberries?', 'available', ARRAY["3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963137413-ypr5mn5ug1t.png","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963141298-txubov8xz8g.png","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963146238-zco46kxvze.png","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963151591-adyodhh02mc.png","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963155679-fo4vz0i41i9.png"], null, ARRAY["Gezette","power of attorney","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963161607-tk5ga8ccudq.pdf","3e5b64dc-902d-4a97-888d-ebc61b873fcc/property-1766963162158-6w6a8nzpy4.pdf"], '2025-12-28 23:06:07.423971+00', 'a9a94378-ccdc-4384-b2cd-1a47025acdb6', 'Land', '50.00', '5000000', 'secured', 'Yes', 'Mixed');

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
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "Admin delete properties",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "is_admin()",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "Admin insert properties",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "is_admin()"
  },
  {
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "Admin update properties",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "is_admin()",
    "with_check": "is_admin()"
  },
  {
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "Authenticated users can view properties",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() IS NOT NULL)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "Public read properties",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "properties",
    "policyname": "admins can insert properties",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::text))))"
  }
]