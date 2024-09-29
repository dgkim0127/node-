import { auth, signInWithEmailAndPassword } from './firebaseConfig.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        alert('로그인 성공!');
        window.location.href = 'index.html';  // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
        document.getElementById('error-message').textContent = '로그인 실패! 회원가입을 해주세요.';
    }
});
