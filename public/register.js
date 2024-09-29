import { db } from './firebaseConfig.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 회원가입 폼 이벤트 핸들러
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // 비밀번호 해싱 (간단한 해싱 예시)
        const hashedPassword = hashPassword(password);

        // Firestore에 사용자 아이디와 해싱된 비밀번호 저장
        await setDoc(doc(db, 'users', userId), {
            password: hashedPassword
        });

        alert('회원가입 성공! 이제 로그인하세요.');
        window.location.href = 'index.html'; // 회원가입 성공 후 로그인 페이지로 리디렉션
    } catch (error) {
        errorMessage.textContent = '회원가입 실패: ' + error.message;
    }
});

// 비밀번호 해싱 함수
function hashPassword(password) {
    // 간단한 해싱 예시 (실제로는 더 안전한 해싱 알고리즘을 사용해야 합니다)
    return btoa(password); // Base64 인코딩을 이용한 해싱
}
