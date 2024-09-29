import { auth } from './firebaseConfig.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// 로그인한 사용자 환영 메시지
const user = auth.currentUser;
const welcomeMessage = document.getElementById('welcomeMessage');

if (user) {
    welcomeMessage.textContent = `환영합니다, ${user.email}!`;
} else {
    welcomeMessage.textContent = '로그인이 필요합니다.';
}

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
