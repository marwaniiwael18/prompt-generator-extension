// This file handles secure communication with Stripe via background script
// Since we can't use external scripts directly in MV3, we route Stripe requests through background

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createStripePaymentIntent') {
    // In a real implementation, this would call your backend API
    // For demo purposes, we're simulating a successful response
    
    console.log('Creating payment intent for plan:', message.planId);
    
    // Simulate a delay before responding
    setTimeout(() => {
      sendResponse({
        success: true,
        clientSecret: 'demo_client_secret_' + Date.now(),
        message: 'Payment intent created successfully'
      });
    }, 500);
    
    return true; // Indicates we'll respond asynchronously
  }
  
  if (message.action === 'processStripePayment') {
    console.log('Processing payment for card ending in:', message.last4);
    
    // Simulate successful payment
    setTimeout(() => {
      sendResponse({
        success: true,
        subscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
        message: 'Subscription created successfully'
      });
    }, 1000);
    
    return true;
  }
});
