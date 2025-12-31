begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.referral_commission_rates (
  level integer primary key,
  percent numeric(5, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint referral_commission_rates_percent_check check ((percent >= (0)::numeric) and (percent <= (100)::numeric))
);

insert into public.referral_commission_rates (level, percent)
values (1, 5.00)
on conflict (level) do nothing;

alter table public.commissions
  add column if not exists commission_type text not null default 'sale',
  add column if not exists downline_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commissions_commission_type_check'
      and conrelid = 'public.commissions'::regclass
  ) then
    alter table public.commissions
      add constraint commissions_commission_type_check
      check (commission_type = any (array['sale'::text, 'referral'::text]));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commissions_downline_id_fkey'
      and conrelid = 'public.commissions'::regclass
  ) then
    alter table public.commissions
      add constraint commissions_downline_id_fkey
      foreign key (downline_id) references public.users (id) on delete set null;
  end if;
end
$$;

create index if not exists idx_commissions_commission_type on public.commissions using btree (commission_type);
create index if not exists idx_commissions_downline_id on public.commissions using btree (downline_id);

create unique index if not exists uniq_sale_commission_per_receipt
on public.commissions (receipt_id)
where receipt_id is not null and commission_type = 'sale';

create unique index if not exists uniq_referral_commission_per_receipt_upline
on public.commissions (receipt_id, realtor_id)
where receipt_id is not null and commission_type = 'referral';

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_seen boolean,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
  values (
    p_user_id,
    p_type,
    p_title,
    p_message,
    coalesce(p_seen, false),
    coalesce(p_metadata, '{}'::jsonb),
    nullif(coalesce(p_metadata->>'target_role', ''), '')
  );
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, boolean, jsonb) to authenticated;

create or replace function public.notify_admin_receipt_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'pending')
    or (tg_op = 'UPDATE' and new.status = 'pending' and new.status is distinct from old.status) then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'receipt_pending',
      'Receipt pending approval',
      concat('A receipt from ', coalesce(new.client_name, 'a client'), ' is pending review.'),
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Receipts',
        'receipt_id', new.id,
        'realtor_id', new.realtor_id,
        'status', new.status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

create or replace function public.notify_admin_payout_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'pending')
    or (tg_op = 'UPDATE' and new.status = 'pending' and new.status is distinct from old.status) then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'payout_pending',
      'Withdrawal pending approval',
      'A new withdrawal request is pending review.',
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Transactions',
        'payout_id', new.id,
        'realtor_id', new.realtor_id,
        'status', new.status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

create or replace function public.notify_admin_kyc_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'realtor' and new.kyc_status = 'pending' then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'kyc_pending',
      'KYC pending review',
      concat('New realtor ', trim(concat(coalesce(new.first_name, ''), ' ', coalesce(new.last_name, ''))), ' has pending KYC.'),
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'section', 'Realtors',
        'realtor_id', new.id,
        'kyc_status', new.kyc_status
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
  end if;

  return new;
end;
$$;

create or replace function public.notify_user_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, seen, metadata)
  values (
    new.id,
    'auth',
    'Welcome to Veriplot!',
    'Your account has been successfully created. Please complete your KYC.',
    false,
    '{}'::jsonb
  );
  return new;
end;
$$;

create or replace function public.notify_admin_user_deletion_requested()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_old_deleted_at text;
  v_new_deleted_at text;
  v_email text;
  v_name text;
begin
  v_old_deleted_at := coalesce(old.raw_user_meta_data->>'deleted_at', '');
  v_new_deleted_at := coalesce(new.raw_user_meta_data->>'deleted_at', '');

  if v_new_deleted_at = '' or v_new_deleted_at = v_old_deleted_at then
    return new;
  end if;

  select
    coalesce(u.email, new.email),
    nullif(trim(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))), '')
  into v_email, v_name
  from public.users u
  where u.id = new.id;

  insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
  select
    admin.id,
    'user_deletion',
    'Account deletion requested',
    concat(
      coalesce(v_name, 'A user'),
      case
        when v_email is not null and v_email <> '' then concat(' (', v_email, ')')
        else ''
      end,
      ' requested account deletion.'
    ),
    false,
    jsonb_build_object(
      'target_role', 'admin',
      'section', 'Realtors',
      'realtor_id', new.id,
      'deleted_user_id', new.id,
      'deleted_at', v_new_deleted_at,
      'email', v_email,
      'name', v_name
    ),
    'admin'
  from public.users admin
  where admin.role = 'admin';

  return new;
