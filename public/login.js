import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value;  // 아이디 대신 이메일을 사용해야 할 경우
    const password = document.getElementById('password').value;

    try {
        // Firebase 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
        window.location.href = 'main.html';  // 메인 페이지로 이동
    } catch (error) {
        // Firebase 인증 에러 처리
        document.getElementById('error-message').textContent = `오류: ${error.message}`;
    }
});
