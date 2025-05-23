![Screenshot 2025-05-09 at 20 32 27](https://github.com/user-attachments/assets/1d7e02bd-a886-4c01-a84f-f8397be9b2b8)
<img width="379" alt="Screenshot 2025-05-09 at 20 44 04" src="https://github.com/user-attachments/assets/fdaadddf-7635-4c3c-9119-b4f2a4a4a44a" />
<img width="380" alt="Screenshot 2025-05-09 at 20 33 14" src="https://github.com/user-attachments/assets/4e2e7425-3a76-452c-93b0-57beb138bf63" />
<img width="377" alt="Screenshot 2025-05-09 at 20 32 58" src="https://github.com/user-attachments/assets/bed26c52-0d40-44de-bbf4-ef3c7e152a2c" />
![Uploading Screenshot 2025-05-09 at 20.46.34.png…]()


Uploading Screen Recording 2025-05-10 at 21.54.14.mov…


![Uploading Screenshot 2025-05-09 at 20.32.27.png…]()



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
