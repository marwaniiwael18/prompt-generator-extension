class StripeHandler {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            // Check if Stripe is loaded from the local file
            if (typeof Stripe !== 'undefined') {
                console.log('Stripe loaded from local file, initializing...');
                this.stripe = Stripe(STRIPE_CONFIG.publicKey);
                this.elements = this.stripe.elements();
                // We'll create and mount card elements on demand instead of here
            } else {
                console.error('Stripe is not loaded. Make sure the Stripe script is properly included in the HTML.');
            }
        } catch (error) {
            console.error('Error initializing Stripe:', error);
        }
    }
    
    // Track existing card elements
    _cardElementInstances = new Map();
    
    // Method to create a card element when needed
    createCardElement(elementSelector) {
        if (!this.stripe || !this.elements) {
            console.error('Stripe not initialized');
            return null;
        }
        
        const cardElement = document.querySelector(elementSelector);
        if (!cardElement) {
            console.error(`Card element not found: ${elementSelector}`);
            return null;
        }
        
        // Check if we already have a card element for this selector
        if (this._cardElementInstances.has(elementSelector)) {
            // Clean up the existing card element
            try {
                const existingCard = this._cardElementInstances.get(elementSelector);
                existingCard.destroy();
                this._cardElementInstances.delete(elementSelector);
                console.log(`Cleaned up existing card element for ${elementSelector}`);
            } catch (error) {
                console.error(`Error cleaning up existing card element for ${elementSelector}:`, error);
            }
        }
        
        // Create a new card element
        try {
            const card = this.elements.create('card');
            
            // Mount it to the DOM
            card.mount(elementSelector);
            
            // Handle real-time validation errors
            card.addEventListener('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (displayError) {
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                }
            });
            
            // Store the card element instance
            this._cardElementInstances.set(elementSelector, card);
            
            return card;
        } catch (error) {
            console.error('Error creating card element:', error);
            return null;
        }
    }

    async createSubscription(planId, email) {
        try {
            if (!this.stripe) {
                throw new Error('Stripe has not been initialized');
            }
            
            // For client-side implementation, we should use a secure backend endpoint
            // that handles the actual subscription creation
            
            // This is a temporary placeholder for demonstration
            console.log(`Creating subscription for plan ${planId} and email ${email}`);
            
            // The actual implementation should use a secure backend API
            // Example of how it would work with a backend:
            // const response = await fetch('https://your-backend-api/create-subscription', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ planId, email })
            // });
            // const subscription = await response.json();

            return subscription;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    async createCustomer(email) {
        try {
            const customer = await this.stripe.customers.create({
                email: email,
            });
            return customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    async handleSubscriptionSuccess(subscription) {
        // Update user's subscription status in Firebase
        const user = firebase.auth().currentUser;
        if (user) {
            await firebase.firestore().collection('users').doc(user.uid).update({
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPlan: subscription.items.data[0].price.id,
                subscriptionEndDate: new Date(subscription.current_period_end * 1000)
            });
        }
    }

    async checkSubscriptionStatus() {
        const user = firebase.auth().currentUser;
        if (!user) return null;

        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        if (!userData || !userData.subscriptionId) return null;

        try {
            const subscription = await this.stripe.subscriptions.retrieve(userData.subscriptionId);
            return subscription;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return null;
        }
    }
    
    // Clean up all card elements
    cleanupCardElements() {
        for (const [selector, card] of this._cardElementInstances.entries()) {
            try {
                card.destroy();
                console.log(`Cleaned up card element for ${selector}`);
            } catch (error) {
                console.error(`Error cleaning up card element for ${selector}:`, error);
            }
        }
        this._cardElementInstances.clear();
    }
}

// Export the handler
window.StripeHandler = StripeHandler; 