import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js';

const db = getFirestore();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        // Firestore에서 아이디로 사용자 찾기
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('해당 아이디가 존재하지 않습니다.');
        }

        let userData = {};
        querySnapshot.forEach((doc) => {
            userData = doc.data();
        });

        // 입력된 비밀번호와 저장된 해시된 비밀번호 비교
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            throw new Error('비밀번호가 잘못되었습니다.');
        }

        // 로그인 성공 후 대시보드로 이동
        alert('로그인 성공!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});
