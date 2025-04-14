/**
 * Global error handler for the extension
 */

window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // We can log specific types of errors differently
    if (event.error && event.error.message && event.error.message.includes('firebase')) {
        console.error('Firebase Error:', {
            message: event.error.message,
            stack: event.error.stack,
            timestamp: new Date().toISOString()
        });
        
        // For Firebase auth errors, we might want to reset the UI
        if (event.error.message.includes('auth') || event.error.message.includes('Auth')) {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.textContent = 'Sign In';
                loginBtn.disabled = false;
            }
            
            const signupBtn = document.getElementById('signupBtn');
            if (signupBtn) {
                signupBtn.textContent = 'Create Account';
                signupBtn.disabled = false;
            }
        }
    }
    
    // We don't want to prevent default error handling
    return false;
});

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
