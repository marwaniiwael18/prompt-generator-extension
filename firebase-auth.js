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
    const appContent = document.getElementById('appContent');
    const promptHistory = document.getElementById('promptHistory');
    const historySection = document.querySelector('.history-section');
  
    // Toggle between login and signup forms
    showSignup.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
    });
  
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  
    // Email/Password Login
    loginBtn.addEventListener('click', function() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      if (!email || !password) {
        showAuthError('Please enter both email and password');
        return;
      }
      
      // Show loading state
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;
      
      auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          console.log('User logged in:', userCredential.user);
          // Auth state change listener will handle UI update
        })
        .catch(error => {
          console.error('Login error:', error);
          showAuthError(getAuthErrorMessage(error.code));
          loginBtn.textContent = 'Sign In';
          loginBtn.disabled = false;
        });
    });
  
    // Email/Password Signup
    signupBtn.addEventListener('click', function() {
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
      }
      
      if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        showAuthError('Password should be at least 6 characters');
        return;
      }
      
      // Show loading state
      signupBtn.textContent = 'Creating account...';
      signupBtn.disabled = true;
      
      auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          console.log('User signed up:', userCredential.user);
          // Auth state change listener will handle UI update
        })
        .catch(error => {
          console.error('Signup error:', error);
          showAuthError(getAuthErrorMessage(error.code));
          signupBtn.textContent = 'Create Account';
          signupBtn.disabled = false;
        });
    });
  
    // Update the Google Sign In function to use Chrome Identity API if available
    googleSignInBtn.addEventListener('click', function() {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add required scopes for profile access
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        
        console.log('Attempting Google sign-in with provider:', provider);
        
        // Show loading state
        googleSignInBtn.disabled = true;
        googleSignInBtn.innerHTML = `
          <svg class="loading-spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
          </svg>
          Signing in...
        `;
        
        auth.signInWithPopup(provider)
          .then(result => {
            console.log('Google sign in successful:', result.user);
            // Auth state change listener will handle UI update
          })
          .catch(error => {
            console.error('Google sign in error:', error);
            showAuthError('Google sign in failed: ' + (error.message || 'Please try again.'));
          })
          .finally(() => {
            // Reset button state
            googleSignInBtn.disabled = false;
            googleSignInBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#DB4437">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Sign in with Google
            `;
          });
      } catch(e) {
        console.error('Error during Google sign in setup:', e);
        showAuthError('Google sign in is not available right now.');
      }
    });
  
    // Logout
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
  
    // Auth state change listener
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        console.log('Auth state changed: User is signed in', user);
        authContainer.classList.add('hidden');
        userInfo.classList.remove('hidden');
        appContent.classList.remove('hidden');
        historySection.classList.remove('hidden');
        
        userEmail.textContent = user.email;
        
        // Reset login form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        // Load user's prompt history
        loadUserPrompts(user.uid);
      } else {
        // User is signed out
        console.log('Auth state changed: User is signed out');
        authContainer.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        userInfo.classList.add('hidden');
        appContent.classList.add('hidden');
        historySection.classList.add('hidden');
        
        // Reset signup form
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Reset login button
        loginBtn.textContent = 'Sign In';
        loginBtn.disabled = false;
        
        // Reset signup button
        signupBtn.textContent = 'Create Account';
        signupBtn.disabled = false;
      }
    });
  
    // Helper function to show authentication errors
    function showAuthError(message) {
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
      if (!loginForm.classList.contains('hidden')) {
        loginForm.appendChild(errorElement);
      } else {
        signupForm.appendChild(errorElement);
      }
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        errorElement.remove();
      }, 4000);
    }
  
    // Helper function to get readable error messages
    function getAuthErrorMessage(errorCode) {
      switch (errorCode) {
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/user-not-found':
          return 'No account found with this email.';
        case 'auth/email-already-in-use':
          return 'Email already in use. Try logging in instead.';
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/weak-password':
          return 'Password is too weak. Use at least 6 characters.';
        default:
          return 'Authentication failed. Please try again.';
      }
    }
  
    // Load user's saved prompts from Firestore
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
              promptHistory.innerHTML = '<li style="text-align:center;color:#888;">No saved prompts yet</li>';
              return;
            }
            
            snapshot.forEach(doc => {
              try {
                const promptData = doc.data();
                console.log("Processing prompt document:", doc.id, promptData);
                
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
                
                const li = document.createElement('li');
                li.innerHTML = `
                  <span class="prompt-type">${promptData.type || 'unknown'}</span>
                  ${truncateText(promptData.content || 'No content', 30)}
                  <span class="prompt-date">${dateText}</span>
                `;
                
                // Add click handler to load this prompt
                li.addEventListener('click', function() {
                  document.getElementById('generatedPrompt').value = promptData.content;
                  const outputSection = document.querySelector('.output-section');
                  outputSection.style.display = 'block';
                  outputSection.classList.add('visible');
                });
                
                promptHistory.appendChild(li);
              } catch (err) {
                console.error("Error processing prompt document:", err);
              }
            });
          })
          .catch(error => {
            console.error('Error loading prompts:', error);
            promptHistory.innerHTML = '<li style="text-align:center;color:#ff6b6b;">Error loading prompts</li>';
          });
      } catch (error) {
        console.error("Error in loadUserPrompts:", error);
        promptHistory.innerHTML = '<li style="text-align:center;color:#ff6b6b;">Error loading prompts</li>';
      }
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
    
    // Make loadUserPrompts available globally
    window.loadUserPrompts = loadUserPrompts;
  });