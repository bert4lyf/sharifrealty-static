// Supabase Client Configuration
// Replace with your actual Supabase credentials from console.supabase.com

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// Initialize Supabase Client
class SupabaseClient {
  constructor(url, anonKey) {
    this.url = url;
    this.anonKey = anonKey;
  }

  // Auth Headers
  getAuthHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.anonKey,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Get current session from localStorage
  getSession() {
    const session = localStorage.getItem('supabase_session');
    return session ? JSON.parse(session) : null;
  }

  // Set session in localStorage
  setSession(session) {
    if (session) {
      localStorage.setItem('supabase_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabase_session');
    }
  }

  // Clear session
  clearSession() {
    localStorage.removeItem('supabase_session');
  }

  // Sign Up
  async signUp(email, password) {
    const response = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    const data = await response.json();
    this.setSession(data.session);
    return data;
  }

  // Sign In
  async signIn(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }

    const data = await response.json();
    this.setSession(data);
    return data;
  }

  // Sign Out
  async signOut() {
    const session = this.getSession();
    if (session?.access_token) {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(session.access_token),
      });
    }
    this.clearSession();
  }

  // Get Current User
  async getCurrentUser() {
    const session = this.getSession();
    if (!session?.access_token) {
      return null;
    }

    const response = await fetch(`${this.url}/auth/v1/user`, {
      headers: this.getAuthHeaders(session.access_token),
    });

    if (!response.ok) return null;
    return await response.json();
  }

  // Get User Role
  async getUserRole(userId) {
    const session = this.getSession();
    if (!session?.access_token) return null;

    const response = await fetch(`${this.url}/rest/v1/users?id=eq.${userId}&select=role`, {
      headers: this.getAuthHeaders(session.access_token),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data[0]?.role || null;
  }

  // Database: GET
  async from(table) {
    const session = this.getSession();
    const token = session?.access_token;

    return {
      select: (fields = '*') => ({
        eq: (column, value) => this._fetchData(table, `${fields}`, `${column}=eq.${value}`, token),
        filter: (filter) => this._fetchData(table, fields, filter, token),
        order: (column, ascending = true) => 
          this._fetchData(table, fields, '', token, `${column}.${ascending ? 'asc' : 'desc'}`),
        limit: (count) => this._fetchData(table, fields, '', token, null, count),
        all: () => this._fetchData(table, fields, '', token),
      }),
    };
  }

  // Internal fetch with RLS
  async _fetchData(table, select, filter, token, order, limit) {
    let url = `${this.url}/rest/v1/${table}?select=${select}`;
    if (filter) url += `&${filter}`;
    if (order) url += `&order=${order}`;
    if (limit) url += `&limit=${limit}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch from ${table}`);
    }

    return await response.json();
  }

  // Database: INSERT
  async insert(table, data) {
    const session = this.getSession();
    const token = session?.access_token;

    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to insert into ${table}`);
    }

    return await response.json();
  }

  // Database: UPDATE
  async update(table, data, id) {
    const session = this.getSession();
    const token = session?.access_token;

    const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update ${table}`);
    }

    return await response.json();
  }

  // Database: DELETE
  async delete(table, id) {
    const session = this.getSession();
    const token = session?.access_token;

    const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete from ${table}`);
    }

    return true;
  }

  // Storage: Upload
  async uploadFile(bucket, path, file) {
    const session = this.getSession();
    const token = session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.url}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  }

  // Storage: Get Public URL
  getPublicUrl(bucket, path) {
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }

  // Storage: Delete
  async deleteFile(bucket, path) {
    const session = this.getSession();
    const token = session?.access_token;

    const response = await fetch(
      `${this.url}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': this.anonKey,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return true;
  }
}

// Initialize global client
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
