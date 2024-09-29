import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 회원가입 폼 제출 시 처리
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Firestore에서 동일한 아이디가 있는지 확인
        const userRef = doc(db, 'users', username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }

        // 새로운 사용자 추가
        await setDoc(doc(db, 'users', username), {
            username: username,
            password: password
        });

        alert('회원가입 성공!');
        window.location.href = 'login.html';  // 회원가입 후 로그인 페이지로 이동
    } catch (error) {
        // 오류 처리
        document.getElementById('error-message').textContent = `회원가입 오류: ${error.message}`;
    }
});
