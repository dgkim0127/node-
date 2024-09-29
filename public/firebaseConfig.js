// Firebase SDK 모듈 가져오기
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// Firebase 프로젝트 설정 (Firebase Console에서 복사한 설정 값)
const firebaseConfig = {
    apiKey: "your-api-key",                 // Firebase API Key
    authDomain: "your-auth-domain",         // Firebase Auth 도메인
    projectId: "your-project-id",           // Firebase 프로젝트 ID
    storageBucket: "your-storage-bucket",   // Firebase Storage 버킷
    messagingSenderId: "your-messaging-sender-id", // 메시징 ID
    appId: "your-app-id"                    // Firebase 앱 ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화 (Firestore, Auth, Storage)
const db = getFirestore(app);    // Firestore 인스턴스
const auth = getAuth(app);       // Firebase Authentication 인스턴스
const storage = getStorage(app); // Firebase Storage 인스턴스

// 필요한 모듈들을 export하여 다른 파일에서 사용 가능하게 함
export { db, auth, storage };
