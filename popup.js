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
    
    // Track current user
    let currentUser = null;
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
      currentUser = user;
      console.log("Auth state changed in popup.js, current user:", user ? user.email : "none");
    });
  
    // Generate prompt functionality
    generateBtn.addEventListener('click', async function() {
      const input = userInput.value.trim();
      if (!input) {
        alert('Please enter what you want to ask or request.');
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
        
        // ENHANCEMENT: Auto-save the generated prompt if user is logged in
        if (currentUser) {
          savePromptToFirebase(optimizedPrompt, promptType.value);
        }
      } catch (error) {
        alert('Error generating prompt: ' + error.message);
        console.error(error);
      } finally {
        generateBtn.textContent = 'Generate Prompt';
        generateBtn.disabled = false;
      }
    });
  
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
  
    // Save button functionality - FIXED to properly handle Firebase timestamps
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
    
    // Helper function to save prompt to Firebase
    function savePromptToFirebase(promptContent, promptType) {
      console.log("Attempting to save prompt to Firebase for user:", currentUser.uid);
      console.log("Prompt content:", promptContent.substring(0, 50) + "...");
      console.log("Prompt type:", promptType);
      
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
      const apiKey = 'AIzaSyCW6cXEBtj-SukSB2nmb6rh5qoTE0Qylz4'; // Replace with your actual API key
      
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
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
          })
        });
  
        // Log response status for debugging
        console.log('API Response status:', response.status);
  
        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('API Error Response:', errorResponse);
          throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log('API Response data:', data);
  
        // Extract the generated text from the candidates array
        if (data.candidates && data.candidates.length > 0) {
          const generatedCandidate = data.candidates[0];
          console.log('Generated candidate:', generatedCandidate);
  
          // Check for multiple possible fields where the text might be stored
          let generatedText;
          if (generatedCandidate.content && generatedCandidate.content.parts && generatedCandidate.content.parts.length > 0) {
            generatedText = generatedCandidate.content.parts[0].text;
            
            // Clean up the response to ensure it's properly formatted
            generatedText = cleanStructuredPromptOutput(generatedText);
          } else {
            generatedText = generatedCandidate.output || generatedCandidate.text;
          }
  
          if (typeof generatedText === 'string') {
            console.log('Final extracted text:', generatedText);
            return generatedText;
          } else {
            console.error('Generated text is not a string or is undefined. Candidate:', generatedCandidate);
            throw new Error('Generated text is not a string or is undefined.');
          }
        } else {
          console.error('No candidates found in the API response:', data);
          throw new Error('No candidates found in the API response.');
        }
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to fetch. Please check your API key and network connection.');
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
  });