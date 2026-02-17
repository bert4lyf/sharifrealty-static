// Public User Auth

class PublicAuth {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.checkAuth();
  }

  // Check if user is logged in
  async checkAuth() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      this.updateAuthUI(user.email);
    } else {
      this.updateAuthUI(null);
    }
  }

  // Update UI based on auth state
  updateAuthUI(email) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');

    if (email) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (userDisplay) userDisplay.innerHTML = `Welcome, ${email}`;
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (signupBtn) signupBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userDisplay) userDisplay.innerHTML = '';
    }
  }

  // Sign Up
  async signUp(email, password) {
    try {
      const result = await this.supabase.signUp(email, password);
      alert('Sign up successful! Please check your email to confirm.');
      await this.checkAuth();
      return result;
    } catch (error) {
      alert('Sign up failed: ' + error.message);
      throw error;
    }
  }

  // Sign In
  async signIn(email, password) {
    try {
      const result = await this.supabase.signIn(email, password);
      await this.checkAuth();
      window.location.href = '/';
      return result;
    } catch (error) {
      alert('Sign in failed: ' + error.message);
      throw error;
    }
  }

  // Sign Out
  async signOut() {
    try {
      await this.supabase.signOut();
      this.updateAuthUI(null);
      window.location.href = '/';
    } catch (error) {
      alert('Sign out failed: ' + error.message);
    }
  }
}

// Initialize
const publicAuth = new PublicAuth(supabase);
