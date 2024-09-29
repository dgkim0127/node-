const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로로 접속하면 로그인 페이지 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 로그인 페이지
});

// 메인 페이지 경로 설정
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html')); // 로그인 후 이동할 메인 페이지
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
