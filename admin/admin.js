// Initialize Supabase (for database only, not auth)
const SUPABASE_URL = 'https://sduhclsehkpssroivzvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdWhjbHNlaGtwc3Nyb2l2enZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODQwNjksImV4cCI6MjA4Njg2MDA2OX0.8009fCh_ydaz02lXK9TaSGgNTEJ4FF3chZg0S8_2Zds';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state
let currentListingId = null;
let currentAgentId = null;
let currentUserId = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await checkAuth();
    await loadDashboard();
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showAlert('Error initializing app', 'error');
  }
});

// ============= AUTHENTICATION (Using Supabase Auth) =============

async function checkAuth() {
  try {
    // Check if user has valid Supabase session
    const { data } = await supabaseClient.auth.getSession();
    
    if (!data.session) {
      console.log('No session found, redirecting to login');
      window.location.href = 'login-clerk.html';
      return false;
    }

    // Get current user info
    const email = data.session.user.email;
    const userEl = document.getElementById('current-user');
    if (userEl) userEl.textContent = email;
    
    console.log('✅ User authenticated:', email);
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'login-clerk.html';
    return false;
  }
}

async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await supabaseClient.auth.signOut();
      window.location.href = 'login-clerk.html';
    } catch (error) {
      console.error('Logout error:', error);
      showAlert('Error during logout', 'error');
    }
  }
}

// ============= UI NAVIGATION =============

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  
  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) section.classList.add('active');
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  
  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'listings': 'Manage Listings',
    'agents': 'Manage Agents',
    'inquiries': 'Contact Inquiries',
    'users': 'Admin Users',
    'settings': 'System Settings'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';
  
  // Load data for section
  if (sectionId === 'listings') loadListings();
  if (sectionId === 'agents') loadAgents();
  if (sectionId === 'inquiries') loadInquiries();
  if (sectionId === 'users') loadUsers();
}

// ============= DASHBOARD =============

