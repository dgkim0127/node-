import { db } from './firebaseConfig.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firestore에서 아이디로 사용자 정보 조회
async function getUserByUserId(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return userDoc.data(); // 사용자 정보 반환 (비밀번호 포함)
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
        // 아이디로 사용자 정보 조회
        const user = await getUserByUserId(userId);

        // 해싱된 비밀번호와 비교 (여기서는 단순 예시, 실제로는 해시된 비밀번호 사용)
        if (user.password === hashPassword(password)) {
            alert(`로그인 성공: ${userId}`);
            window.location.href = 'dashboard.html'; // 로그인 성공 후 리디렉션
        } else {
            throw new Error("비밀번호가 일치하지 않습니다.");
        }
    } catch (error) {
        errorMessage.textContent = "로그인 실패: " + error.message;
    }
});

// 비밀번호 해싱 함수
function hashPassword(password) {
    // 간단한 해싱 예시 (실제 해싱 알고리즘은 더 복잡해야 합니다)
    return btoa(password); // Base64 인코딩을 이용한 해싱
}
