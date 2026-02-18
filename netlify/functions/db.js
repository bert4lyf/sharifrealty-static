// Database configuration and utilities
// Using Supabase PostgreSQL

const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

function getSupabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY environment variables not set');
    }

    cachedClient = createClient(supabaseUrl, supabaseKey);
    console.log('Connected to Supabase');
    return cachedClient;
  } catch (error) {
    console.error('Supabase connection error:', error);
    throw error;
  }
}

module.exports = {
  getSupabase
};
