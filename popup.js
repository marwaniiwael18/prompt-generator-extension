document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const userInput = document.getElementById('userInput');
  const promptType = document.getElementById('promptType');
  const generateBtn = document.getElementById('generateBtn');
  const generatedPrompt = document.getElementById('generatedPrompt');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');
  const outputSection = document.querySelector('.output-section');

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
          
          // Make output section visible
          outputSection.classList.remove('hidden');
          showOutputSection();
          
          console.log('Output section should be visible now:', outputSection);
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

          chrome.storage.sync.set({ savedPrompts: savedPrompts }, function() {
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

  // Function to call Google AI Studio API with hardcoded API key
  async function callGoogleAI(input, type) {
      const apiKey = 'AIzaSyCW6cXEBtj-SukSB2nmb6rh5qoTE0Qylz4'; // Hardcoded API key
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
              const errorResponse = await response.json();
              console.error('API Error Response:', errorResponse);
              throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('API Response:', data);

          // Extract the generated text from the candidates array
          if (data.candidates && data.candidates.length > 0) {
              const generatedCandidate = data.candidates[0];

              // Check for multiple possible fields where the text might be stored
              let generatedText;
              if (generatedCandidate.content && generatedCandidate.content.parts && generatedCandidate.content.parts.length > 0) {
                  generatedText = generatedCandidate.content.parts[0].text;
              } else {
                  generatedText = generatedCandidate.output || generatedCandidate.text;
              }

              if (typeof generatedText === 'string') {
                  console.log('Extracted text:', generatedText);
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
      // First remove hidden class if present
      outputSection.classList.remove('hidden');
      
      // Then set display to block
      outputSection.style.display = 'block';
      
      // Force browser reflow
      void outputSection.offsetWidth;
      
      // Now add the visible class for animation
      setTimeout(() => {
          outputSection.classList.add('visible');
      }, 10);
  }

  // Add input focus effects
  userInput.addEventListener('focus', () => {
      document.querySelector('label[for="userInput"]').style.color = '#4285f4';
  });

  userInput.addEventListener('blur', () => {
      document.querySelector('label[for="userInput"]').style.color = '#b0b0b0';
  });

  // Add focus effects for generated prompt textarea as well
  generatedPrompt.addEventListener('focus', () => {
      document.querySelector('label[for="generatedPrompt"]').style.color = '#4285f4';
  });

  generatedPrompt.addEventListener('blur', () => {
      document.querySelector('label[for="generatedPrompt"]').style.color = '#b0b0b0';
  });

  // Add tooltips to buttons
  copyBtn.setAttribute('data-tooltip', 'Copy to clipboard');
  saveBtn.setAttribute('data-tooltip', 'Save to library');
  editBtn.setAttribute('data-tooltip', 'Edit prompt');
});