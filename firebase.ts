import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNFpj8ZxY19WcQgkjXEMqSdlNlX9jXHyY",
  authDomain: "tradingjournal-ecace.firebaseapp.com",
  projectId: "tradingjournal-ecace",
  storageBucket: "tradingjournal-ecace.firebasestorage.app",
  messagingSenderId: "633075223034",
  appId: "1:633075223034:web:cc0fbe7d6bbe90e0c83c43",
  measurementId: "G-T8C9SMG59X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
