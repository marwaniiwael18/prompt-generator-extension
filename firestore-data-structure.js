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
  if (!discussionsCollection) initCollections();
  
  try {
    // Add to general discussions collection with user reference
    const discussionRef = await discussionsCollection.add({
      userId: userId,
      ...discussionData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Also add reference to user's personal prompts collection
    await usersCollection
      .doc(userId)
      .collection('prompts')
      .add({
        discussionId: discussionRef.id,
        ...discussionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    return discussionRef.id;
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
      .orderBy('createdAt', 'desc')
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
async function deleteDiscussion(userId, discussionId) {
  if (!usersCollection || !discussionsCollection) initCollections();
  
  try {
    // Find the prompt in user's collection by discussionId
    const promptsRef = usersCollection.doc(userId).collection('prompts');
    const matchingPrompts = await promptsRef
      .where('discussionId', '==', discussionId)
      .get();
    
    // Delete from user's prompts collection
    const deletePromises = matchingPrompts.docs.map(doc => doc.ref.delete());
    
    // Delete from main discussions collection
    deletePromises.push(discussionsCollection.doc(discussionId).delete());
    
    // Execute all deletes
    await Promise.all(deletePromises);
    
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
    // Anonymous tracking if no user ID (guest mode)
    const trackingRef = userId 
      ? usersCollection.doc(userId).collection('analytics').doc('usage')
      : discussionsCollection.doc('anonymous_usage');
      
    // Update counters using atomic operations
    await trackingRef.set({
      totalPrompts: firebase.firestore.FieldValue.increment(1),
      promptTypes: {
        [promptData.type]: firebase.firestore.FieldValue.increment(1)
      },
      lastGenerated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error tracking prompt generation:', error);
    return false;
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
               
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
