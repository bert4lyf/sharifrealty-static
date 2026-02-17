// Fix for static site deployment - patches old WordPress functionality

(function() {
  // Redirect AJAX calls to our Netlify Function
  const originalAjax = jQuery.ajax;
  jQuery.ajax = function(settings) {
    // Intercept requests to wp-admin/admin-ajax.php
    if (settings.url && settings.url.includes('wp-admin/admin-ajax.php')) {
      settings.url = '/.netlify/functions/admin-ajax';
      settings.crossDomain = true;
      settings.xhrFields = {
        withCredentials: false
      };
    }
    // Intercept requests to wp-json
    if (settings.url && settings.url.includes('/wp-json/')) {
      settings.url = '/.netlify/functions/admin-ajax';
      settings.crossDomain = true;
      settings.xhrFields = {
        withCredentials: false
      };
    }
    return originalAjax.call(this, settings);
  };

  // Copy settings from the original jQuery.ajax
  jQuery.ajax.setup = originalAjax.setup;
  jQuery.ajax.settings = originalAjax.settings;

  // Fix absolute URLs in data attributes
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Static site initialization script loaded');

    // Fix form action URLs
    document.querySelectorAll('form[action*="sharifrealty.com"]').forEach(form => {
      if (form.action.includes('wp-admin/admin-ajax.php')) {
        form.action = '/.netlify/functions/admin-ajax';
      }
    });

    // Fix script URLs with absolute paths
    document.querySelectorAll('script[src*="sharifrealty.com"]').forEach(script => {
      const src = script.src;
      if (src.includes('/wp-admin/')) {
        script.src = src.replace(/https?:\/\/[^/]+/, '');
      }
    });

    // Initialize Slider Revolution if it exists
    if (typeof SR7 !== 'undefined' && SR7.F && SR7.F.init) {
      try {
        SR7.F.init();
        console.log('Slider Revolution initialized');
      } catch (e) {
        console.warn('Could not initialize Slider Revolution:', e);
      }
    }

    // Fix authentication redirects
    if (window.location.pathname.includes('/sign-in') || window.location.pathname.includes('/register')) {
      console.log('Auth page detected');
    }

    // Log for debugging
    console.log('Static site patches applied');
  });

  // Wait for jQuery to be available
  if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(function($) {
      console.log('jQuery ready - applying patches');

      // Intercept all form submissions that go to WordPress
      $('form').on('submit', function(e) {
        const action = $(this).attr('action');
        if (action && action.includes('sharifrealty.com')) {
          const newAction = action.replace(/https?:\/\/[^/]+/, '');
          $(this).attr('action', newAction);
          console.log('Patched form action:', newAction);
        }
      });
    });
  }

  // Fix contact form submissions
  window.handleContactForm = function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      action: 'wpestate_footer_contact_form',
      contact_name: formData.get('contact_name') || formData.get('foot_contact_name'),
      contact_email: formData.get('contact_email') || formData.get('foot_contact_email'),
      contact_phone: formData.get('contact_phone') || formData.get('foot_contact_phone'),
      contact_content: formData.get('contact_content') || formData.get('foot_contact_content')
    };

    console.log('Submitting contact form:', data);

    fetch('/.netlify/functions/admin-ajax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Form submission result:', result);
      if (result.success) {
        alert(result.message || 'Thank you! Your message has been sent.');
        form.reset();
      } else {
        alert('Error: ' + (result.message || 'Failed to send message'));
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      alert('Error sending message. Please try again.');
    });

    return false;
  };

  // Make this globally available
  window.applyStaticSitePatches = {
    fixAjax: function() {
      console.log('AJAX patches applied');
    }
  };

})();
