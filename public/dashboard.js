import { auth } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// 로그인 상태를 지속적으로 추적
onAuthStateChanged(auth, (user) => {
    const welcomeMessage = document.getElementById('welcomeMessage');

    if (user) {
        // 사용자가 로그인 상태일 때 환영 메시지 표시
        welcomeMessage.textContent = `환영합니다, ${user.email}!`;
    } else {
        // 사용자가 로그인되지 않았을 때 처리
        welcomeMessage.textContent = '로그인이 필요합니다.';
        window.location.href = 'index.html'; // 로그인 페이지로 리디렉션
    }
});

// 로그아웃 기능
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('로그아웃 성공');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
    }
});
