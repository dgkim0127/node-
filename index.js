const express = require('express');
const path = require('path');
const app = express();

// 정적 파일을 제공
app.use(express.static(path.join(__dirname, 'public')));

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
