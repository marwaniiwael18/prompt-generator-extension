(function() {
    // Config for different chatbot platforms
    const chatbotConfig = {
        "chat.openai.com": {
            name: "ChatGPT",
            inputSelector: "#prompt-textarea",
            buttonSelector: "form button",
            iconColor: "#10a37f"  // ChatGPT's green
        },
        "claude.ai": {
            name: "Claude",
            inputSelector: "div[data-slate-editor='true']",
            buttonSelector: "button[aria-label*='Send']",
            iconColor: "#8e44ad"  // Claude's purple
        },
        "bard.google.com": {
            name: "Bard",
            inputSelector: "div[contenteditable='true']",
            buttonSelector: "button[aria-label*='Send']",
            iconColor: "#4285f4"  // Google Blue
        },
        "deepseek.ai": {
            name: "DeepSeek",
            inputSelector: "textarea",
            buttonSelector: "button[type='submit']",
            iconColor: "#0066cc"  // DeepSeek blue
        },
        "poe.com": {
            name: "Poe",
            inputSelector: "div[contenteditable='true']",
            buttonSelector: "button[aria-label*='Send']",
            iconColor: "#7c3aed"  // Poe purple
        },
        "perplexity.ai": {
            name: "Perplexity",
            inputSelector: "div[contenteditable='true']",
            buttonSelector: "button[aria-label*='Send']",
            iconColor: "#ff6b6b"  // Perplexity red/pink
        }
        // Add more chatbots as needed
    };

    // Function to detect which chatbot platform we're on
    function detectChatbot() {
        const hostname = window.location.hostname;
        for (const domain in chatbotConfig) {
            if (hostname.includes(domain)) {
                return chatbotConfig[domain];
            }
        }
        return null;
    }

    // Create and inject the notification button
    function createNotificationButton(chatbot) {
        // Create notification button
        const notificationBtn = document.createElement('div');
        notificationBtn.className = 'prompt-generator-button';
        notificationBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>Prompt Generator</span>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .prompt-generator-button {
                position: fixed;
                right: 20px;
                bottom: 100px;
                background: ${chatbot.iconColor};
                color: white;
                padding: 8px 15px;
                border-radius: 50px;
                font-weight: bold;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                animation: slideIn 0.5s ease-out;
                opacity: 0.9;
                transition: all 0.3s ease;
            }
            
            .prompt-generator-button:hover {
                opacity: 1;
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            }
            
            .prompt-generator-button svg {
                margin-right: 8px;
                width: 16px;
                height: 16px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 0.9;
                }
            }
            
            .prompt-generator-tooltip {
                position: fixed;
                right: 20px;
                bottom: 150px;
                background: #333;
                color: white;
                padding: 10px 15px;
                border-radius: 6px;
                z-index: 1001;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                animation: fadeIn 0.5s ease-out;
                opacity: 0.95;
                pointer-events: none;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 0.95; }
            }
            
            .prompt-generator-input-highlight {
                box-shadow: 0 0 0 2px ${chatbot.iconColor} !important;
                transition: box-shadow 0.3s ease;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notificationBtn);
        
        // Show tooltip on initial appearance
        showTooltip(`💡 Use AI Prompt Generator to create optimized prompts for ${chatbot.name}!`, 5000);
        
        // Button click handler - opens popup
        notificationBtn.addEventListener('click', function() {
            chrome.runtime.sendMessage({
                action: "openPopup"
            });
        });
    }

    // Function to show tooltip message
    function showTooltip(message, duration = 3000) {
        const tooltip = document.createElement('div');
        tooltip.className = 'prompt-generator-tooltip';
        tooltip.textContent = message;
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 500);
        }, duration);
    }

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.action === "insertPrompt") {
                insertPromptIntoInput(request.prompt);
                sendResponse({success: true});
            }
            return true;
        }
    );

    // Function to insert prompt into the chatbot input
    function insertPromptIntoInput(promptText) {
        const chatbot = detectChatbot();
        if (!chatbot) {
            console.log("No supported chatbot detected for prompt insertion");
            return false;
        }
        
        const inputElement = document.querySelector(chatbot.inputSelector);
        if (!inputElement) {
            console.log(`Could not find input element with selector: ${chatbot.inputSelector}`);
            return false;
        }
        
        // Handle different types of input elements
        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
            inputElement.value = promptText;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (inputElement.getAttribute('contenteditable') === 'true') {
            inputElement.innerHTML = promptText;
            inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
        
        // Focus the input element and highlight it
        inputElement.focus();
        inputElement.classList.add('prompt-generator-input-highlight');
        setTimeout(() => {
            inputElement.classList.remove('prompt-generator-input-highlight');
        }, 1500);
        
        return true;
    }

    // Function to monitor for chatbot input elements
    let inputObserver = null;
    function monitorChatbotInput() {
        const chatbot = detectChatbot();
        if (!chatbot) return;
        
        // Try to find the input element initially
        let inputElement = document.querySelector(chatbot.inputSelector);
        if (inputElement) {
            handleInputElement(inputElement);
        }
        
        // Set up observer to watch for input element if it's not immediately available
        inputObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const newInputElement = document.querySelector(chatbot.inputSelector);
                    if (newInputElement && !newInputElement.dataset.promptGeneratorMonitored) {
                        handleInputElement(newInputElement);
                        break;
                    }
                }
            }
        });
        
        inputObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Handle detected input element
    function handleInputElement(inputElement) {
        // Mark the element as monitored to avoid duplicate processing
        inputElement.dataset.promptGeneratorMonitored = true;
        
        // Add focus handler to display tooltip
        inputElement.addEventListener('focus', () => {
            showTooltip(`💡 Need help with prompts? Click the Prompt Generator button!`, 2500);
        });
        
        // Monitor typing activity
        inputElement.addEventListener('input', debounce(() => {
            const text = inputElement.value || inputElement.innerHTML;
            if (text.length > 30) {
                showTooltip(`✨ Want to optimize this prompt? Use Prompt Generator!`, 2000);
            }
        }, 1000));
    }
    
    // Debounce function to limit execution frequency
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Initialize on page load
    window.addEventListener('load', function() {
        const chatbot = detectChatbot();
        if (chatbot) {
            console.log(`Detected ${chatbot.name} interface`);
            setTimeout(() => {
                createNotificationButton(chatbot);
                monitorChatbotInput();
            }, 1500); // Small delay for page to fully render
        }
    });
    
    // Re-initialize on URL changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => {
                const chatbot = detectChatbot();
                if (chatbot) {
                    console.log(`Detected ${chatbot.name} interface after navigation`);
                    createNotificationButton(chatbot);
                    monitorChatbotInput();
                }
            }, 1500);
        }
    }).observe(document, {subtree: true, childList: true});
})();
