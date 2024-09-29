import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
