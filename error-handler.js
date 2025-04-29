/**
 * Global error handler for authentication and Firebase operations
 */

// Main error handler function for authentication errors
window.handleAuthError = function(error, elements) {
  console.error('Auth Error:', error.code || 'unknown-error', error.message);
  
  // Extract elements needed for UI updates
  const { loginBtn, signupBtn, showLogin, showSignup, loginForm, signupForm } = elements || {};
  
  // Reset button states if they exist
  if (loginBtn) {
    loginBtn.textContent = 'Sign In';
    loginBtn.disabled = false;
  }
  
  if (signupBtn) {
    signupBtn.textContent = 'Create Account';
    signupBtn.disabled = false;
  }
  
  // Handle different error types with appropriate user messages
  let errorMessage = 'Authentication failed. Please try again.';
  
  if (error.code) {
    switch(error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Creating a new account instead.';
        if (showSignup && window.authUtils) {
          const email = document.getElementById('loginEmail')?.value || '';
          window.authUtils.switchToSignup(email);
          return; // Early return as we're switching forms
        }
        break;
        
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again or reset your password.';
        break;
        
      case 'auth/invalid-login-credentials':
        errorMessage = 'The email or password is incorrect. Please check your credentials and try again.';
        break;
        
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Switching to sign in form.';
        if (showLogin && window.authUtils) {
          const email = document.getElementById('signupEmail')?.value || '';
          window.authUtils.switchToLogin(email);
          return; // Early return as we're switching forms
        }
        break;
        
      case 'auth/weak-password':
        errorMessage = 'Your password is too weak. Please use at least 6 characters.';
        break;
        
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
        
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection and try again.';
        break;
        
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in was cancelled. Please try again.';
        break;
        
      case 'auth/redirect-cancelled-by-user':
        errorMessage = 'Sign-in was cancelled. Please try again and approve the authentication request.';
        break;
        
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
        break;
    }
  } else if (error.message) {
    if (error.message.includes('redirect_uri_mismatch')) {
      errorMessage = 'Authentication configuration error. Please contact support.';
    } else if (error.message.includes('approve access') || error.message.includes('did not approve')) {
      errorMessage = 'You need to approve the Google permissions to sign in. Please try again.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
  }
  
  // Display the error to the user
  window.showAuthError(errorMessage);
};

// Display error message to user
window.showAuthError = function(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'auth-error';
  errorElement.textContent = message;
  errorElement.style.color = '#ff6b6b';
  errorElement.style.fontSize = '12px';
  errorElement.style.textAlign = 'center';
  errorElement.style.padding = '5px';
  errorElement.style.animation = 'fadeIn 0.3s ease';
  
  // Remove any existing error messages
  document.querySelectorAll('.auth-error').forEach(el => el.remove());
  
  // Add error to the active form
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (loginForm && !loginForm.classList.contains('hidden')) {
    loginForm.appendChild(errorElement);
  } else if (signupForm && !signupForm.classList.contains('hidden')) {
    signupForm.appendChild(errorElement);
  } else {
    // If no forms are visible, add to authContainer
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
      authContainer.appendChild(errorElement);
    } else {
      // As a last resort, add to body
      document.body.appendChild(errorElement);
    }
  }
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.style.opacity = '0';
      setTimeout(() => errorElement.remove(), 300);
    }
  }, 5000);
};

// Add diagnostics for auth events
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // Check if Firebase Auth is properly initialized
    if (window.firebase && window.firebase.auth) {
      console.log('Firebase Auth is available');
    } else {
      console.error('Firebase Auth is not properly initialized');
    }
    
    // Check if our auth object is properly initialized
    if (window.auth) {
      console.log('Auth object is available');
      
      // Add listener for auth state
      window.auth.onAuthStateChanged(user => {
        console.log('Auth state changed in diagnostics:', user ? 'Logged in' : 'Logged out');
      });
    } else {
      console.error('Auth object is not properly initialized');
    }
  }, 1000);
});

// Simple logging utility
window.logError = function(component, error, context = {}) {
    console.error(`[${component}] Error:`, error, 'Context:', context);
};

console.log('Error handler initialized');
