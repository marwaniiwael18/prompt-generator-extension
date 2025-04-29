/**
 * Logout Handler - Ensures proper cleanup when a user logs out
 */

document.addEventListener('DOMContentLoaded', function() {
  // The logout button click is already handled in firebase-auth.js
  // This file now focuses on cleanup operations and proper state management
  
  // Add a listener for auth state changes specifically for cleanup
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // When the user logs out (auth state becomes null)
      console.log('Logout detected in logout-handler.js');
      cleanupUserSession();
    }
  });
  
  // Function to clean up any user data or state before logout
  async function cleanupUserSession() {
    try {
      console.log('Cleaning up user session...');
      
      // Clear any sensitive cached data
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(['userPreferences', 'cachedUserData']);
      }
      
      // Make sure UI is properly reset - don't add classes that might conflict with firebase-auth.js
      const userInfo = document.getElementById('userInfo');
      const historySection = document.querySelector('.history-section');
      
      // Instead of manipulating classes directly (which might conflict with firebase-auth.js),
      // just ensure these elements are properly hidden
      if (userInfo) {
        if (!userInfo.classList.contains('hidden')) {
          userInfo.classList.add('hidden');
          console.log('User info hidden by logout handler');
        }
      }
      
      if (historySection) {
        if (!historySection.classList.contains('hidden')) {
          historySection.classList.add('hidden');
          console.log('History section hidden by logout handler');
        }
      }
      
      // Clear any sensitive data from the DOM
      const userEmail = document.getElementById('userEmail');
      if (userEmail) userEmail.textContent = '';
      
      // Reset the prompt history
      const promptHistory = document.getElementById('promptHistory');
      if (promptHistory) promptHistory.innerHTML = '';
      
      console.log('User session cleanup completed');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error cleaning up user session:', error);
      return Promise.reject(error);
    }
  }
});
