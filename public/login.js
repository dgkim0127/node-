import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const auth = getAuth();
const loginForm = document.getElementById('loginForm');

// 로그인 폼 제출 이벤트 처리
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // Firebase 인증 로그인 처리
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 로그인 성공 후 대시보드로 이동
        alert('로그인 성공!');
        window.location.href = 'dashboard.html'; // 로그인 성공 시 대시보드로 리디렉션
    } catch (error) {
        // 로그인 실패 시 오류 처리
        switch (error.code) {
            case 'auth/wrong-password':
                errorMessage.textContent = "비밀번호가 잘못되었습니다.";
                break;
            case 'auth/user-not-found':
                errorMessage.textContent = "해당 이메일이 존재하지 않습니다.";
                break;
            case 'auth/invalid-email':
                errorMessage.textContent = "유효하지 않은 이메일 형식입니다.";
                break;
            case 'auth/too-many-requests':
                errorMessage.textContent = "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.";
                break;
            default:
                errorMessage.textContent = "로그인 실패: " + error.message;
        }
    }
});
