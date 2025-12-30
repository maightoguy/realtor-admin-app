INSERT INTO "public"."users" ("id", "first_name", "last_name", "email", "phone_number", "gender", "role", "referral_code", "referred_by", "bank_details", "id_document_url", "kyc_status", "created_at", "avatar_url") VALUES ('1dcf37f1-4b2f-428b-84a0-989797a42992', 'Rotimi', 'Oladunni', 'Oladunnirotimi13@gmail.com', '08034800622', 'male', 'realtor', 'REF-1766489292090-ZXY347H', null, '[{"bankName":"Opay","accountNo":"8034800622","accountName":"Oladunni Rotimi "}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/1dcf37f1-4b2f-428b-84a0-989797a42992/id-1766652482639.jpg', 'pending', '2025-12-23 11:28:12.772637+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/1dcf37f1-4b2f-428b-84a0-989797a42992/avatar-1766502018535.png'), ('24d7bbc1-651a-4a57-9258-37eb26b18008', 'Onanuga', 'Adedeji', 'hardey1211@gmail.com', '07022222222', 'male', 'realtor', 'REF-1766501837511-8JP22WX', null, null, null, 'pending', '2025-12-23 14:57:17.769926+00', null), ('3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'Don', 'Saliu', 'maightoguy@gmail.com', '08087292952', 'male', 'admin', 'REF-1764874616811-ZP69MH6', null, '[{"bankName":"Opay","accountNo":"8087292952","accountName":"Saliu Richard Olugbenga"}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/3e5b64dc-902d-4a97-888d-ebc61b873fcc/passport-1764876637449.pdf', 'pending', '2025-12-04 18:56:57.448421+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/3e5b64dc-902d-4a97-888d-ebc61b873fcc/avatar-1765628848383.PNG'), ('68436d36-2bd6-446c-9ca2-6c1411bd58f3', 'Richard', 'Saliu', 'olugbenga.rich@gmail.com', '09052580288', 'male', 'realtor', 'REF-1765641865368-CP4W4T0', null, null, 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/68436d36-2bd6-446c-9ca2-6c1411bd58f3/passport-1765642013683.pdf', 'pending', '2025-12-13 16:04:26.198375+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/68436d36-2bd6-446c-9ca2-6c1411bd58f3/avatar-1765642058932.png'), ('6d593a63-879a-4d40-9c84-489739ef74f5', 'Solution', 'Okonkwo', 'solutionchiagozie@gmail.com', '09159111599', 'male', 'realtor', 'REF-1766693753582-T9PMKUO', null, null, null, 'pending', '2025-12-25 20:15:54.35693+00', null), ('bd52d2a3-43cd-4d4e-a7d3-06a5075345cc', 'Ludwig', 'Dreir', 'ludwigdreir@gmail.com', '090909090909', 'male', 'realtor', 'REF-1766480490740-143PBW3', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, null, 'pending', '2025-12-23 09:01:30.945307+00', null), ('f793c5b9-f035-4a3c-9f64-cb75508c7538', 'john', 'doe', 'hdgehe@gmail.com', '08052868209', 'male', 'realtor', 'REF-1766501292821-J21O13S', null, null, null, 'pending', '2025-12-23 14:48:13.502451+00', null);

create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone_number text not null,
  gender text null,
  role text not null default 'realtor'::text,
  referral_code text not null default (extensions.uuid_generate_v4 ())::text,
  referred_by uuid null,
  bank_details jsonb null,
  id_document_url text null,
  kyc_status text null default 'pending'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  avatar_url text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_phone_number_key unique (phone_number),
  constraint users_referral_code_key unique (referral_code),
  constraint users_referred_by_fkey foreign KEY (referred_by) references users (id),
  constraint users_gender_check check (
    (
      gender = any (
        array['male'::text, 'female'::text, 'other'::text]
      )
    )
  ),
  constraint users_role_check check (
    (
      role = any (array['realtor'::text, 'admin'::text])
    )
  ),
  constraint users_kyc_status_check check (
    (
      kyc_status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_users_referral_code on public.users using btree (referral_code) TABLESPACE pg_default;

create trigger trg_notify_user_welcome
after INSERT on users for EACH row
execute FUNCTION notify_user_welcome ();




[
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Allow public signup",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = id)"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Users can view own profile",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "users_delete_admin_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "is_admin()",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "users_insert_self",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "users_select_self_or_admin",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "((id = auth.uid()) OR is_admin())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "users_update_admin_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "is_admin()",
    "with_check": "is_admin()"
  }
]