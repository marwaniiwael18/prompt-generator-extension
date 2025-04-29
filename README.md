# AI Prompt Generator Extension

A Chrome extension for generating optimized prompts for AI assistants.

## Setup Instructions

### Firebase SDK Setup

Due to Chrome Extension Content Security Policy restrictions, we need to use local Firebase SDK files:

1. Make sure Node.js is installed on your system
2. Run the following commands in the terminal:

```bash
# Navigate to the extension directory
cd /Users/macbook/Desktop/prompt-generator-extension

# Create lib directory
mkdir -p lib

# Use curl to download Firebase SDK files
curl -o lib/firebase-app-compat.js https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js
curl -o lib/firebase-auth-compat.js https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js
curl -o lib/firebase-firestore-compat.js https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js
```

Or alternatively:

```bash
# Run the download script
node download-firebase-sdk.js
```

3. Load the extension in Chrome:
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this extension directory

## Features

- Generate optimized prompts for AI interactions
- Save and manage your prompt history
- User authentication with Firebase
- Works with multiple AI assistants including ChatGPT, Claude, Bard, and more
