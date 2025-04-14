/**
 * Auth Validator - Utility functions to validate authentication attempts
 */

// Check if an email already exists in Firebase
async function checkEmailExists(email) {
  try {
    // Ensure firebase is defined
    if (!firebase || !firebase.auth) {
      console.error('Firebase Auth not available for email check');
      return { exists: false, error: 'Firebase not initialized' };
    }
    
    const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
    return {
      exists: methods && methods.length > 0,
      methods: methods || []
    };
  } catch (error) {
    console.error('Error checking email existence:', error);
    return { 
      exists: false, 
      error: error.message || 'Failed to check email'
    };
  }
}

// Verify password strength
function verifyPasswordStrength(password) {
  if (!password || password.length < 6) {
    return {
      strong: false,
      message: 'Password must be at least 6 characters'
    };
  }
  
  // Basic strength checks
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length >= 8 && hasLetter && hasNumber && hasSpecial) {
    return {
      strong: true,
      strength: 'strong',
      message: 'Strong password'
    };
  } else if (password.length >= 6 && (hasLetter || hasNumber)) {
    return {
      strong: true,
      strength: 'moderate',
      message: 'Decent password, but could be stronger'
    };
  } else {
    return {
      strong: true, // Still valid for Firebase but weak
      strength: 'weak',
      message: 'Weak password - consider adding numbers or special characters'
    };
  }
}

// Export validator functions
window.authValidator = {
  checkEmailExists,
  verifyPasswordStrength
};
