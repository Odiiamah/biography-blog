/*
  # Create Admin User

  Creates the initial admin user for the BiographyHub admin panel
  using Supabase's auth schema directly. The user is created with
  email/password authentication and email confirmed.

  - Email: admin@biography.com
  - This inserts a confirmed user into auth.users
*/

DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
  existing_uid uuid;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = 'admin@biography.com' LIMIT 1;

  IF existing_uid IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@biography.com',
      crypt('SecureAdmin123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Admin"}',
      false,
      'authenticated',
      'authenticated'
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      'admin@biography.com',
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@biography.com'),
      'email',
      now(),
      now(),
      now()
    );

    INSERT INTO admin_profiles (id, email, display_name)
    VALUES (admin_uid, 'admin@biography.com', 'Administrator');
  END IF;
END $$;
