INSERT INTO "public"."referral_commission_rates" ("level", "percent", "created_at") VALUES ('1', '2.00', '2025-12-31 10:51:25.637733+00');


create table public.referral_commission_rates (
  level integer not null,
  percent numeric(5, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint referral_commission_rates_pkey primary key (level),
  constraint referral_commission_rates_percent_check check (
    (
      (percent >= (0)::numeric)
      and (percent <= (100)::numeric)
    )
  )
) TABLESPACE pg_default;


