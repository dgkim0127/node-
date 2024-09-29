import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 로그인 폼 이벤트 리스너
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Firestore에서 사용자 정보 가져오기
        const userRef = doc(db, 'users', username);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('아이디를 찾을 수 없습니다.');
        }

        const userData = userDoc.data();

        // 비밀번호 확인
        if (userData.password !== password) {
            throw new Error('비밀번호가 틀렸습니다.');
        }

        alert('로그인 성공!');
        window.location.href = 'index.html';  // 로그인 후 메인 페이지로 이동
    } catch (error) {
        // 오류 처리
        document.getElementById('error-message').textContent = `로그인 오류: ${error.message}`;
    }
});
