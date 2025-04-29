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
      
      // Make sure UI is properly reset
      const userInfo = document.getElementById('userInfo');
      const historySection = document.querySelector('.history-section');
      
      // Toggle appropriate visibility states to ensure a clean UI
      if (userInfo && !userInfo.classList.contains('hidden')) {
        userInfo.classList.add('hidden');
        console.log('User info hidden by logout handler');
      }
      
      if (historySection && !historySection.classList.contains('hidden')) {
        historySection.classList.add('hidden');
        console.log('History section hidden by logout handler');
      }

      // Show login form and guest info
      const loginForm = document.getElementById('loginForm');
      const guestInfo = document.querySelector('.guest-info');

      if (loginForm && loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        console.log('Login form shown by logout handler');
      }

      if (guestInfo && guestInfo.classList.contains('hidden')) {
        guestInfo.classList.remove('hidden');
        console.log('Guest info shown by logout handler');
      }
      
      // Clear any sensitive data from the DOM
      const userEmail = document.getElementById('userEmail');
      if (userEmail) userEmail.textContent = '';
      
      // Reset the prompt history
      const promptHistory = document.getElementById('promptHistory');
      if (promptHistory) promptHistory.innerHTML = '';
      
      // ===== Clear chat inputs and outputs =====
      
      // Clear user input field
      const userInput = document.getElementById('userInput');
      if (userInput) {
        userInput.value = '';
        console.log('User input cleared');
      }
      
      // Clear generated prompt output
      const generatedPrompt = document.getElementById('generatedPrompt');
      if (generatedPrompt) {
        generatedPrompt.value = '';
        console.log('Generated prompt cleared');
      }
      
      // Hide output section if it's visible
      const outputSection = document.querySelector('.output-section');
      if (outputSection) {
        outputSection.style.display = 'none';
        outputSection.classList.remove('visible');
        console.log('Output section hidden');
      }
      
      // Reset prompt type selector to default
      const promptType = document.getElementById('promptType');
      if (promptType && promptType.options && promptType.options.length > 0) {
        promptType.selectedIndex = 0;
        console.log('Prompt type reset to default');
      }
      
      // Make sure edit button is reset to "Edit" state
      const editBtn = document.getElementById('editBtn');
      if (editBtn) {
        editBtn.textContent = 'Edit';
      }
      
      // Make sure generated prompt is readonly
      if (generatedPrompt) {
        generatedPrompt.readOnly = true;
      }

      // Make sure the guest prompt limit is restored
      window.resetGuestPromptCount = function() {
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 'guestPromptCount': 0 }, function() {
            console.log('Guest prompt count reset');
          });
        }
      };
      
      // Reset guest prompt count if we have the function
      if (window.resetGuestPromptCount) {
        window.resetGuestPromptCount();
        console.log('Guest prompt count reset by logout handler');
      }

      // Update the save button for guest mode
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) {
        saveBtn.setAttribute('data-guest', 'true');
        console.log('Save button updated for guest mode');
      }

      // Set the global guest mode flag
      window.isGuestMode = true;
      window.currentUser = null;
      console.log('Guest mode enabled');
      
      console.log('User session cleanup completed');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error cleaning up user session:', error);
      return Promise.reject(error);
    }
  }
});
