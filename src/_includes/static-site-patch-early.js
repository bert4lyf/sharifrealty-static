// ULTRA-AGGRESSIVE EARLY URL REWRITING PATCH
// This runs immediately and patches BEFORE inline scripts execute
// Must be placed at the very top of <head>

(function() {
  // Define URL rewriting helper that runs synchronously before anything else
  const domainRegex = /https?:\/\/([^/]*\.)?sharifrealty\.com/gi;
  const protoRelRegex = /^(?:\/\/)(?:[^/]*\.)?sharifrealty\.com/;
  
  const rewriteUrl = function(str) {
    if(!str || typeof str !== 'string') return str;
    let result = str.replace(domainRegex, '');
    result = result.replace(protoRelRegex, '');
    return result;
  };

  const rewriteObject = function(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const val = obj[key];
        if (typeof val === 'string') {
          obj[key] = rewriteUrl(val);
        } else if (typeof val === 'object' && val !== null) {
          rewriteObject(val);
        }
      }
    }
    return obj;
  };

  // Hook into Object.defineProperty to catch variable assignments
  const originalDefineProperty = Object.defineProperty;
  window.Object.defineProperty = function(obj, prop, descriptor) {
    if (prop === 'directorist' && descriptor && descriptor.value) {
      descriptor.value = rewriteObject(descriptor.value);
    }
    if (prop === 'SR7' && descriptor && descriptor.value) {
      descriptor.value = rewriteObject(descriptor.value);
    }
    if (prop === 'wpestate' && descriptor && descriptor.value) {
      descriptor.value = rewriteObject(descriptor.value);
    }
    if (prop === 'wpgs_vars' && descriptor && descriptor.value) {
      descriptor.value = rewriteObject(descriptor.value);
    }
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };

  // Override JSON.parse to patch parsed URLs
  const originalParse = JSON.parse;
  window.JSON.parse = function(text, reviver) {
    const result = originalParse.call(this, text, reviver);
    if (result && typeof result === 'object') {
      rewriteObject(result);
    }
    return result;
  };

  // Also patch the eval function (for inline vars)
  const originalEval = window.eval;
  window.eval = (function() {
    const newEval = function(code) {
      // If code contains a variable assignment with URLs, patch it
      if (typeof code === 'string' && code.includes('sharifrealty.com')) {
        code = code.replace(domainRegex, '').replace(protoRelRegex, '');
      }
      return originalEval.call(this, code);
    };
    // Copy properties
    for (const key in originalEval) {
      newEval[key] = originalEval[key];
    }
    return newEval;
  })();

  // Store references for later use in main static-site-init.js
  window._staticSitePatches = {
    domainRegex: domainRegex,
    protoRelRegex: protoRelRegex,
    rewriteUrl: rewriteUrl,
    rewriteObject: rewriteObject
  };

  console.log('[Early Patch] URL rewriting interceptors installed');
})();
