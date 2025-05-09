/**
 * Enhanced subscription UI functionality that improves Stripe integration
 * This file helps prevent issues with multiple card elements being created
 */

// Create a singleton to manage card elements
class StripeUIManager {
    constructor() {
        // Track active elements
        this.activeCardElements = new Map();
        this.stripeHandler = null;
        
        // Initialize when DOM is loaded and stripeHandler exists
        this.initialize();
    }
    
    initialize() {
        if (window.stripeHandler) {
            console.log('StripeUIManager: Stripe handler found, initializing.');
            this.stripeHandler = window.stripeHandler;
            this.setupListeners();
        } else {
            console.log('StripeUIManager: Waiting for Stripe handler to initialize.');
            setTimeout(() => this.initialize(), 500);
        }
    }
    
    setupListeners() {
        // Listen for modal close events to ensure proper cleanup
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.cleanupCardElements();
            });
        }
        
        // Listen for escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cleanupCardElements();
            }
        });
        
        // Add cleanup on auth state change
        if (window.auth) {
            window.auth.onAuthStateChanged(() => {
                this.cleanupCardElements();
            });
        }
    }
    
    createCardElement(elementSelector) {
        // Check if we already have a card element for this selector
        if (this.activeCardElements.has(elementSelector)) {
            console.log(`Card element for ${elementSelector} already exists, returning existing element.`);
            return this.activeCardElements.get(elementSelector);
        }
        
        // Create a new card element through the stripe handler
        if (!this.stripeHandler) {
            console.error('Stripe handler not initialized');
            return null;
        }
        
        const card = this.stripeHandler.createCardElement(elementSelector);
        if (card) {
            this.activeCardElements.set(elementSelector, card);
        }
        
        return card;
    }
    
    destroyCardElement(elementSelector) {
        if (this.activeCardElements.has(elementSelector)) {
            const card = this.activeCardElements.get(elementSelector);
            card.destroy();
            this.activeCardElements.delete(elementSelector);
            console.log(`Card element for ${elementSelector} destroyed.`);
            return true;
        }
        return false;
    }
    
    cleanupCardElements() {
        for (const [selector, card] of this.activeCardElements.entries()) {
            try {
                card.destroy();
                console.log(`Cleaned up card element for ${selector}`);
            } catch (error) {
                console.error(`Error cleaning up card element for ${selector}:`, error);
            }
        }
        this.activeCardElements.clear();
    }
}

// Initialize the Stripe UI Manager as a singleton
document.addEventListener('DOMContentLoaded', () => {
    window.stripeUIManager = new StripeUIManager();
    
    // Override the handleSubscribeClick method in SubscriptionUI when it's available
    const originalSubscriptionUIPrototype = window.SubscriptionUI?.prototype;
    if (originalSubscriptionUIPrototype && originalSubscriptionUIPrototype.handleSubscribeClick) {
        const originalHandleSubscribe = originalSubscriptionUIPrototype.handleSubscribeClick;
        
        // Replace with enhanced version that uses the UIManager
        originalSubscriptionUIPrototype.handleSubscribeClick = async function(plan) {
            const user = firebase.auth().currentUser;
            if (!user) {
                document.getElementById('menuBtn').click();
                return;
            }
            
            this.showPaymentModal();
            
            // Use the UI manager to create or return existing card element
            const card = window.stripeUIManager.createCardElement('#card-element');
            if (!card) {
                console.error('Failed to create card element');
                return;
            }
            
            this.currentPlan = plan;
            this.card = card;
        };
        
        // Also enhance the hidePaymentModal method
        const originalHidePaymentModal = originalSubscriptionUIPrototype.hidePaymentModal;
        originalSubscriptionUIPrototype.hidePaymentModal = function() {
            originalHidePaymentModal.call(this);
            
            // Use UI manager to clean up
            if (window.stripeUIManager) {
                window.stripeUIManager.destroyCardElement('#card-element');
            }
        };
        
        console.log('Enhanced SubscriptionUI methods for better Stripe integration');
    }
});