end;
$$;

create or replace function public.notify_admin_user_row_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(concat(coalesce(old.first_name, ''), ' ', coalesce(old.last_name, ''))), '');

  insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
  select
    admin.id,
    'user_deleted',
    'User removed',
    concat(
      coalesce(v_name, 'A user'),
      case
        when old.email is not null and old.email <> '' then concat(' (', old.email, ')')
        else ''
      end,
      ' was removed from the users table.'
    ),
    false,
    jsonb_build_object(
      'target_role', 'admin',
      'section', 'Realtors',
      'realtor_id', old.id,
      'deleted_user_id', old.id,
      'email', old.email,
      'name', v_name
    ),
    'admin'
  from public.users admin
  where admin.role = 'admin';

  return old;
end;
$$;

create or replace function public.notify_admin_user_row_scrubbed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_email text;
  v_new_email text;
begin
  v_old_email := coalesce(old.email, '');
  v_new_email := coalesce(new.email, '');

  if v_new_email = '' then
    return new;
  end if;

  if v_old_email like 'deleted+%@deleted.local' then
    return new;
  end if;

  if v_new_email not like 'deleted+%@deleted.local' then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
  select
    admin.id,
    'user_scrubbed',
    'User scrubbed',
    'A user record was scrubbed after a deletion request.',
    false,
    jsonb_build_object(
      'target_role', 'admin',
      'section', 'Realtors',
      'realtor_id', new.id,
      'deleted_user_id', new.id,
      'old_email', old.email,
      'new_email', new.email
    ),
    'admin'
  from public.users admin
  where admin.role = 'admin';

  return new;
end;
$$;

create or replace function public.notify_upline_on_referral()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.upline_id is not null then
    insert into public.notifications (user_id, type, title, message, seen, metadata)
    values (
      new.upline_id,
      'success',
      'New Referral!',
      'A new user has joined using your referral code.',
      false,
      jsonb_build_object('downline_id', new.downline_id)
    );
  end if;
  return new;
end;
$$;

create or replace function public.notify_receipt_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_type text;
  v_message text;
begin
  if new.realtor_id is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status is null or new.status = 'pending' then
      v_title := 'Receipt Submitted';
      v_type := 'info';
      v_message := concat('Your receipt for ', coalesce(new.client_name, 'a client'), ' has been submitted.');
    else
      v_title := 'Receipt Updated';
      v_type := 'info';
      v_message := concat('Your receipt status is now ', coalesce(new.status, 'updated'), '.');
    end if;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'approved' then
      v_title := 'Receipt Approved';
      v_type := 'success';
      v_message := concat('Your receipt for ', coalesce(new.client_name, 'a client'), ' has been approved.');
    elsif new.status = 'rejected' then
      v_title := 'Receipt Rejected';
      v_type := 'error';
      v_message := concat('Your receipt for ', coalesce(new.client_name, 'a client'), ' has been rejected.');
    elsif new.status = 'under_review' then
      v_title := 'Receipt Under Review';
      v_type := 'info';
      v_message := concat('Your receipt for ', coalesce(new.client_name, 'a client'), ' is under review.');
    else
      v_title := 'Receipt Updated';
      v_type := 'info';
      v_message := concat('Your receipt status is now ', coalesce(new.status, 'updated'), '.');
    end if;
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, seen, metadata)
  values (
    new.realtor_id,
    v_type,
    v_title,
    v_message,
    false,
    jsonb_build_object('receipt_id', new.id, 'status', new.status)
  );

  return new;
end;
$$;

create or replace function public.notify_payout_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_type text;
  v_message text;
