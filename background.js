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
        }
        return true;
    }
);