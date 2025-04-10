// Handle installation
chrome.runtime.onInstalled.addListener(function() {
    console.log('AI Prompt Generator extension has been installed');
    
    // Initialize storage with default values
    chrome.storage.sync.get(['googleApiKey', 'savedPrompts'], function(data) {
      if (!data.savedPrompts) {
        chrome.storage.sync.set({savedPrompts: []});
      }
    });
});