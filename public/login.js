import { auth, db } from './firebaseConfig.js'; 
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firestore에서 아이디로 사용자 확인
async function checkUserExists(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists(); // 사용자가 존재하면 true, 없으면 false 반환
}

// 로그인 폼 이벤트 핸들러
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // Firestore에서 아이디 확인
        const userExists = await checkUserExists(userId);

        if (!userExists) {
            errorMessage.textContent = "해당 아이디의 사용자를 찾을 수 없습니다.";
            return;
        }

        // 아이디가 존재하면 이메일처럼 처리
        const email = `${userId}@example.com`;

        // Firebase Authentication 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 로그인 성공 처리
        alert('로그인 성공!');
        window.location.href = 'dashboard.html'; // 대시보드로 리디렉션

    } catch (error) {
        // Firebase 오류 처리: 비밀번호 오류인 경우 분리
        if (error.code === 'auth/wrong-password') {
            errorMessage.textContent = "비밀번호가 잘못되었습니다.";
        } else {
            errorMessage.textContent = '로그인 실패: ' + error.message;
        }
    }
});
