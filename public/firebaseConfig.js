// Firebase 설정 및 초기화
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Firebase 설정 (Firebase 콘솔에서 제공되는 설정 정보)
const firebaseConfig = {
    apiKey: "AIzaSyDFysg8I_qKtDqDJLWg1_npTPBWRMM_5WY",
    authDomain: "jjji-4240b.firebaseapp.com",
    projectId: "jjji-4240b",
    storageBucket: "jjji-4240b.appspot.com",
    messagingSenderId: "876101785840",
    appId: "1:876101785840:web:6e58681ea9c9780e454a35",
    measurementId: "G-03999XR4JS"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore, Storage, Auth 서비스 초기화
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 다른 파일에서 사용할 수 있도록 Firebase 서비스들을 export
export { db, storage, auth };
