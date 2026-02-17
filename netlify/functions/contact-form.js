// Netlify Function to handle contact form submissions
// This replaces the WordPress AJAX endpoint

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { contact_name, contact_email, contact_phone, contact_content } = data;

    // Validate required fields
    if (!contact_name || !contact_email || !contact_content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      };
    }

    // For now, just log the submission (you can add email sending later)
    console.log('Contact form submission:', {
      name: contact_name,
      email: contact_email,
      phone: contact_phone,
      message: contact_content,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your message. We will get back to you soon!'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process form submission' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
};
