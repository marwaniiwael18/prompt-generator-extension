/**
 * Firebase Auth Helper - Provides additional methods and safety checks
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Firebase Auth Helper initialized");
  
  // Global error handler for auth errors
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
    
    // Helper function to show error message
    function showAuthErrorMessage(message) {
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
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
    
    if (signupBtn) {
      signupBtn.textContent = 'Create Account';
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
        
      default:
        showAuthErrorMessage('Authentication failed: ' + (error.message || 'Please try again.'));
    }
  };

  // Wait a bit to ensure Firebase is fully initialized
  setTimeout(() => {
    initAuthHelper();
  }, 500);
  
  function initAuthHelper() {
    try {
      // Check if auth is available and properly initialized
      if (!window.auth) {
        console.error('Firebase Auth object not available');
        return;
      }
      
      console.log('Adding auth helper methods');
      
      // Safe email existence checking method
      window.checkEmailExists = async function(email) {
        try {
          // First check if we have the direct method available
          if (firebase.auth && typeof firebase.auth().fetchSignInMethodsForEmail === 'function') {
            console.log('Using native fetchSignInMethodsForEmail method');
            const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
            return methods && methods.length > 0;
          }
          
          // If the direct method is not available, try the signInWithEmailAndPassword method
          // but with an intentionally incorrect password to check if the account exists
          console.log('Using alternative check for email existence');
          try {
            await auth.signInWithEmailAndPassword(email, "temporaryWrongPasswordForCheck");
            // Should not reach here unless the password actually works (highly unlikely)
            return true;
          } catch (error) {
            // If error code is user-not-found, then account doesn't exist
            if (error.code === 'auth/user-not-found') {
              return false;
            }
            // If error is wrong-password, that means user exists
            if (error.code === 'auth/wrong-password') {
              return true;
            }
            // For any other errors, rethrow
            throw error;
          }
        } catch (error) {
          console.error('Error checking if email exists:', error);
          return null; // Return null to indicate an error occurred
        }
      };
      
      console.log('Auth helper methods added successfully');
    } catch (e) {
      console.error('Error initializing auth helper:', e);
    }
  }
});
