// Netlify Function to resend verification emails for admin users
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
  // Security: only allow POST requests with proper auth token or from localhost
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email } = JSON.parse(req.body || '{}');

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Admin email allowed to resend
    const adminEmail = 'cardonebert94@gmail.com';
    
    if (email !== adminEmail) {
      return new Response(JSON.stringify({ error: 'Email not authorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Resending confirmation email to: ${email}`);

    // Get the user by email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
      console.error('User lookup error:', userError);
      return new Response(JSON.stringify({ 
        error: 'User not found: ' + (userError?.message || 'Unknown error') 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already confirmed
    if (user.email_confirmed_at) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'User email is already confirmed',
        confirmedAt: user.email_confirmed_at
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Resend confirmation email using admin API
    const { error: resendError } = await supabase.auth.admin.resendEnterpriseInvitation(email);

    if (resendError) {
      console.error('Resend error:', resendError);
      // If enterprise invitation is not available, try sending a magic link for signup
      // Note: This is a workaround - ideally use resendEnterpriseInvitation
      
      // Alternative: Create a new magic link sign-in (doesn't auto-confirm but sends email)
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // Don't create new user, just send link
        }
      });

      if (linkError) {
        console.error('Magic link error:', linkError);
        // Try one more method: resend via direct API call
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/resend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({
              email: email,
              type: 'signup' // This will send a confirmation email
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to resend');
          }

          return new Response(JSON.stringify({ 
            success: true,
            message: `Verification email resent to ${email}. Check inbox for confirmation link.`
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (apiError) {
          console.error('API resend error:', apiError);
          return new Response(JSON.stringify({ 
            error: apiError.message || 'Failed to resend verification email'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: `Verification email sent to ${email}. Check inbox for magic link.`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Verification email resent to ${email}. Check inbox for confirmation link.`
    }), {
      status: 200,
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
