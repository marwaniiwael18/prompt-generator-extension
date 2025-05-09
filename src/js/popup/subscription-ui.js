class SubscriptionUI {
    constructor() {
        this.card = null;
        
        // Check if stripeHandler exists in window
        if (!window.stripeHandler) {
            console.log('Stripe handler not initialized yet. Waiting for it to load...');
            // Wait a short time and try again
            this.initRetryCount = 0;
            this.waitForStripeHandler();
            return;
        }
        
        this.stripeHandler = window.stripeHandler;
        this.initializeElements();
        this.attachEventListeners();
    }
    
    waitForStripeHandler() {
        setTimeout(() => {
            if (window.stripeHandler) {
                console.log('Stripe handler found after waiting');
                this.stripeHandler = window.stripeHandler;
                this.initializeElements();
                this.attachEventListeners();
            } else {
                this.initRetryCount++;
                if (this.initRetryCount < 5) { // Try up to 5 times (2.5 seconds)
                    console.log(`Waiting for Stripe handler... (attempt ${this.initRetryCount})`);
                    this.waitForStripeHandler();
                } else {
                    console.error('Could not initialize SubscriptionUI: Stripe handler not found after multiple attempts');
                }
            }
        }, 500);
    }

    initializeElements() {
        this.subscriptionSection = document.getElementById('subscriptionSection');
        this.paymentModal = document.getElementById('paymentModal');
        this.paymentForm = document.getElementById('payment-form');
        this.cardElement = document.getElementById('card-element');
        this.cardErrors = document.getElementById('card-errors');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.subscribeButtons = document.querySelectorAll('.subscribe-btn');
    }

    attachEventListeners() {
        // Subscribe button clicks
        this.subscribeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.handleSubscribeClick(plan);
            });
        });

        // Close modal
        this.closeModalBtn.addEventListener('click', () => {
            this.hidePaymentModal();
        });

        // Payment form submission
        this.paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePaymentSubmission();
        });
    }

    async handleSubscribeClick(plan) {
        const user = firebase.auth().currentUser;
        if (!user) {
            // Show login prompt
            document.getElementById('menuBtn').click();
            return;
        }

        // Show payment modal
        this.showPaymentModal();
        
        // Clean up any existing card element first
        if (this.card) {
            try {
                this.card.destroy();
                this.card = null;
            } catch (error) {
                console.error('Error destroying existing card element:', error);
            }
        }
        
        // Reset the card element container
        if (this.cardElement) {
            this.cardElement.innerHTML = '';
        }
        
        // Use the stripeHandler's method to create the card element
        const card = this.stripeHandler.createCardElement('#card-element');
        if (!card) {
            console.error('Failed to create card element');
            return;
        }

        // Store the plan and card for later use
        this.currentPlan = plan;
        this.card = card;
    }

    showPaymentModal() {
        this.paymentModal.classList.remove('hidden');
    }

    hidePaymentModal() {
        this.paymentModal.classList.add('hidden');
        
        // Make sure to properly clean up the card element
        if (this.card) {
            try {
                this.card.destroy();
            } catch (error) {
                console.error('Error destroying card element:', error);
            }
            this.card = null; // Clear the reference to avoid potential issues
        }
        
        // Reset the card element container
        if (this.cardElement) {
            this.cardElement.innerHTML = '';
        }
        
        // Clear any error messages
        if (this.cardErrors) {
            this.cardErrors.textContent = '';
        }
    }

    async handlePaymentSubmission() {
        const submitButton = this.paymentForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            // Check if the user is still authenticated
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                this.cardErrors.textContent = 'You must be logged in to complete this action.';
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe Now';
                return;
            }
            
            // Check if the card element exists
            if (!this.card) {
                console.error('Card element is not initialized');
                this.cardErrors.textContent = 'Payment form not properly initialized. Please try again.';
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe Now';
                return;
            }

            const { paymentMethod, error } = await this.stripeHandler.stripe.createPaymentMethod({
                type: 'card',
                card: this.card,
            });

            if (error) {
                this.cardErrors.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe Now';
                return;
            }

            // Create subscription
            const subscription = await this.stripeHandler.createSubscription(
                STRIPE_CONFIG.subscriptionPlans[this.currentPlan].id,
                currentUser.email
            );

            // Handle successful subscription
            await this.stripeHandler.handleSubscriptionSuccess(subscription);

            // Hide modal and show success message
            this.hidePaymentModal();
            this.showSuccessMessage();

        } catch (error) {
            this.cardErrors.textContent = 'An error occurred. Please try again.';
            console.error('Payment error:', error);
        }

        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe Now';
    }

    showSuccessMessage() {
        // Create and show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>Subscription successful! You now have unlimited access.</p>
        `;
        
        document.body.appendChild(successMessage);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    showSubscriptionSection() {
        this.subscriptionSection.classList.remove('hidden');
    }

    hideSubscriptionSection() {
        this.subscriptionSection.classList.add('hidden');
    }
}

// Initialize subscription UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionUI = new SubscriptionUI();
});

// Export the SubscriptionUI class for enhanced functionality
window.SubscriptionUI = SubscriptionUI; 