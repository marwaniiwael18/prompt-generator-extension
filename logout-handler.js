/**
 * Logout Handler - Ensures proper cleanup when a user logs out
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get reference to logout button
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Perform logout cleanup before the actual Firebase logout
      cleanupUserSession()
        .then(() => {
          // Now perform the actual logout
          return firebase.auth().signOut();
        })
        .then(() => {
          console.log('User successfully logged out and session cleaned up');
        })
        .catch(error => {
          console.error('Error during logout process:', error);
        });
    });
  }
  
  // Function to clean up any user data or state before logout
  async function cleanupUserSession() {
    try {
      // Clear any sensitive cached data
      await chrome.storage.local.remove(['userPreferences', 'cachedUserData']);
      
      // Reset UI states
      document.querySelectorAll('.user-specific-content').forEach(el => {
        el.classList.add('hidden');
      });
      
      // If you have any open connections or listeners, close them here
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error cleaning up user session:', error);
      return Promise.reject(error);
    }
  }
});
