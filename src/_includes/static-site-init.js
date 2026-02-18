// Fix for static site deployment - patches old WordPress functionality

(function() {
  // Global XHR and fetch interception to rewrite absolute WP AJAX URLs
  try {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      try {
        if (typeof url === 'string' && (url.includes('wp-admin/admin-ajax.php') || url.includes('sharifrealty.com/wp-admin')) ) {
          url = url.replace(/https?:\/\/[^/]+/, '');
          url = '/.netlify/functions/admin-ajax';
        }
      } catch (e) {
        // swallow
      }
      return originalXHROpen.call(this, method, url, async, user, password);
    };
  } catch (e) {
    console.warn('Could not patch XMLHttpRequest.open', e);
  }

  if (window.fetch) {
    const _fetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      try {
        if (typeof input === 'string' && (input.includes('wp-admin/admin-ajax.php') || input.includes('sharifrealty.com/wp-admin'))) {
          input = '/.netlify/functions/admin-ajax';
        } else if (input && input.url && (input.url.includes('wp-admin/admin-ajax.php') || input.url.includes('sharifrealty.com/wp-admin'))) {
          input = new Request('/.netlify/functions/admin-ajax', input);
        }
      } catch (e) {
        // swallow
      }
      return _fetch(input, init);
    };
  }

  // Immediately rewrite any existing asset URLs that point at the old domain
  (function rewriteStaticAssets(){
    try {
      const domainRegex = /https?:\/\/([^/]*\.)?sharifrealty\.com/gi;
      const protoRelRegex = /^(?:\\/\\/)(?:[^/]*\.)?sharifrealty\.com/;

      document.querySelectorAll('link[href], script[src], img[src], source[src], source[srcset]').forEach(el => {
        const tag = el.tagName.toLowerCase();
        const attr = tag === 'link' ? 'href' : (el.hasAttribute('src') ? 'src' : (el.hasAttribute('srcset') ? 'srcset' : null));
        if (!attr) return;
        let val = el.getAttribute(attr);
        if (!val) return;
        // Remove protocol-relative and absolute references to the old domain
        val = val.replace(domainRegex, '');
        val = val.replace(protoRelRegex, '');
        if (val && (val.startsWith('/') || !val.startsWith('http')) ) {
          el.setAttribute(attr, val);
        }
      });

      // Fix SR7 globals if already present
      if (window.SR7 && window.SR7.E) {
        ['ajaxurl','resturl','plugin_url','wp_plugin_url','slug_path'].forEach(k => {
          if (window.SR7.E[k] && typeof window.SR7.E[k] === 'string') {
            window.SR7.E[k] = window.SR7.E[k].replace(domainRegex, '').replace(protoRelRegex, '');
          }
        });
      }
    } catch (e) {
      console.warn('rewriteStaticAssets failed', e);
    }
  })();

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
    // Try multiple initialization methods
    if (typeof SR7 !== 'undefined') {
      try {
        // Update AJAX URL to new endpoint if needed
        if (window.SR7 && window.SR7.E) {
          window.SR7.E.ajaxurl = '/.netlify/functions/admin-ajax';
        }

        // Initialize Slider Revolution Framework
        if (SR7.F && SR7.F.init) {
          SR7.F.init();
        }

        // Start all revolution sliders
        if (window.revapi && window.revapi.length > 0) {
          window.revapi.forEach((api, index) => {
            if (api && api.revstart) {
              console.log('Starting slider ' + index);
              setTimeout(() => {
                try {
                  api.revstart();
                } catch (e) {
                  console.warn('Could not start slider:', e);
                }
              }, 100 + (index * 50));
            }
          });
        }

        // Also try direct jQuery initialization
        setTimeout(() => {
          if (typeof jQuery !== 'undefined' && jQuery.fn.revolution) {
            jQuery('.rev_slider, [class*="revolution"]').each(function() {
              try {
                jQuery(this).revolution('init');
              } catch (e) {
                // Slider already initialized
              }
            });
          }
        }, 500);

        console.log('Slider Revolution initialized');
      } catch (e) {
        console.warn('Could not initialize Slider Revolution:', e);
      }
    }

    // Force slider reflow if visible
    setTimeout(() => {
      try {
        if (window.revapi && window.revapi.length > 0) {
          window.revapi.forEach(api => {
            if (api && typeof api.revredraw === 'function') {
              api.revredraw();
            }
          });
        }
      } catch (e) {
        console.warn('Slider redraw error:', e);
      }
    }, 1000);

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

      // Intercept login form submissions
      $('form.login, form.wpestate_login_form, form[class*="login"]').on('submit', function(e) {
        const $form = $(this);
        
        // Check if this is already being handled
        if ($form.data('patched')) return true;
        $form.data('patched', true);

        e.preventDefault();

        const email = $form.find('input[name="user_login"], input[name="user_email"]').val();
        const password = $form.find('input[name="user_pass"]').val();

        if (!email || !password) {
          alert('Please enter email and password');
          return false;
        }

        const $button = $form.find('button[type="submit"]');
        const originalText = $button.text();
        $button.prop('disabled', true).text('Logging in...');

        console.log('Handling login for:', email);

        fetch('/.netlify/functions/admin-ajax', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'login_user',
            user_login: email,
            user_email: email,
            user_pass: password
          })
        })
        .then(response => response.json())
        .then(result => {
          console.log('Login result:', result);
          if (result.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(result.data));
            localStorage.setItem('loggedIn', 'true');
            alert('Login successful! Redirecting...');
            window.location.href = '/dashboard-2/';
          } else {
            alert('Login failed: ' + (result.error || result.message || 'Unknown error'));
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          alert('Error during login. Please try again.');
        })
        .finally(() => {
          $button.prop('disabled', false).text(originalText);
        });

        return false;
      });

      // Intercept registration form submissions
      $('form.register, form.wpestate_register_form, form[class*="register"]').on('submit', function(e) {
        const $form = $(this);
        
        if ($form.data('patched')) return true;
        $form.data('patched', true);

        e.preventDefault();

        const email = $form.find('input[name="user_email"]').val();
        const password = $form.find('input[name="user_pass"]').val();
        const passwordConfirm = $form.find('input[name="user_pass_confirm"], input[name="user_password_repeat"]').val();
        const firstName = $form.find('input[name="first_name"]').val() || '';
        const lastName = $form.find('input[name="last_name"]').val() || '';

        if (!email || !password || !passwordConfirm) {
          alert('Please fill in all fields');
          return false;
        }

        if (password !== passwordConfirm) {
          alert('Passwords do not match');
          return false;
        }

        const $button = $form.find('button[type="submit"]');
        const originalText = $button.text();
        $button.prop('disabled', true).text('Registering...');

        console.log('Handling registration for:', email);

        fetch('/.netlify/functions/admin-ajax', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'register_user',
            user_email: email,
            user_pass: password,
            user_pass_confirm: passwordConfirm,
            first_name: firstName,
            last_name: lastName
          })
        })
        .then(response => response.json())
        .then(result => {
          console.log('Registration result:', result);
          if (result.success) {
            alert('Registration successful! Please log in now.');
            window.location.href = '/sign-in-2/';
          } else {
            alert('Registration failed: ' + (result.error || result.message || 'Unknown error'));
          }
        })
        .catch(error => {
          console.error('Registration error:', error);
          alert('Error during registration. Please try again.');
        })
        .finally(() => {
          $button.prop('disabled', false).text(originalText);
        });

        return false;
      });

      // Intercept all other form submissions that go to WordPress
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
