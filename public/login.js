import { auth, signInWithEmailAndPassword } from './firebaseConfig.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Firebase를 사용한 로그인 처리
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        alert('로그인 성공!');
        window.location.href = 'main.html';  // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
        document.getElementById('error-message').textContent = '로그인 실패! 아이디 또는 비밀번호가 틀렸습니다.';
    }
});
