// Initialize Firebase with window check to avoid reference errors
(function() {
  // Debug Firebase SDK loading
  console.log('Firebase initialization started');
  console.log('Firebase SDK available:', typeof firebase !== 'undefined');
  console.log('Window firebase available:', typeof window.firebase !== 'undefined');
  
  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "",//API here
    authDomain: "ai-prompt-generator-4f901.firebaseapp.com",
    projectId: "ai-prompt-generator-4f901",
    storageBucket: "ai-prompt-generator-4f901.firebasestorage.app",
    messagingSenderId: "423153105203",
    appId: "1:423153105203:web:cbbc1dc17f7bee3e12e646",
    measurementId: "G-VQMR4ZZCZY"
  };

  // Initialize Firebase
  if (!window.firebase || !window.firebase.apps || !window.firebase.apps.length) {
    try {
      if (!window.firebase) {
        console.error('Firebase SDK not loaded');
        return;
      }
      
      // Check if Firebase is already initialized to avoid multiple instances
      try {
        const app = firebase.app();
        console.log("Firebase already initialized");
        window.firebaseApp = app;
      } catch (e) {
        window.firebaseApp = firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
      }

      // Initialize Auth and Firestore
      window.auth = firebase.auth();
      window.db = firebase.firestore();
      
      // Set persistence to LOCAL for better user experience
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch((error) => {
          console.error("Error setting persistence:", error);
        });

    } catch (e) {
      console.error("Firebase initialization error:", e);
      // Provide mock implementations if initialization fails
      window.auth = {
        onAuthStateChanged: (callback) => { callback(null); return () => {}; },
        signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
        createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
        signInWithPopup: () => Promise.resolve({ user: null }),
        signOut: () => Promise.resolve()
      };
      
      window.db = {
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve({ exists: false, data: () => ({}) }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            collection: () => ({})
          }),
          add: () => Promise.resolve(),
          orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }) }),
          where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) })
        })
      };
    }
  }
})();
