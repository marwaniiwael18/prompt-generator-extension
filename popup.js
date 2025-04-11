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
                const errorResponse = await response.json(); // Log the error response for debugging
                console.error('API Error Response:', errorResponse);
                throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            console.log('API Response:', data); // Log the API response for debugging
            console.log('Candidates:', data.candidates); // Log the candidates array for debugging

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
                    // Format the result as per the desired structure
                    return `**Prompt for ${type.charAt(0).toUpperCase() + type.slice(1)} Assistance:** "${generatedText}"`;
                } else {
                    console.error('Generated text is not a string. Candidate:', generatedCandidate);
                    throw new Error('Generated text is not a string.');
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
});