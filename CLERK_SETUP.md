# Clerk Authentication Setup Guide

Clerk is a modern authentication platform that replaces Supabase Auth. It handles all the complexity of user authentication, password resets, social login, and more.

---

## Step 1: Create Clerk Account

1. Go to **https://dashboard.clerk.com**
2. Click **"Sign Up"** (if you don't have an account)
3. Complete the signup process
4. Verify your email

---

## Step 2: Create Your Application

1. In Clerk Dashboard, click **"Create Application"**
2. **Application Name:** `Sharif Realty Admin`
3. Choose authentication methods:
   - ✅ Email/Password (enable this)
   - Optional: Social login (Google, GitHub, etc.)
4. Click **"Create Application"**

---

## Step 3: Get Your API Keys

### In Clerk Dashboard:
1. Go to your application
2. Click **"API Keys"** (left sidebar under "Credentials")
3. Copy:
   - **Publishable Key** - (starts with `pk_` for development or `pk_live_` for production)
   - **Secret Key** - (starts with `sk_`) - Keep this private!

### Note: We only need the Publishable Key for the frontend

---

## Step 4: Update Your Code

Replace `YOUR_CLERK_PUBLISHABLE_KEY_HERE` in these 3 files:

### File 1: `/admin/login-clerk.html`
```html
<script 
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_YOUR_KEY_HERE"
    src="https://cdn.clerk.com/clerk.js"
></script>
```

### File 2: `/admin/index.html`
```html
<script 
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_YOUR_KEY_HERE"
    src="https://cdn.clerk.com/clerk.js"
></script>
```

### File 3: `/admin/super-admin.html`
```html
<script 
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_YOUR_KEY_HERE"
    src="https://cdn.clerk.com/clerk.js"
></script>
```

Replace `pk_test_YOUR_KEY_HERE` with your actual Publishable Key from Step 3.

---

## Step 5: Create Admin Users in Clerk

Now you need to create the two admin accounts in Clerk.

### In Clerk Dashboard:
1. Go to **Users** (left sidebar)
2. Click **"Create new user"** or **"Invite"**

### Create Admin User:
- **Email:** `sharifrealty19@gmail.com`
- **Password:** `Bebe&majs@96`
- Click **Create User**

### Create Super Admin User:
- **Email:** `cardonebert94@gmail.com`
- **Password:** `11391HdK`
- Click **Create User**

---

## Step 6: Add Users to Database

### In Supabase:
1. Go to **SQL Editor**
2. Run this:

```sql
INSERT INTO admin_users (email, name, role, active, created_at)
VALUES 
  ('sharifrealty19@gmail.com', 'Admin User', 'admin', true, NOW()),
  ('cardonebert94@gmail.com', 'Super Admin', 'super_admin', true, NOW())
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  active = true;
```

This links Clerk users to your database with their roles.

---

## Step 7: Test Login

1. Go to **http://localhost/admin/login-clerk.html** (or your domain)
2. Click the **"Sign In"** button
3. Enter credentials:
   - Email: `sharifrealty19@gmail.com`
   - Password: `Bebe&majs@96`
4. **Should redirect to `/admin/index.html`** ✅

Test Super Admin:
1. Go back to login
2. Enter:
   - Email: `cardonebert94@gmail.com`
   - Password: `11391HdK`
3. **Should redirect to `/admin/super-admin.html`** ✅

---

## How It Works

```
1. User visits /admin/login-clerk.html
   ↓
2. Clerk sign-in component appears
   ↓
3. User enters email/password
   ↓
4. Clerk verifies credentials
   ↓
5. If valid, Clerk sets session & calls redirect handler
   ↓
6. Our code checks database for role & active status
   ↓
7. If super_admin → /admin/super-admin.html
   If admin → /admin/index.html
   If inactive → Show error
```

---

## Architecture

```
┌─────────────────────────────────────┐
│   Clerk (Authentication)            │
│   - Email/Password login            │
│   - User management                 │
│   - Sessions & tokens               │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   Supabase (Database & API)         │
│   - admin_users table (roles)       │
│   - listings table                  │
│   - agents table                    │
│   - inquiries table                 │
└─────────────────────────────────────┘
```

**Clerk handles auth. Supabase handles data. Perfect separation!**

---

## Features with Clerk

✅ **Email/Password Authentication**
✅ **Password Reset** (automatic emails)
✅ **User Management** (Clerk dashboard)
✅ **Session Management** (automatic)
✅ **Social Login** (optional: Google, GitHub, etc.)
✅ **Two-Factor Authentication** (2FA)
✅ **Account Recovery**
✅ **Email Verification**

---

## Changing Passwords

### For Admin:
1. Login with that account
2. In Clerk Dashboard → Users → Select user → Edit password

### For Users:
1. They can click "Forgot Password" on login page
2. Clerk sends password reset email automatically

---

## Adding More Admin Users

### Option 1: Via Clerk Dashboard
1. Go to **Users**
2. Click **"Create new user"**
3. Enter email and password
4. Click **Create**

### Option 2: Via Super Admin Panel
1. Login to `/admin/super-admin.html`
2. Go to **Admin Users** tab
3. Click **"Add User"**
4. Fill in email and role
5. **But**: They must also be created in Clerk first!

**Important**: Users must exist in BOTH Clerk AND the admin_users database table.

---

## Environment Variables (Production)

For production deployments, use environment variables:

```bash
# .env or environment setup
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
```

Then reference it in your code:
```html
<script data-clerk-publishable-key="${process.env.CLERK_PUBLISHABLE_KEY}"></script>
```

---

## Troubleshooting

### "Invalid credentials" on login
- **Reason**: User doesn't exist in Clerk
- **Solution**: Create user in Clerk Dashboard → Users → Create new user

### "User not found in system"
- **Reason**: User exists in Clerk but not in admin_users table
- **Solution**: Run SQL insert (see Step 6)

### "Account is inactive"
- **Reason**: User's `active` field is `false` in Supabase
- **Solution**: Update: `UPDATE admin_users SET active = true WHERE email = '...'`

### Clerk component doesn't appear
- **Reason**: Publishable key might be wrong or not set
- **Solution**: Check browser console (F12) for errors
- **Fix**: Verify key matches Clerk dashboard exactly

### Redirect loop (keeps going to login)
- **Reason**: Clerk session not persisting
- **Solution**: Clear cookies, try incognito mode

---

## Pricing

**Clerk has a generous free tier:**
- ✅ Unlimited sign-ups
- ✅ Up to 5,000 active users per month
- ✅ All auth methods
- ✅ Paid plans start at $25/month for higher volumes

---

## Security Best Practices

1. ✅ Keep Publishable Key in code (it's public)
2. ✅ Keep Secret Key private (never commit to GitHub)
3. ✅ Use HTTPS in production (auto with most hosts)
4. ✅ Enable Email Verification in Clerk settings
5. ✅ Enable Password Requirements
6. ✅ Monitor active users in Clerk dashboard

---

## Next Steps

1. ✅ Create Clerk account
2. ✅ Create application in Clerk
3. ✅ Get Publishable Key
4. ✅ Update 3 files with key
5. ✅ Create users in Clerk
6. ✅ Add users to Supabase admin_users table
7. ✅ Test login
8. ✅ Deploy to production

---

**Documentation:** https://clerk.com/docs  
**Support:** https://support.clerk.com

Last Updated: February 2026
