(function() {
    // This script runs on every page that matches the patterns in manifest.json

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.action === "insertPrompt") {
                insertPromptIntoActiveFocusedElement(request.prompt);
                sendResponse({success: true});
            }
            return true;
        }
    );

    // Function to insert prompt into the currently focused element
    function insertPromptIntoActiveFocusedElement(promptText) {
        const activeElement = document.activeElement;
        
        // Check if the active element is a text input or textarea
        if (activeElement && (
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'INPUT' && activeElement.type === 'text' ||
            activeElement.contentEditable === 'true')
        ) {
            // Handle different types of editable elements
            if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                activeElement.value = promptText;
                // Trigger input event to notify the website that the content has changed
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (activeElement.contentEditable === 'true') {
                activeElement.innerHTML = promptText;
                // Trigger input event for contentEditable elements
                activeElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }
            
            // Focus the element again
            activeElement.focus();
        } else {
            // If no suitable element is focused, try to find the main chat input
            const possibleChatInputs = [
                document.querySelector('textarea[placeholder*="message" i]'),
                document.querySelector('textarea[placeholder*="chat" i]'),
                document.querySelector('textarea[placeholder*="say" i]'),
                document.querySelector('textarea[placeholder*="write" i]'),
                document.querySelector('div[role="textbox"]'),
                document.querySelector('.chat-input textarea'),
                document.querySelector('#prompt-textarea')  // Specific for ChatGPT
            ];
            
            // Find the first valid input
            const chatInput = possibleChatInputs.find(el => el !== null);
            
            // If found, insert the text
            if (chatInput) {
                if (chatInput.tagName === 'TEXTAREA' || chatInput.tagName === 'INPUT') {
                    chatInput.value = promptText;
                    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    chatInput.innerHTML = promptText;
                    chatInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
                }
                chatInput.focus();
            } else {
                console.log('No suitable input field found to insert the prompt');
            }
        }
    }
    
    // Add a context menu item on right-click
    document.addEventListener('contextmenu', function() {
        // Context menu is handled by the background script
        chrome.runtime.sendMessage({
            action: "enableContextMenu"
        });
    }, true);
})();
