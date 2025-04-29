// Initialize Firebase with window check to avoid reference errors
(function() {
  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDaYKeX0tRv1RQYtfp3zBiJyN-VFA7rzF8",
    authDomain: "ai-prompt-generator-4f901.firebaseapp.com",
    projectId: "ai-prompt-generator-4f901",
    storageBucket: "ai-prompt-generator-4f901.firebasestorage.app",
    messagingSenderId: "423153105203",
    appId: "1:423153105203:web:cbbc1dc17f7bee3e12e646",
    measurementId: "G-VQMR4ZZCZY"
  };

  // Ensure window.firebase exists, even if the libraries didn't load
  if (typeof window.firebase === 'undefined') {
    console.warn('Firebase SDK not fully loaded - using mock implementation');
    window.firebase = {
      apps: [],
      initializeApp: function() {
        console.log('Mock Firebase initialization');
        return {};
      }
    };
  }

  // Initialize Firebase
  if (!firebase.apps || !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } catch (e) {
      console.error("Firebase initialization error:", e);
    }
  }
    
  // Make auth and firestore globally available
  try {
    window.auth = firebase.auth();
    window.db = firebase.firestore();
  } catch (e) {
    console.error("Error initializing Firebase services:", e);
    
    // Provide mock implementations if real ones fail
    window.auth = window.auth || {
      onAuthStateChanged: (callback) => { callback(null); return () => {}; },
      signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
      createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
      signInWithPopup: () => Promise.resolve({ user: null }),
      signOut: () => Promise.resolve()
    };
    
    window.db = window.db || {
      collection: () => ({
        doc: () => ({
          collection: () => ({}),
          get: () => Promise.resolve({ exists: false, data: () => ({}) }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve()
        }),
        add: () => Promise.resolve(),
        orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }) }),
        where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) })
      })
    };
  }
})();