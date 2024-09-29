import { auth, db } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firestore에서 아이디로 사용자 정보 조회
async function getUserByUserId(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return userDoc.data(); // 사용자 정보 반환 (이메일 포함)
    } else {
        throw new Error("존재하지 않는 아이디입니다.");
    }
}

// 로그인 폼 이벤트 핸들러
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // 아이디로 사용자 이메일 조회
        const user = await getUserByUserId(userId);
        
        // 이메일과 비밀번호로 Firebase Authentication에 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, user.email, password);
        
        // 로그인 성공
        const userData = userCredential.user;
        alert(`로그인 성공: ${userData.email}`);
        window.location.href = 'dashboard.html'; // 로그인 성공 후 리디렉션

    } catch (error) {
        // Firebase 인증 오류 처리
        switch (error.code) {
            case 'auth/wrong-password':
                errorMessage.textContent = "비밀번호가 올바르지 않습니다.";
                break;
            case 'auth/user-not-found':
                errorMessage.textContent = "존재하지 않는 사용자입니다.";
                break;
            case 'auth/invalid-email':
                errorMessage.textContent = "잘못된 이메일 형식입니다.";
                break;
            case 'auth/too-many-requests':
                errorMessage.textContent = "너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요.";
                break;
            default:
                errorMessage.textContent = "로그인 실패: " + error.message;
        }
    }
});
