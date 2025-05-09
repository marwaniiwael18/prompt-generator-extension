document.addEventListener('DOMContentLoaded', function() {
    // Make sure auth and firebase are defined
    if (typeof window.auth === 'undefined') {
      console.error('Auth is not defined');
      window.auth = {
        onAuthStateChanged: (callback) => { callback(null); return () => {}; },
        signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
        createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
        signInWithPopup: () => Promise.resolve({ user: null }),
        signOut: () => Promise.resolve()
      };
    }
    
    if (typeof window.firebase === 'undefined') {
      console.error('Firebase is not defined');
      window.firebase = { 
        auth: { 
          GoogleAuthProvider: function() { 
            return { addScope: function() { return this; } }; 
          } 
        } 
      };
    }
    
    // Get all the required DOM elements with null checks
    const elements = {
      authContainer: document.getElementById('authContainer'),
      loginForm: document.getElementById('loginForm'),
      signupForm: document.getElementById('signupForm'),
      showSignup: document.getElementById('showSignup'),
      showLogin: document.getElementById('showLogin'),
      loginBtn: document.getElementById('loginBtn'),
      signupBtn: document.getElementById('signupBtn'),
      googleSignInBtn: document.getElementById('googleSignInBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      userInfo: document.getElementById('userInfo'),
      userEmail: document.getElementById('userEmail'),
      historySection: document.querySelector('.history-section'),
      guestInfo: document.querySelector('.guest-info'),
      promptHistory: document.getElementById('promptHistory'),
      saveBtn: document.getElementById('saveBtn'),
      forgotPasswordLink: document.getElementById('forgotPassword'),
      resetPasswordBtn: document.getElementById('resetPasswordBtn'),
      loginEmail: document.getElementById('loginEmail'),
      loginPassword: document.getElementById('loginPassword'),
      passwordField: document.querySelector('.password-field')
    };
    
    // Validate required elements exist
    const requiredElements = ['loginForm', 'signupForm', 'loginBtn', 'signupBtn', 'userInfo'];
    const missingElements = requiredElements.filter(key => !elements[key]);
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return; // Exit if required elements are missing
    }

    // Handle forgot password click with null checks
    if (elements.forgotPasswordLink && elements.passwordField && elements.loginBtn && elements.resetPasswordBtn) {
        elements.forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const heading = document.querySelector('#loginForm h2');
            if (!heading) return;

            // Update UI for password reset
            heading.innerHTML = '🔑 Reset Password';
            elements.passwordField.classList.add('hidden');
            elements.loginBtn.classList.add('hidden');
            elements.resetPasswordBtn.classList.remove('hidden');
            elements.forgotPasswordLink.textContent = 'Back to Login';
        });
    }

    // Handle back to login with null checks
    document.addEventListener('click', function(e) {
        if (e.target.matches('#forgotPassword') && e.target.textContent === 'Back to Login') {
            e.preventDefault();
            const heading = document.querySelector('#loginForm h2');
            if (!heading) return;

            // Reset UI back to login
            heading.innerHTML = '🔐 Sign In';
            elements.passwordField?.classList.remove('hidden');
            elements.loginBtn?.classList.remove('hidden');
            elements.resetPasswordBtn?.classList.add('hidden');
            if (elements.forgotPasswordLink) {
                elements.forgotPasswordLink.textContent = 'Forgot Password?';
            }
        }
    });

    // DOM elements for authentication
    const authContainer = document.getElementById('authContainer');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const historySection = document.querySelector('.history-section');
    const guestInfo = document.querySelector('.guest-info');
    const promptHistory = document.getElementById('promptHistory');
    const saveBtn = document.getElementById('saveBtn');
    
    // Sidebar elements
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const overlay = document.getElementById('overlay');
    
    // DOM elements for forgot password
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const backToLoginLink = document.getElementById('backToLogin');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const resetEmail = document.getElementById('resetEmail');
    
    // === AUTH HELPER FUNCTIONS ===
    
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
          
        case 'auth/invalid-login-credentials':
          showAuthErrorMessage('Invalid email or password. Please try again.');
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
          
        case 'auth/invalid-login-credentials':
          showAuthErrorMessage('Invalid email or password. Please try again.');
          break;
          
        default:
          showAuthErrorMessage('Authentication failed: ' + (error.message || 'Please try again.'));
      }
    };
    
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
    
    // Toggle sidebar
    menuBtn.addEventListener('click', function() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    });
    
    closeSidebar.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });

    // Toggle between login and signup forms with animations
    function switchToSignup(email = '') {
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
    
    // Toggle between login and signup forms
    showSignup.addEventListener('click', function(e) {
      e.preventDefault();
      switchToSignup();
    });
  
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      switchToLogin();
    });
  
    // Email/Password Login with improved validation
    loginBtn.addEventListener('click', function() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      if (!email || !password) {
        handleAuthError({ code: 'auth/missing-fields', message: 'Please enter both email and password' }, {
          loginForm, signupForm
        });
        return;
      }
      
      // Show loading state
      loginBtn.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
        </svg>
        Signing in...
      `;
      loginBtn.disabled = true;
      
      console.log('Attempting to sign in with email/password');
      
      // Make sure we have a valid auth object
      if (!auth || typeof auth.signInWithEmailAndPassword !== 'function') {
        console.error('Auth object is not properly initialized');
        handleAuthError({ 
          code: 'auth/initialization-error', 
          message: 'Authentication system not properly initialized. Please reload the extension.' 
        }, {
          loginBtn,
          signupBtn,
          showLogin,
          showSignup,
          loginForm,
          signupForm
        });
        return;
      }
      
      auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          console.log('User logged in successfully:', userCredential.user.email);
          // Reset guest prompt count on successful login
          if (window.resetGuestPromptCount) {
            console.log('Resetting guest prompt count');
            window.resetGuestPromptCount();
          }
          
          // Clear any existing generated content to start fresh
          const userInput = document.getElementById('userInput');
          if (userInput) userInput.value = '';
          const generatedPrompt = document.getElementById('generatedPrompt');
          if (generatedPrompt) generatedPrompt.value = '';
          
          // Hide output section for a clean slate
          const outputSection = document.querySelector('.output-section');
          if (outputSection) {
            outputSection.style.display = 'none';
            outputSection.classList.remove('visible');
          }
          
          // Close the sidebar after successful login
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        })
        .catch(error => {
          console.error('Login error:', error);
          
          // Use our global error handler with all required DOM elements
          handleAuthError(error, {
            loginBtn,
            signupBtn,
            showLogin,
            showSignup,
            loginForm,
            signupForm
          });
        });
    });
  
    // Email/Password Signup with better error handling
    signupBtn.addEventListener('click', function() {
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (!email || !password) {
        handleAuthError({ code: 'auth/missing-fields', message: 'Please enter email and password' }, {
          loginForm, signupForm
        });
        return;
      }
      
      if (password !== confirmPassword) {
        handleAuthError({ code: 'auth/passwords-dont-match', message: 'Passwords do not match' }, {
          loginForm, signupForm
        });
        return;
      }
      
      if (password.length < 6) {
        handleAuthError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' }, {
          loginForm, signupForm
        });
        return;
      }
      
      // Show loading state
      signupBtn.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
        </svg>
        Creating account...
      `;
      signupBtn.disabled = true;
      
      // Directly try to create the account - Firebase will handle existing email errors
      auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          // Account created successfully
          console.log('User signed up:', userCredential.user);
          
          // Initialize profile in Firestore
          if (window.firestoreData && window.firestoreData.saveUserProfile) {
            return window.firestoreData.saveUserProfile(userCredential.user.uid, {
              email: email,
              displayName: email.split('@')[0], // Simple display name from email
              createdAt: new Date().getTime() // Use timestamp for more consistent storage
            });
          }
          return userCredential;
        })
        .catch(error => {
          console.error('Signup error:', error);
          
          // Use our global error handler
          handleAuthError(error, {
            loginBtn,
            signupBtn,
            showLogin,
            showSignup,
            loginForm,
            signupForm
          });
        });
    });

    // Helper function to authenticate with Google using Firebase popup
    async function authenticateWithGoogle() {
      return new Promise((resolve, reject) => {
        try {
          console.log('Starting Firebase popup auth flow');
          
          // Create a Google auth provider
          const provider = new firebase.auth.GoogleAuthProvider();
          
          // Add scopes for profile and email
          provider.addScope('profile');
          provider.addScope('email');
          
          // Optional: Set custom parameters for the auth request
          provider.setCustomParameters({
            prompt: 'select_account'
          });
          
          // Sign in with popup (Firebase handles all redirect URI issues internally)
          auth.signInWithPopup(provider)
            .then(result => {
              console.log('Google sign-in successful via popup');
              resolve(result);
            })
            .catch(error => {
              console.error('Error during popup sign-in:', error);
              
              // Try fallback method if popup fails (e.g., if popups are blocked)
              if (error.code === 'auth/popup-blocked') {
                console.log('Popup was blocked, trying redirect method');
                
                // Use redirect method as fallback
                auth.signInWithRedirect(provider)
                  .then(() => {
                    // This won't execute until after the redirect returns
                    console.log('Redirect sign-in initiated');
                  })
                  .catch(redirectError => {
                    console.error('Redirect sign-in error:', redirectError);
                    reject(redirectError);
                  });
              } else {
                reject(error);
              }
            });
        } catch (error) {
          console.error('Error setting up authentication:', error);
          reject(error);
        }
      });
    }

    // Google Sign In Button - Now using Firebase popup
    googleSignInBtn.addEventListener('click', function() {
      // Show loading state
      googleSignInBtn.disabled = true;
      googleSignInBtn.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
        </svg>
        Signing in...
      `;
      
      // Use our new Firebase popup method
      authenticateWithGoogle()
        .then(result => {
          console.log('Google sign in successful:', result.user);
          // Reset guest prompt count on successful login
          if (window.resetGuestPromptCount) {
            window.resetGuestPromptCount();
          }
          // Close the sidebar after successful login
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        })
        .catch(error => {
          console.error('Google sign in error:', error);
          
          // Reset button state
          googleSignInBtn.disabled = false;
          googleSignInBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#DB4437">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Sign in with Google
          `;
          
          // Show a more specific error message for common errors
          let errorMessage = 'Google sign in failed. ';
          
          if (error.message && error.message.includes('redirect_uri_mismatch')) {
            errorMessage += 'Please check the redirect URI configuration in your Firebase project.';
          } else if (error.message && error.message.includes('The user closed the popup')) {
            errorMessage += 'You closed the sign-in window. Please try again.';
          } else {
            errorMessage += error.message || 'Please try again.';
          }
          
          // Display the error message using our error handler
          handleAuthError({ 
            code: 'auth/google-signin-failed', 
            message: errorMessage 
          }, {
            loginForm, 
            signupForm
          });
        });
    });
  
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
      auth.signOut()
        .then(() => {
          console.log('User signed out');
          // Auth state change listener will handle UI update
        })
        .catch(error => {
          console.error('Sign out error:', error);
        });
    });
  
    // Auth state change listener - updated for guest mode
    auth.onAuthStateChanged(user => {
      // Always hide all auth-related UI first
      loginForm.classList.add('hidden');
      signupForm.classList.add('hidden');
      userInfo.classList.add('hidden');
      historySection.classList.add('hidden');
      guestInfo.classList.add('hidden');
      // Always close sidebar and overlay on auth state change
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      
      if (user) {
        // User is signed in
        userInfo.classList.remove('hidden'); // Only show when signed in
        historySection.classList.remove('hidden');
        saveBtn.removeAttribute('data-guest');
        userEmail.textContent = user.email;
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        loadUserPrompts(user.uid);
        window.isGuestMode = false;
        window.currentUser = user;
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = 'Generate Prompt';
        }
      } else {
        // User is signed out - Guest Mode
        userInfo.classList.add('hidden'); // Always hide when signed out
        historySection.classList.add('hidden');
        loginForm.classList.remove('hidden');
        guestInfo.classList.remove('hidden');
        // Update save button to show login prompt
        saveBtn.setAttribute('data-guest', 'true');
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        loginBtn.innerHTML = `
          <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          Sign In
        `;
        loginBtn.disabled = false;
        signupBtn.innerHTML = `
          <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Create Account
        `;
        signupBtn.disabled = false;
        window.isGuestMode = true;
        window.currentUser = null;
      }
    });
  
    // Load user's saved prompts from Firestore with enhanced visuals
    function loadUserPrompts(userId) {
      console.log("Loading prompts for user:", userId);
      
      // Clear existing history
      if (!promptHistory) {
        console.error("promptHistory element not found");
        return;
      }
      
      promptHistory.innerHTML = '';
      
      // Get user's prompts from Firestore
      try {
        console.log("Fetching prompts from collection path:", `users/${userId}/prompts`);
        
        db.collection('users').doc(userId).collection('prompts')
          .orderBy('timestamp', 'desc')
          .limit(10)
          .get()
          .then(snapshot => {
            console.log("Firestore query returned, empty:", snapshot.empty);
            
            if (snapshot.empty) {
              promptHistory.innerHTML = `
                <li class="empty-history">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p style="text-align:center;color:#888;">No saved prompts yet</p>
                </li>`;
              return;
            }
            
            snapshot.forEach(doc => {
              try {
                const promptData = doc.data();
                const promptId = doc.id;
                
                // Handle missing timestamp
                let dateText = "Unknown date";
                if (promptData.timestamp) {
                  if (promptData.timestamp.toDate) {
                    dateText = formatDate(promptData.timestamp.toDate());
                  } else if (promptData.timestamp instanceof Date) {
                    dateText = formatDate(promptData.timestamp);
                  } else if (promptData.createdAt) {
                    // Use fallback createdAt timestamp if available
                    dateText = formatDate(new Date(promptData.createdAt));
                  }
                }
                
                // Get icon based on prompt type
                const typeIcon = getPromptTypeIcon(promptData.type || 'unknown');
                
                const li = document.createElement('li');
                li.dataset.promptId = promptId; // Store prompt ID for later use
                li.innerHTML = `
                  <div class="prompt-item">
                    <div class="prompt-content">
                      <span class="prompt-type">${typeIcon} ${promptData.type || 'unknown'}</span>
                      ${truncateText(promptData.content || 'No content', 30)}
                      <span class="prompt-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${dateText}
                      </span>
                    </div>
                    <button class="delete-prompt-btn" title="Delete this prompt">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                `;
                
                // Add click handler to load this prompt
                const promptContent = li.querySelector('.prompt-content');
                promptContent.addEventListener('click', function() {
                  document.getElementById('generatedPrompt').value = promptData.content;
                  const outputSection = document.querySelector('.output-section');
                  outputSection.style.display = 'block';
                  outputSection.classList.add('visible');
                  
                  // Also update the prompt type dropdown to match this prompt's type
                  const promptTypeSelect = document.getElementById('promptType');
                  if (promptTypeSelect && promptData.type) {
                    // Try to find a matching option
                    Array.from(promptTypeSelect.options).forEach(option => {
                      if (option.value === promptData.type) {
                        promptTypeSelect.value = promptData.type;
                      }
                    });
                  }
                });
                
                // Add delete handler
                const deleteBtn = li.querySelector('.delete-prompt-btn');
                deleteBtn.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent triggering the parent click
                  deletePrompt(userId, promptId);
                });
                
                promptHistory.appendChild(li);
              } catch (err) {
                console.error("Error processing prompt document:", err);
              }
            });
          })
          .catch(error => {
            console.error('Error loading prompts:', error);
            promptHistory.innerHTML = `
              <li class="error-history">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p style="text-align:center;color:#ff6b6b;">Error loading prompts</p>
              </li>`;
          });
      } catch (error) {
        console.error("Error in loadUserPrompts:", error);
        promptHistory.innerHTML = '<li style="text-align:center;color:#ff6b6b;">Error loading prompts</li>';
      }
    }
    
    // Function to delete a prompt with animation
    function deletePrompt(userId, promptId) {
      if (!userId || !promptId) {
        console.error('Missing userId or promptId for deletion');
        return;
      }
      
      // Ask for confirmation
      if (!confirm('Are you sure you want to delete this prompt?')) {
        return;
      }
      
      // Show loading state on the item
      const promptItem = document.querySelector(`li[data-prompt-id="${promptId}"]`);
      if (promptItem) {
        promptItem.classList.add('deleting');
      }
      
      // Delete the prompt from Firestore
      db.collection('users').doc(userId).collection('prompts').doc(promptId).delete()
        .then(() => {
          console.log('Prompt deleted successfully');
          
          // Remove the item from DOM with animation
          if (promptItem) {
            promptItem.style.height = promptItem.offsetHeight + 'px';
            promptItem.classList.add('deleted');
            
            // After animation completes, remove the element
            setTimeout(() => {
              promptItem.remove();
              
              // If no prompts left, show the empty message
              if (promptHistory.children.length === 0) {
                promptHistory.innerHTML = `
                  <li class="empty-history">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p style="text-align:center;color:#888;">No saved prompts yet</p>
                  </li>`;
              }
            }, 300);
          } else {
            // If we can't find the element, reload all prompts
            loadUserPrompts(userId);
          }
        })
        .catch(error => {
          console.error('Error deleting prompt:', error);
          alert('Failed to delete prompt: ' + error.message);
          
          // Remove loading state
          if (promptItem) {
            promptItem.classList.remove('deleting');
          }
        });
    }

    // Get appropriate icon for prompt type
    function getPromptTypeIcon(type) {
      const iconMap = {
        'question': '❓',
        'creative': '🎨',
        'coding': '💻',
        'explanation': '📚',
        'brainstorm': '🧠',
        'unknown': '📝'
      };
      
      return iconMap[type] || '📝';
    }
    
    // Helper function to truncate text
    function truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    }
  
    // Helper function to format date
    function formatDate(date) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Export utilities and key functions
    window.authUtils = {
      checkUserExists: window.checkEmailExists,
      switchToSignup,
      switchToLogin
    };
    
    // Make loadUserPrompts available globally
    window.loadUserPrompts = loadUserPrompts;
    window.deletePrompt = deletePrompt;

    // Switch to password reset form
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get email from login form if available
        const loginEmail = document.getElementById('loginEmail').value;
        
        loginForm.style.opacity = '0';
        loginForm.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            loginForm.classList.add('hidden');
            resetPasswordForm.classList.remove('hidden');
            
            // Pre-fill email if available
            if (loginEmail) {
                resetEmail.value = loginEmail;
            }
            
            setTimeout(() => {
                resetPasswordForm.style.opacity = '1';
                resetPasswordForm.style.transform = 'translateY(0)';
                resetEmail.focus();
            }, 50);
        }, 200);
    });

    // Back to login form
    backToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        resetPasswordForm.style.opacity = '0';
        resetPasswordForm.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            resetPasswordForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            
            setTimeout(() => {
                loginForm.style.opacity = '1';
                loginForm.style.transform = 'translateY(0)';
            }, 50);
        }, 200);
    });

    // Handle password reset request
    resetPasswordBtn.addEventListener('click', async function() {
        const email = resetEmail.value.trim();
        
        if (!email) {
            handleAuthError({ 
                code: 'auth/missing-email', 
                message: 'Please enter your email address'
            }, {
                loginForm, 
                signupForm,
                resetPasswordForm
            });
            return;
        }

        // Show loading state
        resetPasswordBtn.innerHTML = `
            <svg class="loading-spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
            </svg>
            Sending...
        `;
        resetPasswordBtn.disabled = true;

        try {
            await auth.sendPasswordResetEmail(email);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Reset link sent! Please check your email
            `;
            
            resetPasswordForm.insertBefore(successMsg, resetPasswordBtn);
            
            // Return to login form after 3 seconds
            setTimeout(() => {
                backToLoginLink.click();
                // Remove success message after transition
                setTimeout(() => successMsg.remove(), 300);
            }, 3000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Reset button state
            resetPasswordBtn.innerHTML = `
                <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Send Reset Link
            `;
            resetPasswordBtn.disabled = false;
            
            // Show error using our error handler
            handleAuthError(error, {
                loginForm, 
                signupForm,
                resetPasswordForm
            });
        }
    });

    // Handle forgot password click
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const passwordField = document.querySelector('.password-field');
        const loginBtn = document.getElementById('loginBtn');
        const resetPasswordBtn = document.getElementById('resetPasswordBtn');
        const forgotPasswordLink = document.getElementById('forgotPassword');
        const heading = document.querySelector('#loginForm h2');
        const original = {
            text: heading.innerHTML,
            height: passwordField.offsetHeight
        };

        // Update UI for password reset
        heading.innerHTML = '🔑 Reset Password';
        passwordField.classList.add('hidden');
        loginBtn.classList.add('hidden');
        resetPasswordBtn.classList.remove('hidden');
        forgotPasswordLink.textContent = 'Back to Login';
    });

    // Handle back to login
    document.addEventListener('click', function(e) {
        if (e.target.matches('#forgotPassword') && e.target.textContent === 'Back to Login') {
            e.preventDefault();
            const passwordField = document.querySelector('.password-field');
            const loginBtn = document.getElementById('loginBtn');
            const resetPasswordBtn = document.getElementById('resetPasswordBtn');
            const forgotPasswordLink = document.getElementById('forgotPassword');
            const heading = document.querySelector('#loginForm h2');

            // Reset UI back to login
            heading.innerHTML = '🔐 Sign In';
            passwordField.classList.remove('hidden');
            loginBtn.classList.remove('hidden');
            resetPasswordBtn.classList.add('hidden');
            forgotPasswordLink.textContent = 'Forgot Password?';
        }
    });

    // Handle reset password request
    resetPasswordBtn.addEventListener('click', async function() {
        const email = document.getElementById('loginEmail').value.trim();
        
        if (!email) {
            handleAuthError({ 
                code: 'auth/missing-email', 
                message: 'Please enter your email address'
            }, {
                loginForm,
                signupForm
            });
            return;
        }

        // Show loading state
        resetPasswordBtn.innerHTML = `
            <svg class="loading-spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
            </svg>
            Sending...
        `;
        resetPasswordBtn.disabled = true;

        try {
            await auth.sendPasswordResetEmail(email);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Reset link sent! Please check your email
            `;
            
            loginForm.insertBefore(successMsg, loginForm.querySelector('button'));
            
            // Return to login form after 3 seconds
            setTimeout(() => {
                const passwordField = document.querySelector('.password-field');
                const loginBtn = document.getElementById('loginBtn');
                const resetPasswordBtn = document.getElementById('resetPasswordBtn');
                const forgotPasswordLink = document.getElementById('forgotPassword');
                const heading = document.querySelector('#loginForm h2');

                // Reset UI back to login
                heading.innerHTML = '🔐 Sign In';
                passwordField.classList.remove('hidden');
                loginBtn.classList.remove('hidden');
                resetPasswordBtn.classList.add('hidden');
                forgotPasswordLink.textContent = 'Forgot Password?';
                
                // Reset button state
                resetPasswordBtn.innerHTML = `
                    <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Send Reset Link
                `;
                resetPasswordBtn.disabled = false;
                
                // Remove success message after transition
                setTimeout(() => successMsg.remove(), 300);
            }, 3000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Reset button state
            resetPasswordBtn.innerHTML = `
                <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Send Reset Link
            `;
            resetPasswordBtn.disabled = false;
            
            // Show error using our error handler
            handleAuthError(error, {
                loginForm,
                signupForm
            });
        }
    });
});