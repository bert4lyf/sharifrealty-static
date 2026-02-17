# Sharif Realty - Static Site + Supabase Deployment Guide

## Architecture Overview

```
Frontend: Static HTML Files (hosted on shared hosting)
├─ index.html
├─ listings/
├─ agents/
├─ properties/
└─ [all static pages]

Backend: Supabase (PostgreSQL + REST API)
├─ Database (PostgreSQL)
├─ Auth (users for admin panel)
├─ REST API (CRUD operations)
└─ Real-time capabilities

Admin Dashboard: JavaScript + HTML (separate application)
├─ User management
├─ Listings management
├─ Database management
└─ Content updates
```

---

## Step 1: Set Up Supabase (Free)

### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start Your Project"** → Sign up
3. Create new project:
   - **Project name:** sharif-realty
   - **Database password:** Generate strong password
   - **Region:** (choose closest to your users)
4. Wait for project to initialize (~2 min)

### 1.2 Get Your Credentials
From Supabase Dashboard:
- **Project URL:** `https://[YOUR-PROJECT-ID].supabase.co`
- **API Key (anon):** Found under Settings → API
- **Database password:** You set this above

Save these - you'll need them for the frontend!

---

## Step 2: Create Database Tables

### 2.1 In Supabase Dashboard
Go to **SQL Editor** and run this:

```sql
-- Listings Table
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15, 2),
  location VARCHAR(255),
  beds INT,
  baths INT,
  sqft INT,
  image_url VARCHAR(500),
  status VARCHAR(50),
  category VARCHAR(50),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents Table
CREATE TABLE agents (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  bio TEXT,
  image_url VARCHAR(500),
  specialty VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries Table (for contact forms)
CREATE TABLE inquiries (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  listing_id BIGINT REFERENCES listings(id),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Make tables PUBLIC for static site to read
CREATE POLICY "Enable read access for all users" 
ON listings FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" 
ON agents FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" 
ON inquiries FOR SELECT USING (true);
```

---

## Step 2B: Create Default Admin Users

### 2B.1 Create Users in Supabase Auth
You need to create the actual authentication users first. Go to **Supabase Dashboard** → **Authentication** → **Users**

Click **"Add user"** and create these two users:

**ADMIN User:**
- Email: `sharifrealty19@gmail.com`
- Password: `Bebe&majs@96`

**SUPER ADMIN User:**
- Email: `cardonebert94@gmail.com`
- Password: `11391HdK`

### 2B.2 Add Users to admin_users Table
After creating the Auth users, go to **SQL Editor** and run this:

```sql
-- Seed default admin users
INSERT INTO admin_users (email, name, role, active, created_at)
VALUES (
  'sharifrealty19@gmail.com',
  'Admin User',
  'admin',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET role = 'admin', active = true;

INSERT INTO admin_users (email, name, role, active, created_at)
VALUES (
  'cardonebert94@gmail.com',
  'Super Admin',
  'super_admin',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', active = true;
```

Or upload the file `SEED_ADMIN_USERS.sql` and run it.

---

## Step 3: Update Your HTML to Use Supabase

### 3.1 Add Supabase Client to index.html

Add this to the `<head>` section of your index.html:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  // Initialize Supabase
  const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
  const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>
