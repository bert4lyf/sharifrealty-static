# Admin Users & Credentials

## Default Login Credentials

### ⚠️ IMPORTANT: Change these passwords after first login!

---

## ADMIN Account
- **Email:** `sharifrealty19@gmail.com`
- **Password:** `Bebe&majs@96`
- **Role:** Admin
- **Dashboard:** `/admin/index.html`
- **Permissions:** Manage listings, agents, inquiries

---

## SUPER ADMIN Account
- **Email:** `cardonebert94@gmail.com`
- **Password:** `11391HdK`
- **Role:** Super Admin
- **Dashboard:** `/admin/super-admin.html`
- **Permissions:** Everything + User management, Settings

---

## Database Setup

These users are stored in the `admin_users` table:

```sql
SELECT * FROM admin_users;
```

Fields:
- `id` - UUID
- `email` - Email address (unique)
- `name` - Display name
- `role` - 'admin', 'super_admin', or 'editor'
- `active` - true/false (disable accounts without deleting)
- `created_at` - Account creation timestamp

---

## How to Add More Admin Users

### Via Super Admin Panel:
1. Login to `/admin/super-admin.html`
2. Go to "Admin Users" tab
3. Click "Add User"
4. Fill in name, email, role, active status
5. Click Save

### Via Supabase Console:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Authentication → Users → Add user (create auth account)
3. SQL Editor → Insert into admin_users table

---

## How to Change Password

### For Users:
1. Login to admin dashboard
2. Look for "Profile" or "Account Settings"
3. Change password

### Force Reset (Admin):
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Authentication → Users
3. Click user
4. Reset password or disable account

---

## Role Permissions

| Feature | Admin | Super Admin |
|---------|-------|-----------|
| View Dashboard | ✓ | ✓ |
| Manage Listings | ✓ | ✓ |
| Manage Agents | ✓ | ✓ |
| View Inquiries | ✓ | ✓ |
| Manage Admin Users | ✗ | ✓ |
| System Settings | ✗ | ✓ |
| User Management | ✗ | ✓ |

---

## Login Flow

```
1. User visits /admin/login.html
   ↓
2. Enter email & password
   ↓
3. Supabase Auth verifies credentials
   ↓
4. Check admin_users table for role & active status
   ↓
5. If active:
   - Admin → Redirect to /admin/index.html
   - Super Admin → Redirect to /admin/super-admin.html
   ↓
6. If inactive: Show error, sign out user
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Change default super admin password
- [ ] Disable test accounts after testing
- [ ] Enable HTTPS on production (auto with most hosts)
- [ ] Set strong, unique passwords
- [ ] Enable email verification in Supabase
- [ ] Set up password reset flow
- [ ] Keep Supabase API keys secure (don't share)
- [ ] Regularly audit admin users
- [ ] Remove inactive admin accounts

---

## Troubleshooting

### "User not found in system"
- User exists in Supabase Auth but not in admin_users table
- Solution: Add user to admin_users table via SQL

### "Account has been deactivated"
- User's `active` field is set to false
- Solution: Change `active` to true in admin_users table

### Login redirects to logout
- Session expired or auth error
- Solution: Try again or clear browser cache

### Can't access super-admin.html
- User role is not 'super_admin'
- Solution: Update user role in admin_users table

---

**Last Updated:** February 2026
**Status:** Ready for Production
