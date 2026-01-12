INSERT INTO "public"."users" ("id", "first_name", "last_name", "email", "phone_number", "gender", "role", "referral_code", "referred_by", "bank_details", "id_document_url", "kyc_status", "created_at", "avatar_url") VALUES ('1dcf37f1-4b2f-428b-84a0-989797a42992', 'Rotimi', 'Oladunni', 'Oladunnirotimi13@gmail.com', '08034800622', 'male', 'admin', 'REF-1766489292090-ZXY347H', null, '[{"bankName":"Opay","accountNo":"8034800622","accountName":"Oladunni Rotimi "}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/1dcf37f1-4b2f-428b-84a0-989797a42992/id-1766652482639.jpg', 'approved', '2025-12-23 11:28:12.772637+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/1dcf37f1-4b2f-428b-84a0-989797a42992/avatar-1766502018535.png'), ('1fdbe14d-13af-4fab-ac1b-664a9d40150a', 'Johnson', 'Saliu', 'jasonsaliu@gmail.com', '09017474218', 'male', 'admin', 'REF-1767524720656-B3ATW55', null, null, null, 'pending', '2026-01-04 11:05:21.459373+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/1fdbe14d-13af-4fab-ac1b-664a9d40150a/avatar-1767524964747.jpeg'), ('3e5b64dc-902d-4a97-888d-ebc61b873fcc', 'Untomo', 'Dooku', 'maightoguy@gmail.com', '08087292952', 'male', 'admin', 'REF-1764874616811-ZP69MH6', null, '[{"bankName":"Opay","accountNo":"8087292952","accountName":"Saliu Richard Olugbenga"},{"bankName":"Access Bank","accountNo":"1515151615","accountName":"Ric"}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/3e5b64dc-902d-4a97-888d-ebc61b873fcc/passport-1764876637449.pdf', 'pending', '2025-12-04 18:56:57.448421+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/3e5b64dc-902d-4a97-888d-ebc61b873fcc/avatar-1767309932654-pc3zblfw07j.PNG'), ('4743d57e-789e-46c5-851d-22a8868507f2', 'Ludwig', 'Dreir', 'ludwigdreir@gmail.com', '090909090', 'male', 'realtor', 'REF-1767616436481-1SSRN52', 'f9e51c9a-3cd8-432c-9fd6-97ea76180494', null, 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/4743d57e-789e-46c5-851d-22a8868507f2/utility-1767616737799.pdf', 'approved', '2026-01-05 12:33:58.222144+00', null), ('79395876-c622-4d9f-bfe8-ae5482e94f39', 'Linda', 'Raji', 'ihuomalyndha@gmail.com', '08168569531', 'female', 'realtor', 'REF-1767443119097-54U95C2', null, null, null, 'pending', '2026-01-03 12:25:20.60088+00', null), ('957d85d4-77b2-40ee-b030-e565c1b1a5d2', 'Sarah', 'Ojugbeli', 'sarahojugbeli20@gmail.com', '09073429078', 'female', 'realtor', 'REF-1767552986405-734JAPJ', 'd781bcbe-ee0f-4950-84d9-d5ee56ef36ed', '[{"bankName":"GTBank","accountNo":"0225840424","accountName":"Ojugbeli Unoma Sarah "}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/957d85d4-77b2-40ee-b030-e565c1b1a5d2/utility-1767553823203.pdf', 'approved', '2026-01-04 18:56:26.942223+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/957d85d4-77b2-40ee-b030-e565c1b1a5d2/avatar-1767553668183.jpeg'), ('d781bcbe-ee0f-4950-84d9-d5ee56ef36ed', 'Rotimi', 'Oladunni', 'rhotex.exchange@gmail.com', '454545454545', 'male', 'realtor', 'REF-1767436542160-FCNKG8P', null, '[{"bankName":"United Bank for Africa","accountNo":"2036682892","accountName":"Oladunni Rotimi"}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/d781bcbe-ee0f-4950-84d9-d5ee56ef36ed/id-1767437781212.pdf', 'approved', '2026-01-03 10:35:45.251805+00', null), ('f9e51c9a-3cd8-432c-9fd6-97ea76180494', 'Richard', 'Saliu', 'olugbenga.rich@gmail.com', '09052580264', 'male', 'realtor', 'REF-1767374705467-FNGM04M', '3e5b64dc-902d-4a97-888d-ebc61b873fcc', '[{"bankName":"Union Bank","accountNo":"5468468468","accountName":"Richard Saliu"}]', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/kyc-documents/f9e51c9a-3cd8-432c-9fd6-97ea76180494/utility-1767376821160.PNG', 'approved', '2026-01-02 17:25:11.565915+00', 'https://yeebxvkrxygkfxrbinny.supabase.co/storage/v1/object/public/profile-avatars/f9e51c9a-3cd8-432c-9fd6-97ea76180494/avatar-1767374925114.png');


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


[
  {
    "users_table_foreign_keys": [
      {
        "local_table": "users",
        "local_column": "referred_by",
        "referenced_table": "users",
        "referenced_column": "id",
        "constraint_name": "users_referred_by_fkey"
      }
    ]
  }
]