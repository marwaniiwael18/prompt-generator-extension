/**
 * Authentication Utility Functions
 * Helps with user verification and error handling
 */

// Make sure firebase is initialized before using auth methods
function ensureFirebaseInit() {
  if (!window.firebase || !window.auth) {
    console.error('Firebase not properly initialized');
    throw new Error('Firebase not properly initialized');
  }
}

// Check if a user exists before login attempt
async function checkUserExists(email) {
  ensureFirebaseInit();
  
  try {
    // This uses Firebase Auth methods to check if a user exists
    const signInMethods = await firebase.auth().fetchSignInMethodsForEmail(email);
    return signInMethods.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false; // Default to false on error
  }
}

// Switch between login and signup forms with animation
function switchToSignup(email = '') {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (!loginForm || !signupForm) return;
  
  // Add smooth transition
  loginForm.style.opacity = '0';
  loginForm.style.transform = 'translateY(-10px)';
  
  setTimeout(() => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    
    // Pre-fill the email if provided
    if (email) {
      const emailField = document.getElementById('signupEmail');
      if (emailField) emailField.value = email;
    }
    
    // Focus on password field if email is provided, otherwise email field
    setTimeout(() => {
      const focusField = email ? 
        document.getElementById('signupPassword') :
        document.getElementById('signupEmail');
      if (focusField) focusField.focus();
      
      signupForm.style.opacity = '1';
      signupForm.style.transform = 'translateY(0)';
    }, 50);
  }, 200);
}

// Switch to login form with animation
function switchToLogin(email = '') {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (!loginForm || !signupForm) return;
  
  // Add smooth transition
  signupForm.style.opacity = '0';
  signupForm.style.transform = 'translateY(-10px)';
  
  setTimeout(() => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    
    // Pre-fill the email if provided
    if (email) {
      const emailField = document.getElementById('loginEmail');
      if (emailField) emailField.value = email;
    }
    
    // Focus on password field if email is provided, otherwise email field
    setTimeout(() => {
      const focusField = email ? 
        document.getElementById('loginPassword') :
        document.getElementById('loginEmail');
      if (focusField) focusField.focus();
      
      loginForm.style.opacity = '1';
      loginForm.style.transform = 'translateY(0)';
    }, 50);
  }, 200);
}

// Export utilities
window.authUtils = {
  ensureFirebaseInit,
  checkUserExists,
  switchToSignup,
  switchToLogin
};
