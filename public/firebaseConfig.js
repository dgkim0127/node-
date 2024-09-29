// Firebase 설정 및 초기화
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

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

// Firebase 인증 초기화
const auth = getAuth(app);

export { auth };  // auth 객체 내보내기
