document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const userInput = document.getElementById('userInput');
    const promptType = document.getElementById('promptType');
    const generateBtn = document.getElementById('generateBtn');
    const generatedPrompt = document.getElementById('generatedPrompt');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editBtn = document.getElementById('editBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.querySelector('.close');
    const apiKeyInput = document.getElementById('apiKey');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const outputSection = document.querySelector('.output-section');
    
    // Load API key from storage
    chrome.storage.sync.get('googleApiKey', function(data) {
      if (data.googleApiKey) {
        apiKeyInput.value = data.googleApiKey;
      }
    });
    
    // Settings modal functionality
    settingsBtn.addEventListener('click', function() {
      settingsModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
      settingsModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
      if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
    
    saveSettingsBtn.addEventListener('click', function() {
      const apiKey = apiKeyInput.value.trim();
      chrome.storage.sync.set({googleApiKey: apiKey}, function() {
        console.log('Google AI Studio API key saved');
        settingsModal.style.display = 'none';
      });
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
        
        // Get API key
        const data = await chrome.storage.sync.get('googleApiKey');
        if (!data.googleApiKey) {
          alert('Please add your Google AI Studio API key in the settings.');
          generateBtn.textContent = 'Generate Prompt';
          generateBtn.disabled = false;
          return;
        }
        
        // Call Google AI Studio API
        const optimizedPrompt = await callGoogleAI(input, promptType.value);
        generatedPrompt.value = optimizedPrompt;
        
        // Show the output section with animation
        outputSection.classList.add('visible');
        
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
    
    // Save button functionality
    saveBtn.addEventListener('click', function() {
      const promptToSave = generatedPrompt.value.trim();
      if (!promptToSave) return;
      
      chrome.storage.sync.get('savedPrompts', function(data) {
        const savedPrompts = data.savedPrompts || [];
        savedPrompts.push({
          type: promptType.value,
          content: promptToSave,
          timestamp: new Date().toISOString()
        });
        
        chrome.storage.sync.set({savedPrompts: savedPrompts}, function() {
          const originalText = saveBtn.textContent;
          saveBtn.textContent = 'Saved!';
          setTimeout(() => {
            saveBtn.textContent = originalText;
          }, 1500);
        });
      });
    });
    
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
    
    // Function to call Google AI Studio API with API key
    async function callGoogleAI(input, type) {
        const apiKey = 'AIzaSyCW6cXEBtj-SukSB2nmb6rh5qoTE0Qylz4'; // Replace with your actual API key
        const userPrompt = `Convert this input into an optimized ${type} prompt: ${input}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: userPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorResponse = await response.json(); // Log the error response for debugging
                console.error('API Error Response:', errorResponse);
                throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            console.log('API Response:', data); // Log the API response for debugging
            console.log('Candidates:', data.candidates); // Log the candidates array for debugging

            // Extract the generated text from the candidates array
            if (data.candidates && data.candidates.length > 0) {
                const generatedCandidate = data.candidates[0];
                const generatedText = generatedCandidate.content || generatedCandidate.output || generatedCandidate.text || JSON.stringify(generatedCandidate); // Fallback to stringify

                if (typeof generatedText === 'string') {
                    // Format the result as per the desired structure
                    return `**Prompt for ${type.charAt(0).toUpperCase() + type.slice(1)} Assistance:** "${generatedText}"`;
                } else {
                    throw new Error('Generated text is not a string.');
                }
            } else {
                throw new Error('No candidates found in the API response.');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw new Error('Failed to fetch. Please check your API key and network connection.');
        }
    }
  });