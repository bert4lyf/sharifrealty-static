-- Seed default admin users into the admin_users table
-- NOTE: You must create these users in Supabase Auth FIRST (see DEPLOYMENT_GUIDE.md)
-- Then run this SQL to add them to the admin_users table with their roles

-- ADMIN User
INSERT INTO admin_users (email, name, role, active, created_at)
VALUES (
  'sharifrealty19@gmail.com',
  'Admin User',
  'admin',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  active = true;

-- SUPER ADMIN User
INSERT INTO admin_users (email, name, role, active, created_at)
VALUES (
  'cardonebert94@gmail.com',
  'Super Admin',
  'super_admin',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  active = true;

-- Verify the users were created
SELECT id, email, name, role, active, created_at FROM admin_users ORDER BY created_at DESC;
