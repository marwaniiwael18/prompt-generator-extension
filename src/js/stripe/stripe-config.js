// Stripe configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_live_51OooujHlBP4i2gKTC9wJPCfzgTOnhG0fKhDTk3ngbymQVtUpscCCtRsSua5x7NDYcEf93IRrvPiOAF9Hf2yrgCfa00Ggh8a26w',
    // SECURITY FIX: Secret key removed from client-side code
    // This should only be used in a secure server environment
    subscriptionPlans: {
        weekly: {
            id: 'price_weekly',
            amount: 1100, // 11 EUR in cents
            interval: 'week',
            name: 'Weekly Plan'
        },
        monthly: {
            id: 'price_monthly',
            amount: 4000, // 40 EUR in cents
            interval: 'month',
            name: 'Monthly Plan'
        }
    }
};

// Export the configuration
window.STRIPE_CONFIG = STRIPE_CONFIG; 