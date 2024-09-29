import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// 회원가입 폼 이벤트 핸들러
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');

    if (password !== confirmPassword) {
        errorMessage.textContent = "비밀번호가 일치하지 않습니다.";
        return;
    }

    try {
        // Firebase Authentication에 새 사용자 등록
        const userCredential = await createUserWithEmailAndPassword(auth, `${userId}@example.com`, password);
        const user = userCredential.user;

        // Firestore에 사용자 정보 저장
        await setDoc(doc(db, 'users', userId), {
            uid: user.uid,
            createdAt: new Date(),
        });

        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        window.location.href = 'index.html'; // 로그인 페이지로 리디렉션

    } catch (error) {
        errorMessage.textContent = '회원가입 실패: ' + error.message;
    }
});
