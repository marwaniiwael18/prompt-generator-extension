// Import Stripe service script
importScripts('../background/stripe-service.js');

// Handle installation
chrome.runtime.onInstalled.addListener(function() {
    console.log('AI Prompt Generator extension has been installed');
    
    // Initialize storage with default values
    chrome.storage.sync.get(['googleApiKey', 'savedPrompts'], function(data) {
      if (!data.savedPrompts) {
        chrome.storage.sync.set({savedPrompts: []});
      }
    });

    // Create a context menu item
    chrome.contextMenus.create({
        id: "generatePrompt",
        title: "Generate AI Prompt",
        contexts: ["selection"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "generatePrompt" && info.selectionText) {
        // Open the popup with the selected text
        chrome.storage.local.set({
            selectedText: info.selectionText
        }, function() {
            chrome.action.openPopup();
        });
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "enableContextMenu") {
            // Nothing specific needs to be done here; 
            // this message just indicates a context menu might be opening
            sendResponse({success: true});
        } else if (request.action === "openPopup") {
            // Open the extension popup programmatically
            chrome.action.openPopup();
            sendResponse({success: true});
        } else if (request.action === "checkSubscription") {
            // Check if the user is subscribed
            // This would normally communicate with your backend API
            // For now, we're just returning a mock response
            sendResponse({isSubscribed: true, plan: "premium"});
        } else if (request.action === "initiateSubscription") {
            // Initiate the subscription process
            // This would normally communicate with your backend API
            console.log("Initiating subscription for user:", request.email, "plan:", request.planId);
            
            // Mock a successful response
            setTimeout(() => {
                // Send a message back to the popup to complete the subscription flow
                chrome.runtime.sendMessage({
                    action: "subscriptionInitiated",
                    success: true,
                    clientSecret: "mock_client_secret"
                });
            }, 1000);
            
            sendResponse({success: true, message: "Subscription initiation started"});
        }
        return true;
    }
);