async function loadDashboard() {
  try {
    const [listings, agents, inquiries, users] = await Promise.all([
      supabaseClient.from('listings').select('id'),
      supabaseClient.from('agents').select('id'),
      supabaseClient.from('inquiries').select('id'),
      supabaseClient.from('admin_users').select('id')
    ]);
    
    const listingsEl = document.getElementById('total-listings');
    const agentsEl = document.getElementById('total-agents');
    const inquiriesEl = document.getElementById('total-inquiries');
    const usersEl = document.getElementById('total-users');
    
    if (listingsEl) listingsEl.textContent = listings.data?.length || 0;
    if (agentsEl) agentsEl.textContent = agents.data?.length || 0;
    if (inquiriesEl) inquiriesEl.textContent = inquiries.data?.length || 0;
    if (usersEl) usersEl.textContent = users.data?.length || 0;
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

function refreshData() {
  loadDashboard();
  const activeSection = document.querySelector('.section.active');
  if (!activeSection) return;
  
  const sectionId = activeSection.id;
  if (sectionId === 'listings') loadListings();
  if (sectionId === 'agents') loadAgents();
  if (sectionId === 'inquiries') loadInquiries();
  if (sectionId === 'users') loadUsers();
  
  showAlert('Data refreshed!', 'success');
}

// ============= LISTINGS =============

async function loadListings() {
  const content = document.getElementById('listings-content');
  if (!content) return;
  
  content.innerHTML = '<div class="loading">Loading listings...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      content.innerHTML = '<div class="empty-state"><p>No listings found. Click "Add Listing" to create one.</p></div>';
      return;
    }
    
    content.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Location</th>
            <th>Beds</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(listing => `
            <tr>
              <td><strong>${listing.title}</strong></td>
              <td>$${new Intl.NumberFormat().format(listing.price || 0)}</td>
              <td>${listing.location || '-'}</td>
              <td>${listing.beds || '-'}</td>
              <td><span class="badge badge-success">${listing.status || 'For Sale'}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" onclick="editListing(${listing.id})">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteListing(${listing.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load listings error:', error);
    content.innerHTML = '<div class="alert alert-error">Error loading listings: ' + error.message + '</div>';
  }
}

async function editListing(id) {
  try {
    const { data, error } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    currentListingId = id;
    const titleEl = document.getElementById('listing-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Listing';
    
    document.getElementById('listing-title').value = data.title || '';
    document.getElementById('listing-price').value = data.price || '';
    document.getElementById('listing-location').value = data.location || '';
    document.getElementById('listing-beds').value = data.beds || '';
    document.getElementById('listing-baths').value = data.baths || '';
    document.getElementById('listing-sqft').value = data.sqft || '';
    document.getElementById('listing-status').value = data.status || 'For Sale';
    document.getElementById('listing-featured').value = data.featured || 'false';
    document.getElementById('listing-description').value = data.description || '';
    
    openModal('listingModal');
  } catch (error) {
    console.error('Edit listing error:', error);
    showAlert('Error loading listing: ' + error.message, 'error');
  }
}

async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing?')) return;
  
  try {
    const { error } = await supabaseClient
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    showAlert('Listing deleted successfully!', 'success');
    loadListings();
  } catch (error) {
    console.error('Delete listing error:', error);
    showAlert('Error deleting listing: ' + error.message, 'error');
  }
}

// ============= AGENTS =============

async function loadAgents() {
  const content = document.getElementById('agents-content');
  if (!content) return;
  
  content.innerHTML = '<div class="loading">Loading agents...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      content.innerHTML = '<div class="empty-state"><p>No agents found. Click "Add Agent" to create one.</p></div>';
      return;
    }
    
    content.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Specialty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(agent => `
            <tr>
              <td><strong>${agent.name}</strong></td>
              <td>${agent.email || '-'}</td>
              <td>${agent.phone || '-'}</td>
              <td>${agent.specialty || '-'}</td>
              <td><span class="badge ${agent.active ? 'badge-success' : 'badge-warning'}">${agent.active ? 'Active' : 'Inactive'}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" onclick="editAgent(${agent.id})">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteAgent(${agent.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load agents error:', error);
    content.innerHTML = '<div class="alert alert-error">Error loading agents: ' + error.message + '</div>';
  }
}

async function editAgent(id) {
  try {
    const { data, error } = await supabaseClient
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    currentAgentId = id;
    const titleEl = document.getElementById('agent-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Agent';
    
    document.getElementById('agent-name').value = data.name || '';
    document.getElementById('agent-email').value = data.email || '';
    document.getElementById('agent-phone').value = data.phone || '';
    document.getElementById('agent-specialty').value = data.specialty || '';
    document.getElementById('agent-bio').value = data.bio || '';
    document.getElementById('agent-active').value = data.active || 'true';
    
    openModal('agentModal');
  } catch (error) {
    console.error('Edit agent error:', error);
    showAlert('Error loading agent: ' + error.message, 'error');
  }
}

async function deleteAgent(id) {
  if (!confirm('Are you sure you want to delete this agent?')) return;
  
  try {
    const { error } = await supabaseClient
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    showAlert('Agent deleted successfully!', 'success');
    loadAgents();
  } catch (error) {
    console.error('Delete agent error:', error);
    showAlert('Error deleting agent: ' + error.message, 'error');
  }
}

// ============= INQUIRIES =============

async function loadInquiries() {
  const content = document.getElementById('inquiries-content');
  if (!content) return;
  
  content.innerHTML = '<div class="loading">Loading inquiries...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      content.innerHTML = '<div class="empty-state"><p>No inquiries found.</p></div>';
      return;
    }
    
    content.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(inquiry => `
            <tr>
              <td><strong>${inquiry.name}</strong></td>
              <td>${inquiry.email}</td>
              <td>${inquiry.phone || '-'}</td>
              <td>${(inquiry.message || '').substring(0, 40)}...</td>
              <td>${new Date(inquiry.created_at).toLocaleDateString()}</td>
              <td><span class="badge ${inquiry.status === 'new' ? 'badge-info' : 'badge-success'}">${inquiry.status || 'new'}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" onclick="updateInquiryStatus(${inquiry.id}, '${inquiry.status}')">Mark ${inquiry.status === 'new' ? 'Reviewed' : 'New'}</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteInquiry(${inquiry.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load inquiries error:', error);
    content.innerHTML = '<div class="alert alert-error">Error loading inquiries: ' + error.message + '</div>';
  }
}

async function updateInquiryStatus(id, currentStatus) {
  const newStatus = currentStatus === 'new' ? 'reviewed' : 'new';
  
  try {
    const { error } = await supabaseClient
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) throw error;
    loadInquiries();
  } catch (error) {
    console.error('Update inquiry error:', error);
    showAlert('Error updating inquiry: ' + error.message, 'error');
  }
}

async function deleteInquiry(id) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  
  try {
    const { error } = await supabaseClient
      .from('inquiries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    loadInquiries();
  } catch (error) {
    console.error('Delete inquiry error:', error);
    showAlert('Error deleting inquiry: ' + error.message, 'error');
  }
}

function exportInquiries() {
  alert('Export feature coming soon! Save inquiries as CSV.');
}

// ============= USERS =============

async function loadUsers() {
  const content = document.getElementById('users-content');
  if (!content) return;
  
  content.innerHTML = '<div class="loading">Loading users...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      content.innerHTML = '<div class="empty-state"><p>No admin users found. Click "Add User" to create one.</p></div>';
      return;
    }
    
    content.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(user => `
            <tr>
              <td><strong>${user.name || 'N/A'}</strong></td>
              <td>${user.email}</td>
              <td><span class="badge badge-info">${user.role}</span></td>
              <td><span class="badge ${user.active ? 'badge-success' : 'badge-danger'}">${user.active ? 'Active' : 'Inactive'}</span></td>
              <td>${new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load users error:', error);
    content.innerHTML = '<div class="alert alert-error">Error loading users: ' + error.message + '</div>';
  }
}

async function editUser(id) {
  try {
    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    currentUserId = id;
    const titleEl = document.getElementById('user-modal-title');
    if (titleEl) titleEl.textContent = 'Edit User';
    
    document.getElementById('user-name').value = data.name || '';
    document.getElementById('user-email').value = data.email;
    document.getElementById('user-role').value = data.role || 'editor';
    document.getElementById('user-active').value = data.active || 'true';
    
    openModal('userModal');
  } catch (error) {
    console.error('Edit user error:', error);
    showAlert('Error loading user: ' + error.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  try {
    const { error } = await supabaseClient
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    showAlert('User deleted successfully!', 'success');
    loadUsers();
  } catch (error) {
    console.error('Delete user error:', error);
    showAlert('Error deleting user: ' + error.message, 'error');
  }
}

// ============= FORMS =============

function setupEventListeners() {
  const listingForm = document.getElementById('listingForm');
  const agentForm = document.getElementById('agentForm');
  const userForm = document.getElementById('userForm');
  const settingsForm = document.getElementById('settingsForm');
  
  if (listingForm) listingForm.addEventListener('submit', saveListing);
  if (agentForm) agentForm.addEventListener('submit', saveAgent);
  if (userForm) userForm.addEventListener('submit', saveUser);
  if (settingsForm) settingsForm.addEventListener('submit', saveSettings);
}

async function saveListing(e) {
  e.preventDefault();
  
  const listingData = {
    title: document.getElementById('listing-title').value,
    price: parseFloat(document.getElementById('listing-price').value),
    location: document.getElementById('listing-location').value,
    beds: parseInt(document.getElementById('listing-beds').value) || null,
    baths: parseFloat(document.getElementById('listing-baths').value) || null,
    sqft: parseInt(document.getElementById('listing-sqft').value) || null,
    status: document.getElementById('listing-status').value,
    featured: document.getElementById('listing-featured').value === 'true',
    description: document.getElementById('listing-description').value
  };
  
  try {
    let error;
    if (currentListingId) {
      const result = await supabaseClient
        .from('listings')
        .update(listingData)
        .eq('id', currentListingId);
      error = result.error;
    } else {
      const result = await supabaseClient
        .from('listings')
        .insert([listingData]);
      error = result.error;
    }
    
    if (error) throw error;
    showAlert('Listing saved successfully!', 'success');
    closeModal('listingModal');
    currentListingId = null;
    loadListings();
  } catch (error) {
    showAlert('Error saving listing: ' + error.message, 'error');
  }
}

async function saveAgent(e) {
  e.preventDefault();
  
  const agentData = {
    name: document.getElementById('agent-name').value,
    email: document.getElementById('agent-email').value,
    phone: document.getElementById('agent-phone').value || null,
    specialty: document.getElementById('agent-specialty').value || null,
    bio: document.getElementById('agent-bio').value || null,
    active: document.getElementById('agent-active').value === 'true'
  };
  
  try {
    let error;
    if (currentAgentId) {
      const result = await supabaseClient
        .from('agents')
        .update(agentData)
        .eq('id', currentAgentId);
      error = result.error;
    } else {
      const result = await supabaseClient
        .from('agents')
        .insert([agentData]);
      error = result.error;
    }
    
    if (error) throw error;
    showAlert('Agent saved successfully!', 'success');
    closeModal('agentModal');
    currentAgentId = null;
    loadAgents();
  } catch (error) {
    showAlert('Error saving agent: ' + error.message, 'error');
  }
}

async function saveUser(e) {
  e.preventDefault();
  
  const userData = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    role: document.getElementById('user-role').value,
    active: document.getElementById('user-active').value === 'true'
  };
  
  try {
    let error;
    if (currentUserId) {
      const result = await supabaseClient
        .from('admin_users')
        .update(userData)
        .eq('id', currentUserId);
      error = result.error;
    } else {
      const result = await supabaseClient
        .from('admin_users')
        .insert([userData]);
      error = result.error;
    }
    
    if (error) throw error;
    showAlert('User saved successfully!', 'success');
    closeModal('userModal');
    currentUserId = null;
    loadUsers();
  } catch (error) {
    showAlert('Error saving user: ' + error.message, 'error');
  }
}

function saveSettings(e) {
  e.preventDefault();
  const settings = {
    siteName: document.getElementById('site-name').value,
    siteEmail: document.getElementById('site-email').value,
    sitePhone: document.getElementById('site-phone').value,
    siteAddress: document.getElementById('site-address').value
  };
  localStorage.setItem('siteSettings', JSON.stringify(settings));
  showAlert('Settings saved successfully!', 'success');
}

// ============= MODALS =============

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
  resetModalForms();
}

function openListingModal() {
  currentListingId = null;
  const titleEl = document.getElementById('listing-modal-title');
  if (titleEl) titleEl.textContent = 'Add New Listing';
  const form = document.getElementById('listingForm');
  if (form) form.reset();
  openModal('listingModal');
}

function openAgentModal() {
  currentAgentId = null;
  const titleEl = document.getElementById('agent-modal-title');
  if (titleEl) titleEl.textContent = 'Add New Agent';
  const form = document.getElementById('agentForm');
  if (form) form.reset();
  openModal('agentModal');
}

function openUserModal() {
  currentUserId = null;
  const titleEl = document.getElementById('user-modal-title');
  if (titleEl) titleEl.textContent = 'Add Admin User';
  const form = document.getElementById('userForm');
  if (form) form.reset();
  openModal('userModal');
}

function resetModalForms() {
  currentListingId = null;
  currentAgentId = null;
  currentUserId = null;
}

// ============= UTILITIES =============

function showAlert(message, type) {
  // Create alert element
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = message;
  
  // Add to page
  const main = document.querySelector('.main');
  if (main) {
    main.insertBefore(alertDiv, main.firstChild);
  }
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

// Close modals on outside click
window.addEventListener('click', (e) => {
  const listingModal = document.getElementById('listingModal');
  const agentModal = document.getElementById('agentModal');
  const userModal = document.getElementById('userModal');
  
  if (listingModal && e.target === listingModal) closeModal('listingModal');
  if (agentModal && e.target === agentModal) closeModal('agentModal');
  if (userModal && e.target === userModal) closeModal('userModal');
});
