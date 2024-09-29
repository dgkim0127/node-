import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { firebaseConfig } from './firebaseConfig.js';

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 로그인 폼 이벤트 리스너
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 세션 유지 설정 (local: 브라우저를 닫아도 로그인 유지)
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // 로그인 성공 시
            console.log('로그인 성공:', userCredential.user);
            window.location.href = 'index.html'; // 메인 페이지로 이동
        })
        .catch((error) => {
            // 오류 처리
            document.getElementById('error-message').textContent = `로그인 오류: ${error.message}`;
        });
});
