# Database Setup Guide - Supabase (PostgreSQL)

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" or sign up
3. Sign in with GitHub or email
4. Create an account

## Step 2: Create a New Project
1. After signing in, click "New Project"
2. Choose a **project name**: `sharifrealty` (or any name you like)
3. Choose a **database password** (make it strong!) - **SAVE THIS**
4. Choose your **region** (pick closest to your users)
5. Click "Create new project"
6. Wait a few minutes for the database to be created

## Step 3: Get Your Project Keys
1. Once the project is ready, go to **Settings** (bottom left)
2. Click **"API"** in the settings
3. Copy these keys:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (this is the public anon key used by client calls)
   - **service_role** key (this is a secret key used for server-side admin actions)
4. **SAVE THESE KEYS** - You'll need them in Netlify (store service_role securely)

## Step 4: Create User Table (Optional - Supabase Auth Handles This)
Supabase's built-in auth table is already set up for you! You don't need to manually create anything.

## Step 5: Add to Netlify Environment Variables
1. Go to https://app.netlify.com
2. Open your site: `sharifrealty-static`
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Click "Edit variables"

5. Add these three variables (service_role key is required for server-side user creation):

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is powerful and should be kept secret. Add it only to Netlify environment variables (do NOT publish it in client code or commit it to the repo).

6. Click **Save & Deploy** - Netlify will automatically redeploy

## Step 6: Trigger Redeploy (if not automatic)
1. If it doesn't redeploy automatically:
   - Go to **Deploys** tab
   - Click the three dots on latest deploy
   - Select **Trigger deploy**
2. Wait for build to complete (1-2 minutes)

## That's It!
Your site now has a working PostgreSQL database with authentication. Users can now:
- **Sign up** with email and password
- **Log in** with their credentials  
- **Data is stored securely** in PostgreSQL
- **Passwords automatically encrypted** by Supabase

## Important Notes
- Supabase automatically handles password hashing and encryption
- Built-in RLS (Row Level Security) for advanced security
- Free tier supports unlimited users (up to 500MB storage)
- No credit card required for free tier
- Automatic daily backups included
- Can upgrade anytime if you need more space

## Testing
1. Go to https://sharifrealty-static.netlify.app/sign-in-2/
2. Try **registering** with a test email
3. Try **logging in** with the credentials you just created
4. Check **browser console** (F12) if you have any issues

## Viewing Your Users
1. Go to https://app.supabase.com
2. Open your project
3. Go to **Authentication** → **Users** in left sidebar
4. You'll see all registered users with their email and signup date

## Troubleshooting

### "Invalid API Key" error
- Check that you copied the keys correctly
- Make sure you're using the PUBLIC key, not the service role key
- Redeploy your site after adding variables

### "Connection timeout"
- Make sure SUPABASE_URL is copied correctly (should start with https://)
- Check that the project is running (go to supabase.com/projects)

### Users can register but can't login
- Check Netlify logs for errors
- Check Supabase project status
- Verify environment variables are correct

## Next Steps
- Test the forms
- Check Supabase dashboard to see users being created
- Optional: Add email verification or password reset
- Optional: Set up custom email templates

---

**Status**: Much simpler than MongoDB! Supabase handles password encryption and user management for you.

