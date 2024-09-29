import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js';

const db = getFirestore();

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // Firestore에 아이디와 해시된 비밀번호 저장
        await addDoc(collection(db, 'users'), {
            userId: userId,
            password: hashedPassword
        });

        alert('회원가입 성공!');
        window.location.href = 'login.html'; // 성공 시 로그인 페이지로 이동
    } catch (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
});
