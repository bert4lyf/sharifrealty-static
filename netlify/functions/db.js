// Database configuration and utilities
// Using Supabase PostgreSQL

const { createClient } = require('@supabase/supabase-js');

let cachedAnon = null;
let cachedAdmin = null;

function getSupabaseAnon() {
  if (cachedAnon) return cachedAnon;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY environment variables not set');
  }

  cachedAnon = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Connected to Supabase (anon)');
  return cachedAnon;
}

function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables not set');
  }

  cachedAdmin = createClient(supabaseUrl, serviceRoleKey);
  console.log('Connected to Supabase (service role)');
  return cachedAdmin;
}

module.exports = {
  getSupabaseAnon,
  getSupabaseAdmin
};
