/**
 * Error Handler
 * Provides consistent error handling across the extension
 */

// Initialize error handling system
console.log('Error handler initialized');

// Firebase Authentication Error Handler
window.handleAuthError = function(error, options = {}) {
  console.error("Auth Error:", error.code, error.message);
  
  const {
    loginBtn = null,
    signupBtn = null,
    showLogin = null,
    showSignup = null,
    loginForm = null,
    signupForm = null
  } = options;
  
  // Check Firebase initialization
  try {
    if (!window.firebase || !window.auth) {
      console.error('Firebase Auth is not properly initialized');
      return;
    }
    console.log('Auth object is available');

    // Monitor auth state changes for diagnostics
    window.auth.onAuthStateChanged((user) => {
      console.log('Auth state changed in diagnostics:', user ? 'Logged in' : 'Logged out');
    });
  } catch (e) {
    console.error('Error checking Firebase initialization:', e);
  }
  
  // Helper function to show error message
  function showAuthErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.innerHTML = `
      <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      ${message}
    `;
    
    // Remove any existing error messages
    document.querySelectorAll('.auth-error').forEach(el => el.remove());
    
    // Add error to the active form
    if (loginForm && !loginForm.classList.contains('hidden')) {
      loginForm.appendChild(errorElement);
    } else if (signupForm) {
      signupForm.appendChild(errorElement);
    } else {
      // Fallback - add to body
      document.body.appendChild(errorElement);
      errorElement.style.position = 'fixed';
      errorElement.style.top = '10px';
      errorElement.style.left = '50%';
      errorElement.style.transform = 'translateX(-50%)';
      errorElement.style.background = '#333';
      errorElement.style.padding = '10px 15px';
      errorElement.style.borderRadius = '4px';
      errorElement.style.zIndex = '9999';
    }
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 4000);
  }
  
  // Reset button states
  if (loginBtn) {
    loginBtn.innerHTML = `
      <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
      Sign In
    `;
    loginBtn.disabled = false;
  }
  
  if (signupBtn) {
    signupBtn.innerHTML = `
      <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
      Create Account
    `;
    signupBtn.disabled = false;
  }
  
  // Handle specific error codes
  switch(error.code) {
    case 'auth/user-not-found':
      showAuthErrorMessage('No account found with this email. Please sign up instead.');
      if (showSignup && document.getElementById('loginEmail')) {
        const email = document.getElementById('loginEmail').value;
        showSignup.click();
        setTimeout(() => {
          if (document.getElementById('signupEmail')) {
            document.getElementById('signupEmail').value = email;
          }
        }, 100);
      }
      break;
      
    case 'auth/wrong-password':
      showAuthErrorMessage('Incorrect password. Please try again.');
      break;
      
    case 'auth/email-already-in-use':
      showAuthErrorMessage('Email already in use. Try logging in instead.');
      if (showLogin && document.getElementById('signupEmail')) {
        const email = document.getElementById('signupEmail').value;
        showLogin.click();
        setTimeout(() => {
          if (document.getElementById('loginEmail')) {
            document.getElementById('loginEmail').value = email;
          }
        }, 100);
      }
      break;
      
    case 'auth/invalid-email':
      showAuthErrorMessage('Invalid email address.');
      break;
      
    case 'auth/weak-password':
      showAuthErrorMessage('Password is too weak. Use at least 6 characters.');
      break;
      
    case 'auth/network-request-failed':
      showAuthErrorMessage('Network error. Please check your connection.');
      break;

    case 'auth/popup-blocked':
      showAuthErrorMessage('Popup was blocked. Please allow popups for this site.');
      break;

    case 'auth/missing-fields':
      showAuthErrorMessage('Please fill in all required fields.');
      break;

    case 'auth/passwords-dont-match':
      showAuthErrorMessage('Passwords do not match.');
      break;
      
    default:
      showAuthErrorMessage('Authentication failed: ' + (error.message || 'Please try again.'));
  }
};

// Simple logging utility
window.logError = function(component, error, context = {}) {
    console.error(`[${component}] Error:`, error, 'Context:', context);
};