begin
  if new.realtor_id is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    v_title := 'Withdrawal Requested';
    v_type := 'info';
    v_message := 'Your withdrawal request has been submitted.';
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'paid' then
      v_title := 'Withdrawal Paid';
      v_type := 'success';
      v_message := 'Your withdrawal has been marked as paid.';
    elsif new.status = 'rejected' then
      v_title := 'Withdrawal Rejected';
      v_type := 'error';
      v_message := 'Your withdrawal request has been rejected.';
    elsif new.status = 'approved' then
      v_title := 'Withdrawal Approved';
      v_type := 'success';
      v_message := 'Your withdrawal request has been approved.';
    else
      v_title := 'Withdrawal Updated';
      v_type := 'info';
      v_message := concat('Your withdrawal status is now ', coalesce(new.status, 'updated'), '.');
    end if;
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, seen, metadata)
  values (
    new.realtor_id,
    v_type,
    v_title,
    v_message,
    false,
    jsonb_build_object('payout_id', new.id, 'status', new.status)
  );

  return new;
end;
$$;

create or replace function public.notify_commission_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_type text;
  v_message text;
begin
  if new.realtor_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'approved' then
      v_title := 'Commission Approved';
      v_type := 'success';
      v_message := 'Your commission has been approved.';
    elsif new.status = 'paid' then
      v_title := 'Commission Paid';
      v_type := 'success';
      v_message := 'Your commission has been marked as paid.';
    elsif new.status = 'rejected' then
      v_title := 'Commission Rejected';
      v_type := 'error';
      v_message := 'Your commission has been rejected.';
    else
      v_title := 'Commission Updated';
      v_type := 'info';
      v_message := concat('Your commission status is now ', coalesce(new.status, 'updated'), '.');
    end if;
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, seen, metadata)
  values (
    new.realtor_id,
    v_type,
    v_title,
    v_message,
    false,
    jsonb_build_object(
      'commission_id', new.id,
      'status', new.status,
      'receipt_id', new.receipt_id,
      'commission_type', new.commission_type,
      'downline_id', new.downline_id
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_admin_receipt_pending on public.receipts;
create trigger trg_notify_admin_receipt_pending
after insert or update of status on public.receipts
for each row execute function public.notify_admin_receipt_pending();

drop trigger if exists trg_notify_receipt_updates on public.receipts;
create trigger trg_notify_receipt_updates
after insert or update of status on public.receipts
for each row execute function public.notify_receipt_updates();

drop trigger if exists trg_notify_commission_updates on public.commissions;
create trigger trg_notify_commission_updates
after update of status on public.commissions
for each row execute function public.notify_commission_updates();

drop trigger if exists trg_notify_admin_payout_pending on public.payouts;
create trigger trg_notify_admin_payout_pending
after insert or update of status on public.payouts
for each row execute function public.notify_admin_payout_pending();

drop trigger if exists trg_notify_payout_updates on public.payouts;
create trigger trg_notify_payout_updates
after insert or update of status on public.payouts
for each row execute function public.notify_payout_updates();

drop trigger if exists trg_notify_admin_kyc_pending on public.users;
create trigger trg_notify_admin_kyc_pending
after insert on public.users
for each row execute function public.notify_admin_kyc_pending();

drop trigger if exists trg_notify_user_welcome on public.users;
create trigger trg_notify_user_welcome
after insert on public.users
for each row execute function public.notify_user_welcome();

drop trigger if exists trg_notify_admin_user_deletion_requested on auth.users;
create trigger trg_notify_admin_user_deletion_requested
after update of raw_user_meta_data on auth.users
for each row execute function public.notify_admin_user_deletion_requested();

drop trigger if exists trg_notify_admin_user_row_deleted on public.users;
create trigger trg_notify_admin_user_row_deleted
after delete on public.users
for each row execute function public.notify_admin_user_row_deleted();

drop trigger if exists trg_notify_admin_user_row_scrubbed on public.users;
create trigger trg_notify_admin_user_row_scrubbed
after update of email on public.users
for each row execute function public.notify_admin_user_row_scrubbed();

drop trigger if exists trg_notify_upline_on_referral on public.referrals;
create trigger trg_notify_upline_on_referral
after insert on public.referrals
for each row execute function public.notify_upline_on_referral();

create or replace function public.create_commissions_on_receipt_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_commission_percent numeric;
  v_property_price numeric;
  v_base_amount numeric;
  v_sale_commission_amount numeric;
  v_upline_id uuid;
  v_ref_percent numeric;
  v_ref_amount numeric;
begin
  if not (
    (tg_op = 'INSERT' and new.status = 'approved')
    or
    (tg_op = 'UPDATE' and new.status = 'approved' and new.status is distinct from old.status)
  ) then
    return new;
  end if;

  if new.realtor_id is null then
    return new;
  end if;

  if new.property_id is null then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'warning',
      'Commission not generated',
      'Receipt was approved but has no property attached.',
      false,
      jsonb_build_object('target_role', 'admin', 'receipt_id', new.id, 'realtor_id', new.realtor_id),
      'admin'
    from public.users u
    where u.role = 'admin';
    return new;
  end if;

  select p.commission_percent, p.price
  into v_commission_percent, v_property_price
  from public.properties p
  where p.id = new.property_id;

  if v_commission_percent is null or v_commission_percent <= 0 or v_property_price is null or v_property_price <= 0 then
    insert into public.notifications (user_id, type, title, message, seen, metadata, target_role)
    select
      u.id,
      'warning',
      'Commission not generated',
      'Receipt was approved but property commission_percent/price is missing.',
      false,
      jsonb_build_object(
        'target_role', 'admin',
        'receipt_id', new.id,
        'property_id', new.property_id,
        'realtor_id', new.realtor_id
      ),
      'admin'
    from public.users u
    where u.role = 'admin';
    return new;
  end if;

  v_base_amount := nullif(coalesce(new.amount_paid, 0), 0);
  if v_base_amount is null then
    v_base_amount := v_property_price;
  end if;

  v_sale_commission_amount := (v_base_amount * v_commission_percent) / 100;

  insert into public.commissions (realtor_id, receipt_id, amount, status, commission_type, downline_id)
  values (new.realtor_id, new.id, v_sale_commission_amount, 'pending', 'sale', null)
  on conflict do nothing;

  select u.referred_by into v_upline_id
  from public.users u
  where u.id = new.realtor_id;

  if v_upline_id is null or v_upline_id = new.realtor_id then
    return new;
  end if;

  select r.percent into v_ref_percent
  from public.referral_commission_rates r
  where r.level = 1;

  v_ref_percent := coalesce(v_ref_percent, 0);
  if v_ref_percent <= 0 then
    return new;
  end if;

  v_ref_amount := (v_sale_commission_amount * v_ref_percent) / 100;
  if v_ref_amount <= 0 then
    return new;
  end if;

  insert into public.commissions (realtor_id, receipt_id, amount, status, commission_type, downline_id)
  values (v_upline_id, new.id, v_ref_amount, 'pending', 'referral', new.realtor_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists trg_create_commissions_on_receipt_approved on public.receipts;
create trigger trg_create_commissions_on_receipt_approved
after insert or update of status on public.receipts
for each row execute function public.create_commissions_on_receipt_approved();

create or replace function public.update_referrals_commission_earned_on_referral_commission_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    return new;
  end if;

  if new.status <> 'paid' then
    return new;
  end if;

  if new.commission_type <> 'referral' then
    return new;
  end if;

  if new.downline_id is null then
    return new;
  end if;

  update public.referrals
  set commission_earned = coalesce(commission_earned, 0) + coalesce(new.amount, 0)
  where upline_id = new.realtor_id
    and downline_id = new.downline_id;

  return new;
end;
$$;

drop trigger if exists trg_update_referrals_commission_earned_on_paid on public.commissions;
create trigger trg_update_referrals_commission_earned_on_paid
after update of status on public.commissions
for each row execute function public.update_referrals_commission_earned_on_referral_commission_paid();

commit;
