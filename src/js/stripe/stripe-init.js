// Initialize Stripe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const stripeHandler = new StripeHandler();
    window.stripeHandler = stripeHandler;
    
    // Ensure card elements are properly cleaned up when modal is closed
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (stripeHandler && typeof stripeHandler.cleanupCardElements === 'function') {
                stripeHandler.cleanupCardElements();
            }
        });
    }
    
    // Also handle ESC key press to close modal and clean up
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (stripeHandler && typeof stripeHandler.cleanupCardElements === 'function') {
                stripeHandler.cleanupCardElements();
            }
        }
    });
}); 