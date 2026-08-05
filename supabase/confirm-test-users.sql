-- KCS Opportunity Program - confirm local test users
-- Run this after creating the users through Supabase Auth signup.
-- It marks the two test accounts as confirmed and stores their role metadata.

update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at = coalesce(confirmed_at, now()),
  raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'role',
      case
        when email = 'student.test@kcs.app' then 'student'
        when email = 'admin.test@kcs.app' then 'admin'
      end,
      'full_name',
      case
        when email = 'student.test@kcs.app' then 'Grace Mbuyi Test'
        when email = 'admin.test@kcs.app' then 'KCS Admin Test'
      end
    )
where email in ('student.test@kcs.app', 'admin.test@kcs.app');

select
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data ->> 'role' as role,
  raw_user_meta_data ->> 'full_name' as full_name
from auth.users
where email in ('student.test@kcs.app', 'admin.test@kcs.app')
order by email;
