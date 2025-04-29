// This script helps get the correct redirect URL for OAuth
console.log('Extension ID:', chrome.runtime.id);
console.log('Chrome Extension redirect URL:', chrome.identity.getRedirectURL());
console.log('Copy the URL above and add it to your Google Cloud Console OAuth configuration');