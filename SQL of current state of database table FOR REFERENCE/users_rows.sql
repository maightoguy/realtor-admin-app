INSERT INTO "public"."users" ("id", "first_name", "last_name", "email", "phone_number", "gender", "role", "referral_code", "referred_by", "bank_details", "id_document_url", "kyc_status", "created_at", "avatar_url") VALUES ('1dcf37f1-4b2f-428b-84a0-989797a42992', 'Rotimi', 'Oladunni', 'Oladunnirotimi13@gmail.com', '08034800622', 'male', 'admin', 'REF-1766489292090-ZXY347H', null, '[{"bankName":"Opay","accountNo":"8034800622","accountName":"Oladunni Rotimi "}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/1dcf37f1-4b2f-428b-84a0-989797a42992/id-1766652482639.jpg', 'approved', '2025-12-23 11:28:12.772637+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/1dcf37f1-4b2f-428b-84a0-989797a42992/avatar-1766502018535.png'), ('24d7bbc1-651a-4a57-9258-37eb26b18008', 'Onanuga', 'Adedeji', 'hardey1211@gmail.com', '07022222222', 'male', 'realtor', 'REF-1766501837511-8JP22WX', null, null, null, 'pending', '2025-12-23 14:57:17.769926+00', null), ('39e3e7d3-b89b-4c05-bc3f-034fa5e75938', 'Ludwig', 'Dreir', 'ludwigdreir@gmail.com', '6565656565', 'male', 'realtor', 'REF-1767220002287-9K2XRQF', '86edf3ca-7308-49c3-9f95-85aa228e4b1d', null, null, 'pending', '2025-12-31 22:26:44.260933+00', null), ('3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'Dooku', 'Goku', 'maightoguy@gmail.com', '08087292952', 'male', 'admin', 'REF-1764874616811-ZP69MH6', null, '[{"bankName":"Opay","accountNo":"8087292952","accountName":"Saliu Richard Olugbenga"},{"bankName":"Access Bank","accountNo":"1515151615","accountName":"Ric"}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/3e5b64dc-902d-4a97-888d-ebc61b873fcc/passport-1764876637449.pdf', 'pending', '2025-12-04 18:56:57.448421+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/3e5b64dc-902d-4a97-888d-ebc61b873fcc/avatar-1767059600058.PNG'), ('6d593a63-879a-4d40-9c84-489739ef74f5', 'Solution', 'Okonkwo', 'solutionchiagozie@gmail.com', '09159111599', 'male', 'realtor', 'REF-1766693753582-T9PMKUO', null, null, null, 'pending', '2025-12-25 20:15:54.35693+00', null), ('86edf3ca-7308-49c3-9f95-85aa228e4b1d', 'Richard', 'Saliu', 'olugbenga.rich@gmail.com', '08089946296', 'male', 'realtor', 'REF-1767219484669-V7HC4FL', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', null, null, 'pending', '2025-12-31 22:18:06.71774+00', null), ('d254c8d6-4223-4996-a333-6c16fd8c8d15', 'Rotimi', 'Rotimi', 'rhotex.exchange@gmail.com', '08136427580', 'male', 'realtor', 'REF-1767206724723-F6SU7WC', '24d7bbc1-651a-4a57-9258-37eb26b18008', null, null, 'pending', '2025-12-31 18:45:25.668757+00', null);


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

create trigger trg_notify_admin_kyc_pending
after INSERT on users for EACH row
execute FUNCTION notify_admin_kyc_pending ();

create trigger trg_notify_admin_user_row_deleted
after DELETE on users for EACH row
execute FUNCTION notify_admin_user_row_deleted ();

create trigger trg_notify_admin_user_row_scrubbed
after
update OF email on users for EACH row
execute FUNCTION notify_admin_user_row_scrubbed ();

create trigger trg_notify_user_welcome
after INSERT on users for EACH row
execute FUNCTION notify_user_welcome ();


[
  {
    "policy_name": "users_delete_admin_only",
    "operation": "DELETE",
    "applied_to": "{authenticated}",
    "using_expression": "is_admin()",
    "check_expression": null
  },
  {
    "policy_name": "users_insert_self",
    "operation": "INSERT",
    "applied_to": "{authenticated}",
    "using_expression": null,
    "check_expression": "(auth.uid() = id)"
  },
  {
    "policy_name": "Users can view own profile",
    "operation": "SELECT",
    "applied_to": "{public}",
    "using_expression": "(auth.uid() = id)",
    "check_expression": null
  },
  {
    "policy_name": "users_select_self_or_admin",
    "operation": "SELECT",
    "applied_to": "{authenticated}",
    "using_expression": "((id = auth.uid()) OR is_admin())",
    "check_expression": null
  },
  {
    "policy_name": "users_update_admin_only",
    "operation": "UPDATE",
    "applied_to": "{authenticated}",
    "using_expression": "is_admin()",
    "check_expression": "is_admin()"
  }
]