const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로('/')로 들어오면 무조건 로그인 페이지로 리디렉션
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // 로그인 페이지로 리디렉션
});

// 회원가입 페이지 라우트
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// 메인 페이지 라우트 (로그인 후 리디렉션될 페이지)
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