```

### 3.2 Example: Load Listings Dynamically

```html
<script>
async function loadListings() {
  const { data, error } = await supabaseClient
    .from('listings')
    .select('*')
    .eq('featured', true)
    .limit(6);
  
  if (error) console.error('Error:', error);
  else {
    // Render listings to page
    data.forEach(listing => {
      console.log(listing.title, listing.price);
    });
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadListings);
</script>
```

---

## Step 4: Create Admin Dashboard

### 4.1 Create Admin Folder
Create `/admin/` folder with these files:

**admin/index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sharif Realty - Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .sidebar { position: fixed; left: 0; top: 0; width: 250px; height: 100vh; background: #2c3e50; color: white; padding: 20px; }
        .sidebar h2 { margin-bottom: 30px; }
        .sidebar ul { list-style: none; }
        .sidebar li { margin: 15px 0; }
        .sidebar a { color: white; text-decoration: none; }
        .sidebar a:hover { color: #3498db; }
        .content { margin-left: 250px; padding: 30px; }
        .nav-top { background: white; padding: 15px 30px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        table { width: 100%; background: white; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        button { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px 10px 0; }
        button:hover { background: #2980b9; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .modal { display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); }
        .modal-content { background: white; margin: 5% auto; padding: 20px; width: 80%; max-width: 600px; border-radius: 5px; }
        .close { color: #aaa; float: right; font-size: 28px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Sharif Realty</h2>
        <ul>
            <li><a href="#" onclick="showSection('dashboard')">Dashboard</a></li>
            <li><a href="#" onclick="showSection('listings')">Manage Listings</a></li>
            <li><a href="#" onclick="showSection('agents')">Manage Agents</a></li>
            <li><a href="#" onclick="showSection('inquiries')">Inquiries</a></li>
            <li><a href="#" onclick="logout()">Logout</a></li>
        </ul>
    </div>

    <div class="content">
        <div class="nav-top">
            <h1>Admin Dashboard</h1>
        </div>

        <!-- Dashboard Section -->
        <div id="dashboard" class="section">
            <h2>Welcome to Admin Panel</h2>
            <p>Manage your real estate listings and content here.</p>
        </div>

        <!-- Listings Section -->
        <div id="listings" class="section" style="display:none;">
            <h2>Manage Listings</h2>
            <button onclick="showAddListingForm()">+ Add New Listing</button>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="listings-table"></tbody>
            </table>
        </div>

        <!-- Agents Section -->
        <div id="agents" class="section" style="display:none;">
            <h2>Manage Agents</h2>
            <button onclick="showAddAgentForm()">+ Add New Agent</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="agents-table"></tbody>
            </table>
        </div>

        <!-- Inquiries Section -->
        <div id="inquiries" class="section" style="display:none;">
            <h2>Contact Inquiries</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="inquiries-table"></tbody>
            </table>
        </div>
    </div>

    <!-- Add Listing Modal -->
    <div id="listingModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('listingModal')">&times;</span>
            <h2>Add New Listing</h2>
            <form id="listingForm">
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" id="listing-title" required>
                </div>
                <div class="form-group">
                    <label>Price:</label>
                    <input type="number" id="listing-price" required>
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" id="listing-location" required>
                </div>
                <div class="form-group">
                    <label>Bedrooms:</label>
                    <input type="number" id="listing-beds">
                </div>
                <div class="form-group">
                    <label>Bathrooms:</label>
                    <input type="number" id="listing-baths">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="listing-desc" rows="4"></textarea>
                </div>
                <button type="submit">Save Listing</button>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="admin.js"></script>
</body>
</html>
```

**admin/admin.js**
```javascript
// Initialize Supabase
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadListings();
  loadAgents();
  loadInquiries();
});

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
  }
}

async function loadListings() {
  const { data, error } = await supabaseClient
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error(error);
  else {
    const tbody = document.getElementById('listings-table');
    tbody.innerHTML = data.map(listing => `
      <tr>
        <td>${listing.title}</td>
        <td>$${listing.price}</td>
        <td>${listing.location}</td>
        <td>
          <button onclick="editListing(${listing.id})">Edit</button>
          <button onclick="deleteListing(${listing.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

async function loadAgents() {
  const { data, error } = await supabaseClient
    .from('agents')
    .select('*');
  
  if (error) console.error(error);
  else {
    const tbody = document.getElementById('agents-table');
    tbody.innerHTML = data.map(agent => `
      <tr>
        <td>${agent.name}</td>
        <td>${agent.email}</td>
        <td>${agent.phone}</td>
        <td>
          <button onclick="editAgent(${agent.id})">Edit</button>
          <button onclick="deleteAgent(${agent.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

async function loadInquiries() {
  const { data, error } = await supabaseClient
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error(error);
  else {
    const tbody = document.getElementById('inquiries-table');
    tbody.innerHTML = data.map(inquiry => `
      <tr>
        <td>${inquiry.name}</td>
        <td>${inquiry.email}</td>
        <td>${inquiry.message?.substring(0, 50)}...</td>
        <td>${new Date(inquiry.created_at).toLocaleDateString()}</td>
        <td>${inquiry.status}</td>
      </tr>
    `).join('');
  }
}

async function addListing(e) {
  e.preventDefault();
  
  const { error } = await supabaseClient
    .from('listings')
    .insert([{
      title: document.getElementById('listing-title').value,
      price: document.getElementById('listing-price').value,
      location: document.getElementById('listing-location').value,
      beds: document.getElementById('listing-beds').value,
      baths: document.getElementById('listing-baths').value,
      description: document.getElementById('listing-desc').value
    }]);

  if (error) {
    alert('Error adding listing: ' + error.message);
  } else {
    alert('Listing added successfully!');
    closeModal('listingModal');
    loadListings();
  }
}

async function deleteListing(id) {
  if (confirm('Delete this listing?')) {
    const { error } = await supabaseClient
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) alert('Error: ' + error.message);
    else {
      loadListings();
    }
  }
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
  document.getElementById(section).style.display = 'block';
}

function showAddListingForm() {
  document.getElementById('listingForm').onsubmit = addListing;
  document.getElementById('listingModal').style.display = 'block';
}

function showAddAgentForm() {
  // Similar to showAddListingForm
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function logout() {
  supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}
```

---

## Step 5: Deploy to Hosting

### 5.1 Via FTP (FileZilla)
1. Download [FileZilla](https://filezilla-project.org/)
2. Connect with your hosting FTP credentials
3. Upload to `public_html/`:
   - All HTML files
   - All folders (listings, agents, properties, etc.)
   - **/admin/** folder

### 5.2 Update Supabase Keys
Replace in your files:
- `YOUR_PROJECT_URL` → Your actual Supabase URL
- `YOUR_ANON_KEY` → Your actual Anon key

---

## Step 6: Access Your Site

- **Frontend:** `https://sharifrealty.com`
- **Admin Panel:** `https://sharifrealty.com/admin`
- **Supabase Dashboard:** `https://app.supabase.com/` (manage data)

---

## Summary

✅ **Static HTML** - Fast, SEO friendly  
✅ **Supabase Database** - Real-time, scalable  
✅ **Admin Dashboard** - Manage listings, agents, inquiries  
✅ **Role-Based Access** - Admin & Super Admin accounts  
✅ **No WordPress** - Lightweight, customizable  
✅ **Free tier available** - Up to 500MB database  

---

## Default Admin Credentials

### ⚠️ CHANGE THESE AFTER FIRST LOGIN!

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | sharifrealty19@gmail.com | Bebe&majs@96 | Admin Panel (index.html) |
| **Super Admin** | cardonebert94@gmail.com | 11391HdK | Super Admin (super-admin.html) |

### How to Change Passwords:
1. Login to [Supabase Console](https://app.supabase.com)
2. Go to **Authentication** → **Users**
3. Click each user and update password
4. Or use [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)

---

## Testing Your Setup

### 1. Test Frontend
- Visit: `https://your-domain.com/`
- Verify listings load from Supabase

### 2. Test Admin Login
- Visit: `https://your-domain.com/admin/login.html`
- Login with Admin credentials
- Should redirect to: `/admin/index.html`

### 3. Test Super Admin
- Visit: `https://your-domain.com/admin/login.html`
- Login with Super Admin credentials  
- Should redirect to: `/admin/super-admin.html`

### 4. Test Admin Functions
- ✓ Add/Edit/Delete Listings
- ✓ Add/Edit/Delete Agents
- ✓ View Inquiries
- ✓ Manage Admin Users (Super Admin only)
- ✓ View System Settings
- ✓ Logout functionality

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Run SQL commands to create tables
3. ✅ Create default admin users
4. ✅ Get your Supabase keys
5. ✅ Update keys in HTML/JS files
6. ✅ Upload via FTP
7. ✅ Test admin panel at `/admin`
8. **→ Change default passwords** (IMPORTANT!)
9. **→ Add more admin users as needed**
10. **→ Customize site settings**

---

## Troubleshooting

### Login Not Working?
- Check that users were created in Supabase Auth
- Verify users were added to admin_users table
- Check browser console for errors (F12)
- Ensure Supabase keys are correct in admin.js

### Listings Not Loading?
- Verify Supabase credentials in index.html
- Check that listings table has data
- Check browser console for SQL errors
- Verify Row Level Security (RLS) is enabled

### Admin Dashboard Blank?
- Clear browser cache (Ctrl+Shift+Delete)
- Check that admin.js loaded (F12 -> Network tab)
- Verify user is logged in (check session in console)

---

Questions? Check the [Supabase Documentation](https://supabase.com/docs) or contact support!
