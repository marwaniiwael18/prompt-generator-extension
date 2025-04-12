const fs = require('fs');
const https = require('https');
const path = require('path');

const FIREBASE_VERSION = '9.22.0';
const LIB_DIR = path.join(__dirname, 'lib');

// Ensure lib directory exists
if (!fs.existsSync(LIB_DIR)) {
  fs.mkdirSync(LIB_DIR, { recursive: true });
}

// List of Firebase modules to download
const modules = [
  'firebase-app-compat',
  'firebase-auth-compat',
  'firebase-firestore-compat'
];

// Download each Firebase module
modules.forEach(module => {
  const url = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/${module}.js`;
  const filePath = path.join(LIB_DIR, `${module}.js`);
  
  console.log(`Downloading ${url} to ${filePath}`);
  
  const file = fs.createWriteStream(filePath);
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${module}.js successfully`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {}); // Delete the file if there was an error
    console.error(`Error downloading ${module}.js:`, err.message);
  });
});

console.log('After running this script, make sure to include these files in your popup.html');
console.log('You can run this script with: node download-firebase-sdk.js');
