document.addEventListener('DOMContentLoaded', function() {
    // Ensure auth and db are defined
    if (typeof window.auth === 'undefined') {
      console.error('Auth is not defined in popup.js');
      window.auth = {
        onAuthStateChanged: (callback) => { callback(null); return () => {}; },
        signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
        createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
        signOut: () => Promise.resolve()
      };
    }
    
    if (typeof window.db === 'undefined') {
      console.error('Firestore db is not defined in popup.js');
      window.db = {
        collection: () => ({
          doc: () => ({
            collection: () => ({}),
            get: () => Promise.resolve({ exists: false, data: () => ({}) }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve()
          }),
          add: () => Promise.resolve(),
          orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }) }),
          where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) })
        })
      };
    }

    // DOM elements
    const userInput = document.getElementById('userInput');
    const promptType = document.getElementById('promptType');
    const generateBtn = document.getElementById('generateBtn');
    const generatedPrompt = document.getElementById('generatedPrompt');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editBtn = document.getElementById('editBtn');
    const usePromptBtn = document.getElementById('usePromptBtn');
    const outputSection = document.querySelector('.output-section');
    const sidebar = document.getElementById('sidebar');
    
    // Track current user and guest mode
    window.isGuestMode = true; // Default to guest mode
    window.currentUser = null;
    
    // Guest usage tracking constants
    const GUEST_PROMPT_LIMIT = 6;
    const GUEST_COUNT_KEY = 'guestPromptCount';
    let guestPromptCount = 0;
    
    // Load guest usage count from storage
    chrome.storage.local.get([GUEST_COUNT_KEY], function(result) {
      guestPromptCount = result[GUEST_COUNT_KEY] || 0;
      updateGuestLimitDisplay();
    });
    
    // Function to update guest limit display
    function updateGuestLimitDisplay() {
      const guestLimitElement = document.getElementById('guestLimitCounter');
      if (guestLimitElement) {
        if (window.isGuestMode) {
          guestLimitElement.textContent = `${guestPromptCount}/${GUEST_PROMPT_LIMIT} prompts used`;
          
          if (guestPromptCount >= GUEST_PROMPT_LIMIT) {
            guestLimitElement.classList.add('limit-reached');
            generateBtn.disabled = true;
            generateBtn.textContent = 'Limit Reached - Please Sign In';
            // Show guest limit message
            document.getElementById('guestLimitMessage').classList.remove('hidden');
            
            // Ensure the login button in the message is properly set up
            const loginFromMessage = document.getElementById('loginFromMessage');
            if (loginFromMessage) {
              loginFromMessage.onclick = function() {
                sidebar.classList.add('open');
                document.getElementById('overlay').classList.add('active');
                // Focus on the login email field
                setTimeout(() => document.getElementById('loginEmail').focus(), 300);
              };
            }
          } else {
            guestLimitElement.classList.remove('limit-reached');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Prompt';
            // Hide guest limit message
            document.getElementById('guestLimitMessage').classList.add('hidden');
          }
          
          document.getElementById('guestLimitContainer').classList.remove('hidden');
        } else {
          // User is logged in - reset UI elements
          document.getElementById('guestLimitContainer').classList.add('hidden');
          document.getElementById('guestLimitMessage').classList.add('hidden');
          generateBtn.disabled = false;
          generateBtn.textContent = 'Generate Prompt';
        }
      }
    }
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
      window.currentUser = user;
      window.isGuestMode = !user;
      console.log("Auth state changed in popup.js, guest mode:", window.isGuestMode);

      // Show/hide userInfo section based on login state
      const userInfo = document.getElementById('userInfo');
      if (userInfo) {
        if (user) {
          userInfo.classList.remove('hidden');
        } else {
          userInfo.classList.add('hidden');
        }
      }
      // Show/hide logout icon button in header
      const popupLogoutBtn = document.getElementById('popupLogoutBtn');
      if (popupLogoutBtn) {
        if (user) {
          popupLogoutBtn.classList.remove('hidden');
        } else {
          popupLogoutBtn.classList.add('hidden');
        }
      }
      
      if (!window.isGuestMode) {
        // User just logged in - reset the guest count
        resetGuestPromptCount();
      }
      
      // Update guest limit display when auth state changes
      updateGuestLimitDisplay();
      
      // Update save button state
      updateSaveButtonState();
      
      // Enable generate button if user is logged in
      if (!window.isGuestMode) {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Prompt';
        // Hide guest limit message
        document.getElementById('guestLimitMessage').classList.add('hidden');
      }
    });
    
    function updateSaveButtonState() {
      if (window.isGuestMode) {
        saveBtn.setAttribute('data-guest', 'true');
        saveBtn.addEventListener('click', promptLogin);
        saveBtn.removeEventListener('click', handleSavePrompt);
      } else {
        saveBtn.removeAttribute('data-guest');
        saveBtn.removeEventListener('click', promptLogin);
        saveBtn.addEventListener('click', handleSavePrompt);
      }
    }
    
    function promptLogin() {
      // Open sidebar when login is needed
      sidebar.classList.add('open');
      document.getElementById('overlay').classList.add('active');
      
      // Focus on the email input field for better UX
      setTimeout(() => {
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.focus();
      }, 300);
      
      alert('Please sign in to save prompts');
    }
    
    // Define the missing handleSavePrompt function
    function handleSavePrompt() {
      const promptToSave = generatedPrompt.value.trim();
      if (!promptToSave) {
        alert('No prompt to save');
        return;
      }
      
      if (!currentUser) {
        alert('Please sign in to save prompts');
        return;
      }
      
      savePromptToFirebase(promptToSave, promptType.value);
    }
  
    // Generate prompt functionality
    generateBtn.addEventListener('click', async function() {
      const input = userInput.value.trim();
      if (!input) {
        alert('Please enter what you want to ask or request.');
        return;
      }
      
      // Only check guest limit if in guest mode
      if (window.isGuestMode && guestPromptCount >= GUEST_PROMPT_LIMIT) {
        promptLogin();
        return;
      }
  
      try {
        // Show loading state
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
  
        // Call Google AI Studio API
        const optimizedPrompt = await callGoogleAI(input, promptType.value);
        
        // Update the textarea with the result and ensure it's visible
        generatedPrompt.value = optimizedPrompt;
        
        // Make output section visible - FIX: Set display style directly before adding class
        outputSection.style.display = 'block';
        outputSection.classList.remove('hidden');
        setTimeout(() => {
          outputSection.classList.add('visible');
        }, 10);
        
        console.log('Output section should be visible now:', outputSection);
        
        // Only increment guest usage count if in guest mode
        if (window.isGuestMode) {
          guestPromptCount++;
          chrome.storage.local.set({ [GUEST_COUNT_KEY]: guestPromptCount }, function() {
            console.log('Guest prompt count updated to:', guestPromptCount);
            updateGuestLimitDisplay();
          });
        }
        
        // ENHANCEMENT: Auto-save the generated prompt if user is logged in
        if (currentUser) {
          savePromptToFirebase(optimizedPrompt, promptType.value);
        }

        // Track prompt generation for analytics
        if (window.firestoreData && window.firestoreData.trackPromptGeneration) {
          const userId = window.isGuestMode ? null : currentUser.uid;
          window.firestoreData.trackPromptGeneration(userId, {
            type: promptType.value
          }).catch(err => console.log('Error tracking prompt generation:', err));
        }
      } catch (error) {
        alert('Error generating prompt: ' + error.message);
        console.error(error);
      } finally {
        generateBtn.textContent = 'Generate Prompt';
        generateBtn.disabled = false;
        
        // Re-check the limit only if in guest mode
        if (window.isGuestMode && guestPromptCount >= GUEST_PROMPT_LIMIT) {
          generateBtn.disabled = true;
          generateBtn.textContent = 'Limit Reached - Please Sign In';
        }
      }
    });
    
    // Reset guest prompt count when signing in
    function resetGuestPromptCount() {
      guestPromptCount = 0;
      chrome.storage.local.set({ [GUEST_COUNT_KEY]: 0 }, function() {
        console.log('Guest prompt count reset');
        // Update UI after resetting count
        updateGuestLimitDisplay();
      });
    }
  
    // Make resetGuestPromptCount available globally
    window.resetGuestPromptCount = resetGuestPromptCount;
  
    // Copy button functionality
    copyBtn.addEventListener('click', function() {
      generatedPrompt.select();
      document.execCommand('copy');
  
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1500);
    });
  
    // Use prompt on website functionality
    usePromptBtn.addEventListener('click', function() {
      const promptText = generatedPrompt.value.trim();
      if (!promptText) return;
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "insertPrompt", prompt: promptText },
            function(response) {
              if (response && response.success) {
                const originalText = usePromptBtn.textContent;
                usePromptBtn.textContent = 'Inserted!';
                setTimeout(() => {
                  usePromptBtn.textContent = originalText;
                }, 1500);
              } else {
                alert('Could not insert prompt. Please try again or make sure you\'re on a compatible website.');
              }
            }
          );
        }
      });
    });
  
    // Check for selected text from context menu
    chrome.storage.local.get('selectedText', function(data) {
      if (data.selectedText) {
        userInput.value = data.selectedText;
        // Clear the stored text
        chrome.storage.local.remove('selectedText');
      }
    });
  
    // Save button functionality - Updated to use firestore-data-structure.js
    saveBtn.addEventListener('click', function() {
      const promptToSave = generatedPrompt.value.trim();
      if (!promptToSave) {
        alert('No prompt to save');
        return;
      }
      
      if (!currentUser) {
        alert('Please sign in to save prompts');
        return;
      }
      
      savePromptToFirebase(promptToSave, promptType.value);
    });
    
    // Helper function to save prompt to Firebase - Updated to use the new structure
    function savePromptToFirebase(promptContent, promptType) {
      console.log("Attempting to save prompt to Firebase for user:", currentUser.uid);
      
      // Create the discussion data object
      const discussionData = {
        type: promptType,
        content: promptContent,
        userInput: userInput.value.trim(),
        source: 'extension'
      };
      
      // First try to use our new firestore-data-structure.js
      if (window.firestoreData && window.firestoreData.saveDiscussion) {
        window.firestoreData.saveDiscussion(currentUser.uid, discussionData)
          .then(id => {
            if (id) {
              console.log("Prompt saved successfully with ID:", id);
              // Visual feedback
              const originalText = saveBtn.textContent;
              saveBtn.textContent = 'Saved!';
              setTimeout(() => {
                saveBtn.textContent = originalText;
              }, 1500);
              
              // Track usage statistics
              if (window.firestoreData.trackPromptGeneration) {
                window.firestoreData.trackPromptGeneration(currentUser.uid, {
                  type: promptType
                });
              }
              
              // Reload the prompt history
              if (window.loadUserPrompts) {
                window.loadUserPrompts(currentUser.uid);
              }
            } else {
              throw new Error("Failed to get discussion ID");
            }
          })
          .catch(error => {
            console.error('Error saving prompt using new structure:', error);
            // Fall back to old method
            saveLegacyPrompt(promptContent, promptType);
          });
      } else {
        // Fall back to the old method if new structure not available
        saveLegacyPrompt(promptContent, promptType);
      }
    }
    
    // Legacy save function for backward compatibility
    function saveLegacyPrompt(promptContent, promptType) {
      let timestamp;
      try {
        // Create timestamp based on what's available
        if (window.firebase && window.firebase.firestore && 
            typeof window.firebase.firestore.FieldValue !== 'undefined' && 
            typeof window.firebase.firestore.FieldValue.serverTimestamp === 'function') {
          timestamp = firebase.firestore.FieldValue.serverTimestamp();
          console.log("Using Firebase server timestamp");
        } else {
          timestamp = new Date();
          console.log("Using local Date object for timestamp");
        }
        
        // Reference to the user's prompts collection
        const userPromptsRef = db.collection('users').doc(currentUser.uid).collection('prompts');
        
        // Add the document to the collection
        userPromptsRef.add({
          type: promptType,
          content: promptContent,
          timestamp: timestamp,
          createdAt: new Date().getTime() // Fallback timestamp as milliseconds
        })
        .then(docRef => {
          console.log("Prompt saved successfully with ID:", docRef.id);
          
          // Visual feedback
          const originalText = saveBtn.textContent;
          saveBtn.textContent = 'Saved!';
          setTimeout(() => {
            saveBtn.textContent = originalText;
          }, 1500);
          
          // Reload the prompt history
          if (window.loadUserPrompts) {
            window.loadUserPrompts(currentUser.uid);
          } else {
            console.warn("loadUserPrompts function not found");
          }
        })
        .catch(error => {
          console.error('Error saving prompt (promise rejection):', error);
          alert('Error saving prompt: ' + error.message);
        });
      } catch (e) {
        console.error('Error in savePromptToFirebase:', e);
        alert('Could not save the prompt: ' + e.message);
      }
    }
  
    // Edit button functionality
    editBtn.addEventListener('click', function() {
      generatedPrompt.readOnly = !generatedPrompt.readOnly;
      if (generatedPrompt.readOnly) {
        editBtn.textContent = 'Edit';
      } else {
        editBtn.textContent = 'Done';
        generatedPrompt.focus();
      }
    });
  
    // Your API call function
    async function callGoogleAI(input, type) {
      const apiKey = 'AIzaSyCW6cXEBtj-SukSB2nmb6rh5qoTE0Qylz4';
      
      // Create a more structured prompt template based on the example
      const userPrompt = `Transform this input into a professional, well-structured ${type} prompt for AI assistants:
      
  Input: "${input}"
  
  Your response should follow this exact format:
  **Prompt:** [A clear, direct prompt that instructs the AI how to respond, including specific instructions and format expectations]
  
  Include:
  1. Role assignment for the AI (e.g., "You are an expert in...")
  2. Specific instructions on how to respond
  3. Required components/structure for the response
  4. Examples if helpful
  5. Any constraints or specific requirements
  
  Do NOT include any explanatory text, options, or additional content outside of the prompt itself.
  Craft this as if it were a professional prompt template for immediate use.`;
  
      try {
        console.log('Calling API with prompt:', userPrompt);
        
        // Streamlined URL construction
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
        
        // Set timeout for fetch to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: userPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          }),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
  
        // Log response status for debugging
        console.log('API Response status:', response.status);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          
          // More specific error message based on response status
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few moments.');
          } else if (response.status === 403) {
            throw new Error('API key invalid or quota exceeded. Please check your API key.');
          } else if (response.status === 0 || !navigator.onLine) {
            throw new Error('Network connection lost. Please check your internet connection.');
          } else {
            throw new Error(`API error (${response.status}): ${response.statusText}`);
          }
        }
  
        const data = await response.json();
        
        // Extract the generated text from the candidates array
        if (data.candidates && data.candidates.length > 0) {
          const generatedCandidate = data.candidates[0];
          
          // Directly access text content with fallbacks for different response structures
          let generatedText;
          if (generatedCandidate.content && generatedCandidate.content.parts && generatedCandidate.content.parts.length > 0) {
            generatedText = generatedCandidate.content.parts[0].text;
            return cleanStructuredPromptOutput(generatedText);
          } else if (generatedCandidate.output) {
            return cleanStructuredPromptOutput(generatedCandidate.output);
          } else if (generatedCandidate.text) {
            return cleanStructuredPromptOutput(generatedCandidate.text);
          } else {
            throw new Error('Could not extract generated text from response.');
          }
        } else {
          throw new Error('No content generated. Please try again with a clearer request.');
        }
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // More specific error messages
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        } else if (!navigator.onLine) {
          throw new Error('You appear to be offline. Please check your internet connection.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else {
          throw error; // Keep original error if it's already specific
        }
      }
    }
  
    // Helper for cleaning output
    function cleanStructuredPromptOutput(text) {
      // Keep only content starting with "**Prompt:**"
      const promptMatch = text.match(/\*\*Prompt:\*\*([\s\S]*$)/);
      if (promptMatch && promptMatch[1]) {
        text = "**Prompt:**" + promptMatch[1];
      }
      
      // Remove extra explanations after the prompt content
      const explanationPatterns = [
        /\n\nNote:[\s\S]*$/i,
        /\n\nExplanation:[\s\S]*$/i,
        /\n\nThis prompt:[\s\S]*$/i,
        /\n\nThe above prompt[\s\S]*$/i
      ];
      
      explanationPatterns.forEach(pattern => {
        text = text.replace(pattern, '');
      });
      
      // Ensure proper formatting with numbers and bullets
      text = text.replace(/(\d+\.)([^\n])/g, '$1 $2');
      
      return text.trim();
    }
  
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  
    // Improved function to show the output section
    function showOutputSection() {
      // Ensure the output section is visible
      outputSection.style.display = 'block';
      // Remove hidden class if present
      outputSection.classList.remove('hidden');
      
      // Force browser reflow
      void outputSection.offsetWidth;
      
      // Add visible class for animation
      setTimeout(() => {
        outputSection.classList.add('visible');
      }, 10);
    }

    // Initialize click handler for popup logout button
    const popupLogoutBtn = document.getElementById('popupLogoutBtn');
    if (popupLogoutBtn) {
      popupLogoutBtn.addEventListener('click', function() {
        // Call Firebase signOut
        if (window.auth) {
          window.auth.signOut()
            .then(() => {
              console.log('User signed out from header button');
              // Auth state change listener will handle UI update
            })
            .catch(error => {
              console.error('Sign out error:', error);
              alert('Error signing out. Please try again.');
            });
        }
      });
    }

    // Handle subscription button click
    const subscriptionBtn = document.getElementById('subscriptionBtn');
    if (subscriptionBtn) {
        subscriptionBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const subscriptionContainer = document.getElementById('subscriptionContainer');
            const authContainer = document.getElementById('authContainer');
            
            if (sidebar && subscriptionContainer && authContainer) {
                // Show sidebar
                sidebar.classList.add('open');
                document.getElementById('overlay').classList.add('active');
                
                // Show subscription container and hide auth container
                subscriptionContainer.style.display = 'block';
                authContainer.style.display = 'none';
            }
        });
    }

    // Handle menu button click
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const subscriptionContainer = document.getElementById('subscriptionContainer');
            const authContainer = document.getElementById('authContainer');
            
            if (sidebar && subscriptionContainer && authContainer) {
                // Show sidebar
                sidebar.classList.add('open');
                document.getElementById('overlay').classList.add('active');
                
                // Show auth container and hide subscription container
                authContainer.style.display = 'block';
                subscriptionContainer.style.display = 'none';
            }
        });
    }

    // Handle close sidebar button
    const closeSidebar = document.getElementById('closeSidebar');
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
                document.getElementById('overlay').classList.remove('active');
            }
        });
    }

    // Initialize states
    updateSaveButtonState();
    updateGuestLimitDisplay();
  });