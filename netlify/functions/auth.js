// User authentication handler
// Using Supabase built-in authentication

const { getSupabaseAnon, getSupabaseAdmin } = require('./db');

async function registerUser(email, password, fullName) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Create user with Supabase auth (handles password hashing automatically)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      }
    });

    if (error) {
      // Check if error is due to duplicate user
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        return {
          success: false,
          error: 'Email already registered. Please try logging in.'
        };
      }
      throw error;
    }

    return {
      success: true,
      userId: data.user.id,
      message: 'Registration successful! You can now log in.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
}

async function loginUser(email, password) {
  try {
    const supabase = getSupabaseAnon();

    // Use Supabase auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Email or password is incorrect'
        };
      }
      throw error;
    }

    // Get user metadata
    const user = data.user;
    const userMetadata = user.user_metadata || {};

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: userMetadata.full_name || '',
        phone: userMetadata.phone || '',
        address: userMetadata.address || '',
        city: userMetadata.city || '',
        state: userMetadata.state || '',
        zip: userMetadata.zip || ''
      },
      session: data.session,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
}

module.exports = {
  registerUser,
  loginUser
};
