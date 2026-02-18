// Netlify Function to auto-confirm admin user email (server-side bypass)
// This is a one-time admin operation to mark cardonebert94@gmail.com as confirmed
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async (req, context) => {
  // Security: only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Handle body parsing - it might be a string or stream
    let body = req.body;
    if (typeof body !== 'string') {
      body = await req.text();
    }
    const { action, email } = JSON.parse(body || '{}');

    if (!action || !email) {
      return new Response(JSON.stringify({ error: 'Missing action or email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (email !== 'cardonebert94@gmail.com') {
      return new Response(JSON.stringify({ error: 'Unauthorized email' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'confirm') {
      console.log(`Auto-confirming admin user: ${email}`);

      // Use admin API to list users and find by email
      const { data: userData, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error('List users error:', listError);
        return new Response(JSON.stringify({ 
          error: 'Failed to list users: ' + listError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // userData might be { users: [...] } or just [...]
      const users = userData?.users || userData || [];
      console.log('Found users:', users.length);
      
      const user = Array.isArray(users) ? users.find(u => u.email === email) : null;
      if (!user) {
        return new Response(JSON.stringify({ 
          error: `User not found: ${email}` 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update user to mark email as confirmed
      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
      });

      if (updateError) {
        console.error('Confirmation error:', updateError);
        return new Response(JSON.stringify({ 
          error: 'Failed to confirm: ' + updateError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: `Admin user ${email} email confirmed successfully!`,
        user: {
          id: updated.id,
          email: updated.email,
          email_confirmed_at: updated.email_confirmed_at
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
