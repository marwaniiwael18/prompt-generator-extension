// Ensure window.firebase is properly set before initialization
if (typeof firebase !== 'undefined') {
    window.firebase = firebase;
    console.log("Firebase global reference is ready");
} else {
    console.error("Firebase is not defined - SDK loading failed");
} 