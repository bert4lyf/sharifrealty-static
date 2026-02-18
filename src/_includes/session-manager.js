// Session management for logged-in users
(function() {
  // Check if user is logged in and restore session
  window.checkUserSession = function() {
    const loggedIn = localStorage.getItem('loggedIn');
    const user = localStorage.getItem('user');
    
    if (loggedIn === 'true' && user) {
      try {
        const userData = JSON.parse(user);
        return userData;
      } catch (e) {
        console.warn('Could not parse user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        return null;
      }
    }
    return null;
  };

  // Log out user
  window.logoutUser = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('loggedIn');
    alert('You have been logged out.');
    window.location.href = '/sign-in-2/';
  };

  // Update user profile
  window.updateUserProfile = function(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('loggedIn', 'true');
  };

  // Get current user
  window.getCurrentUser = function() {
    return window.checkUserSession();
  };

  // Check on page load
  document.addEventListener('DOMContentLoaded', function() {
    const user = window.checkUserSession();
    
    if (user) {
      console.log('User session restored:', user.email);
      // You can use this to update UI elements, show user name, etc.
      // For example:
      // document.getElementById('user-name').innerText = user.fullName || user.email;
    }
  });
})();
