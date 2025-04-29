/**
 * Firestore Data Structure Utility
 * 
 * This file defines the data structure and helper functions
 * for storing users and discussions in Firebase Cloud Firestore.
 * 
 * Database Location: nam5 (North America)
 */

// Initialize Firebase references when this script loads
let usersCollection;
let discussionsCollection;

// Initialize collections when Firebase is ready
function initCollections() {
  if (window.db) {
    usersCollection = window.db.collection('users');
    discussionsCollection = window.db.collection('discussions');
    console.log('Firestore collections initialized successfully');
  } else {
    console.error('Firebase db not available. Collections not initialized');
  }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Add a small delay to ensure Firebase is initialized
  setTimeout(() => {
    initCollections();
  }, 1000);
});

/**
 * User Functions
 */

// Create or update a user profile
async function saveUserProfile(userId, userData) {
  if (!usersCollection) initCollections();
  
  try {
    const userRef = usersCollection.doc(userId);
    
    // Merge with existing data rather than overwrite
    await userRef.set({
      ...userData,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('User profile saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

// Get a user profile
async function getUserProfile(userId) {
  if (!usersCollection) initCollections();
  
  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      console.log('No user profile found for ID:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user preferences
async function updateUserPreferences(userId, preferences) {
  if (!usersCollection) initCollections();
  
  try {
    await usersCollection.doc(userId).update({
      preferences: preferences,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
}

/**
 * Discussions/History Functions
 */

// Save a discussion (prompt and response)
async function saveDiscussion(userId, discussionData) {
  if (!usersCollection) initCollections();
  let discussionId = null;
  
  try {
    // First try to add directly to the user's prompts collection
    // This will bypass the issue with discussions collection permissions
    const userPromptRef = await usersCollection
      .doc(userId)
      .collection('prompts')
      .add({
        ...discussionData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: new Date().getTime() // Fallback timestamp as milliseconds
      });
      
    discussionId = userPromptRef.id;
    console.log('Successfully saved prompt directly to user collection:', discussionId);
    
    // Only try to add to discussions collection if we succeeded with the user's collection
    try {
      // Add to general discussions collection with user reference
      const discussionRef = await discussionsCollection.add({
        userId: userId,
        ...discussionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        promptId: discussionId // Reference to the user's prompt
      });
      
      // Update the user prompt with the discussion ID
      await userPromptRef.update({
        discussionId: discussionRef.id
      });
      
    } catch (discussionError) {
      // If discussions collection fails, it's not critical - log it but consider the operation successful
      console.warn('Warning: Could not save to discussions collection:', discussionError);
      // No need to rethrow - we still have the prompt saved in the user's collection
    }
    
    return discussionId;
  } catch (error) {
    console.error('Error saving discussion:', error);
    return null;
  }
}

// Get discussions for a specific user
async function getUserDiscussions(userId, limit = 20) {
  if (!usersCollection) initCollections();
  
  try {
    const promptsSnapshot = await usersCollection
      .doc(userId)
      .collection('prompts')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
      
    return promptsSnapshot.empty ? 
      [] : 
      promptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: formatTimestamp(doc.data().createdAt)
      }));
  } catch (error) {
    console.error('Error getting user discussions:', error);
    return [];
  }
}

// Delete a discussion
async function deleteDiscussion(userId, promptId, discussionId = null) {
  if (!usersCollection) initCollections();
  
  try {
    // Primary operation - delete from user's prompts collection
    await usersCollection.doc(userId).collection('prompts').doc(promptId).delete();
    
    // Secondary operation - if we have a discussionId, try to delete it too
    if (discussionId && discussionsCollection) {
      try {
        await discussionsCollection.doc(discussionId).delete();
      } catch (err) {
        // Not critical if this fails
        console.warn('Could not delete from discussions collection:', err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return false;
  }
}

/**
 * Analytics and Usage Statistics
 */

// Track prompt generation
async function trackPromptGeneration(userId, promptData) {
  if (!usersCollection) initCollections();
  
  try {
    // Only attempt to write to Firestore if there's a valid user ID and auth state
    if (userId && window.auth && window.auth.currentUser) {
      try {
        // Use a safer data structure with atomic increments
        const userRef = usersCollection.doc(userId);
        const updateData = {
          usage: {
            totalPrompts: firebase.firestore.FieldValue.increment(1),
            lastGenerated: firebase.firestore.FieldValue.serverTimestamp()
          }
        };
        
        // Add prompt type counter using computed property name
        const promptType = promptData.type || 'unknown';
        updateData.usage[`promptTypes.${promptType}`] = firebase.firestore.FieldValue.increment(1);
        
        await userRef.set(updateData, { merge: true });
        console.log('Successfully tracked prompt generation for user:', userId);
        return true;
      } catch (userError) {
        console.warn('Could not update user analytics, using fallback storage:', userError.message);
        // Fall through to local storage as backup
      }
    } else {
      console.log('No authenticated user found for analytics tracking, using local storage');
    }
    
    // For anonymous users or as a fallback for authentication failures
    try {
      // Get existing stats from local storage
      chrome.storage.local.get('anonymousUsage', (result) => {
        const usage = result.anonymousUsage || { 
          totalPrompts: 0,
          promptTypes: {},
          lastGenerated: new Date().toISOString()
        };
        
        // Update stats
        usage.totalPrompts += 1;
        
        // Update prompt type counter
        const promptType = promptData.type || 'unknown';
        usage.promptTypes[promptType] = (usage.promptTypes[promptType] || 0) + 1;
        
        usage.lastGenerated = new Date().toISOString();
        
        // Save back to storage
        chrome.storage.local.set({ 'anonymousUsage': usage }, () => {
          console.log('Anonymous usage tracked in local storage');
        });
      });
      
      return true;
    } catch (storageError) {
      console.error('Error tracking anonymous usage in storage:', storageError);
      // Last resort - just log it and return success to prevent errors from surfacing to the user
      return true;
    }
  } catch (error) {
    console.error('Error tracking prompt generation:', error);
    // Return true anyway to avoid disrupting the user experience
    return true;
  }
}

/**
 * Utility Functions
 */

// Format a Firestore timestamp for display
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  // Handle both Firestore Timestamp objects and serialized timestamps
  const date = timestamp.toDate ? timestamp.toDate() : 
               timestamp instanceof Date ? timestamp :
               new Date(timestamp);
               
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute:'2-digit'
  });
}

// Export all functions
window.firestoreData = {
  saveUserProfile,
  getUserProfile,
  updateUserPreferences,
  saveDiscussion,
  getUserDiscussions,
  deleteDiscussion,
  trackPromptGeneration
};
