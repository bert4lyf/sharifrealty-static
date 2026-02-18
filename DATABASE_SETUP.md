# Database Setup Guide - MongoDB Atlas

## Step 1: Create MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and sign up with your email
3. Create an account

## Step 2: Create a Free Cluster
1. After signing in, click "Create a deployment"
2. Select **M0 (Free tier)** - it's completely free
3. Choose your cloud provider (AWS recommended)
4. Choose a region (pick closest to your users)
5. Click "Create Deployment" and wait a few minutes

## Step 3: Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add new database user"
3. Create a username (e.g., `sharealty_user`) and password (make it strong!)
4. Select "Autogenerate a secure password" for a strong password
5. Click "Add User"
6. **SAVE THIS PASSWORD - YOU'LL NEED IT**

## Step 4: Add Your IP Address
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (or add your specific IP)
4. Click "Confirm"

## Step 5: Get Your Connection String
1. Go back to "Database" (main page)
2. Click "Connect" on your cluster
3. Select "Drivers" → "Node.js"
4. Copy the connection string (it looks like `mongodb+srv://...`)
5. Replace `<username>` with your database user
6. Replace `<password>` with the password you saved
7. Replace the database name if needed (keep it as `sharifrealty` or change it)

## Step 6: Add to Netlify Environment Variables
1. Go to https://app.netlify.com
2. Open your site (sharifrealty-static)
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Click "Edit variables"
5. Add a new variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Paste your connection string from Step 5
6. Click "Save"

## Step 7: Trigger a Redeploy
1. Go back to your Netlify site dashboard
2. Go to **Deploys** tab
3. Click the three dots on the latest deploy and select **Trigger deploy**
4. Wait for it to complete (typically 1-2 minutes)

## That's It!
Your site now has a working database. Users can now:
- **Sign up** with email and password
- **Log in** with their credentials  
- **Data is stored** in MongoDB

## Important Notes
- MongoDB stores passwords encrypted with bcrypt
- Free tier supports up to 512MB of data (more than enough for user accounts)
- No credit card required for free tier
- Data is automatically backed up by MongoDB

## Testing
1. Go to https://sharifrealty-static.netlify.app/sign-in-2/
2. Try registering with a test email
3. Try logging in with the credentials you just created

If you have any issues, check:
- Netlify logs: Site settings → Build & deploy → Deploy log
- MongoDB for any errors in the cluster

