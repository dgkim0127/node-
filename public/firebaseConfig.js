import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDFysg8I_qKtDqDJLWg1_npTPBWRMM_5WY",
  authDomain: "jjji-4240b.firebaseapp.com",
  projectId: "jjji-4240b",
  storageBucket: "jjji-4240b.appspot.com",
  messagingSenderId: "876101785840",
  appId: "1:876101785840:web:6e58681ea9c9780e454a35",
  measurementId: "G-03999XR4JS"
};

// Firebase 초기화
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, storage };
