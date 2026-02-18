// Netlify Function to handle all AJAX requests from the old WordPress site
// This replaces wp-admin/admin-ajax.php

const { registerUser, loginUser } = require('./auth');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      // Handle form-encoded data
      body = {};
      if (event.body) {
        const params = new URLSearchParams(event.body);
        for (let [key, value] of params) {
          body[key] = value;
        }
      }
    }

    const action = body.action || event.queryStringParameters?.action || '';

    console.log('AJAX Request:', {
      action,
      method: event.httpMethod,
      body: { ...body, password: body.password ? '***' : undefined }
    });

    // Handle different actions
    switch (action) {
      case 'agent_property_contact':
      case 'contact_form_submit':
      case 'wpestate_footer_contact_form':
        return handleContactForm(body, headers);

      case 'agent_mark_favorite':
      case 'adv_search_property_map':
        return handlePropertyAction(body, action, headers);

      case 'login_user':
        return await handleLogin(body, headers);

      case 'register_user':
        return await handleRegister(body, headers);

      default:
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, data: 'Request received' }),
          headers
        };
    }
  } catch (error) {
    console.error('AJAX handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
      headers
    };
  }
};

function handleContactForm(body, headers) {
  const { contact_name, contact_email, contact_phone, contact_content, contact_to } = body;

  if (!contact_name || !contact_email || !contact_content) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'Please fill in all required fields'
      }),
      headers
    };
  }

  // Log the submission
  console.log('Contact form received:', {
    name: contact_name,
    email: contact_email,
    phone: contact_phone,
    message: contact_content,
    to: contact_to,
    timestamp: new Date().toISOString()
  });

  // TODO: Add email sending with SendGrid/Mailgun
  // For now, just confirm receipt
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    }),
    headers
  };
}

function handlePropertyAction(body, action, headers) {
  console.log(`Handling property action: ${action}`);

  // Return success for property-related actions
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Property action processed'
    }),
    headers
  };
}

async function handleLogin(body, headers) {
  const { user_login, user_email, user_pass } = body;
  const email = user_email || user_login;

  if (!email || !user_pass) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }),
      headers
    };
  }

  const result = await loginUser(email, user_pass);

  if (result.success) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result.user,
        message: result.message
      }),
      headers
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        error: result.error
      }),
      headers
    };
  }
}

async function handleRegister(body, headers) {
  const { user_email, user_pass, user_pass_confirm, first_name, last_name } = body;

  // Validation
  if (!user_email || !user_pass) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }),
      headers
    };
  }

  if (user_pass !== user_pass_confirm) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Passwords do not match'
      }),
      headers
    };
  }

  const fullName = `${first_name || ''} ${last_name || ''}`.trim();
  const result = await registerUser(user_email, user_pass, fullName);

  if (result.success) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: result.message
      }),
      headers
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: result.error
      }),
      headers
    };
  }
}
