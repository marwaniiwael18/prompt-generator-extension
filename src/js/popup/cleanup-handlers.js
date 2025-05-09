/**
 * Cleanup handlers for the extension
 * This file ensures proper cleanup of resources when the extension popup is closed
 */

// Ensure proper cleanup of Stripe elements when the popup is closed
window.addEventListener('beforeunload', () => {
    // Clean up any card elements through the UI manager
    if (window.stripeUIManager && typeof window.stripeUIManager.cleanupCardElements === 'function') {
        window.stripeUIManager.cleanupCardElements();
    }
    
    // Also try cleaning up through the stripe handler directly
    if (window.stripeHandler && typeof window.stripeHandler.cleanupCardElements === 'function') {
        window.stripeHandler.cleanupCardElements();
    }
});

// Listen for visibility change to clean up resources when popup is hidden
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Clean up any card elements when the popup becomes hidden
        if (window.stripeUIManager && typeof window.stripeUIManager.cleanupCardElements === 'function') {
            window.stripeUIManager.cleanupCardElements();
        }
        
        // Also try cleaning up through the stripe handler directly
        if (window.stripeHandler && typeof window.stripeHandler.cleanupCardElements === 'function') {
            window.stripeHandler.cleanupCardElements();
        }
    }
});
