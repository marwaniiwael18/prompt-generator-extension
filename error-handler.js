// Error handling in case scripts fail to load
window.addEventListener('error', function(event) {
  if (event.target.tagName === 'SCRIPT') {
    console.error('Script load failed:', event.target.src);
  }
}, true);

// Additional error handling for runtime errors
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

// Log that error handler is loaded
console.log('Error handler initialized');
