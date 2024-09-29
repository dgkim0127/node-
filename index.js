const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Firebase Authentication 관련 초기화 (예: Firebase Admin SDK 등)
// 여기에 Firebase 초기화 코드를 추가하세요

// 로그인 여부를 확인하는 미들웨어 (예시)
app.get('/', (req, res) => {
    // 여기에 Firebase 또는 세션을 통해 로그인 여부를 확인하는 로직을 넣습니다
    const isLoggedIn = false; // 예시: 실제로는 Firebase를 사용하여 사용자 로그인 상태를 확인

    if (isLoggedIn) {
        // 로그인된 상태면 메인 페이지로 리디렉션
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // 로그인되지 않은 상태면 로그인 페이지로 리디렉션
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// 기타 라우트 처리 (회원가입 페이지 등)
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
