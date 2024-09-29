import { auth, createUserWithEmailAndPassword } from './firebaseConfig.js';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 회원가입 시도
        await createUserWithEmailAndPassword(auth, username, password);
        alert('회원가입 성공!');
        window.location.href = 'login.html';  // 회원가입 성공 후 로그인 페이지로 이동
    } catch (error) {
        document.getElementById('error-message').textContent = '회원가입 실패! 다시 시도해주세요.';
    }
});
